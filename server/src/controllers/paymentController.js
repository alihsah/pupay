import db from "../config/db.js";
import axios from "axios";
import crypto from "crypto";
import {
  getCollectionLockState,
  syncCollectionLockStatus,
} from "../services/collectionLockService.js";

const parsePayMongoSignature = (signatureHeader) => {
  if (!signatureHeader) return null;

  return signatureHeader.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");

    if (key && value !== undefined) {
      acc[key.trim()] = value.trim();
    }

    return acc;
  }, {});
};

const verifyPayMongoSignature = (req) => {
  const signatureHeader = req.headers["paymongo-signature"];
  const rawBody = req.rawBody;
  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

  if (!signatureHeader || !rawBody || !webhookSecret) {
    return false;
  }

  const parsedSignature = parsePayMongoSignature(signatureHeader);

  if (!parsedSignature?.t) {
    return false;
  }

  const payloadToSign = `${parsedSignature.t}.${rawBody}`;

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(payloadToSign)
    .digest("hex");

  const isLiveMode = req.body?.data?.attributes?.livemode === true;
  const receivedSignature = isLiveMode
    ? parsedSignature.li
    : parsedSignature.te;

  if (!receivedSignature) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedSignature, "hex");
  const receivedBuffer = Buffer.from(receivedSignature, "hex");

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
};

export const handlePayMongoWebhook = async (req, res) => {
  try {
    const isValidSignature = verifyPayMongoSignature(req);

    if (!isValidSignature) {
      return res.status(401).json({
        message: "Invalid PayMongo webhook signature.",
      });
    }

    const event = req.body?.data;

    if (!event) {
      return res.status(400).json({
        message: "Invalid webhook payload.",
      });
    }

    const eventType = event.attributes?.type;

    if (eventType !== "checkout_session.payment.paid") {
      return res.status(200).json({
        message: "Webhook received but ignored.",
        eventType,
      });
    }

    const checkoutSession = event.attributes?.data;
    const checkoutSessionId = checkoutSession?.id;
    const metadata = checkoutSession?.attributes?.metadata;

    const paymentId = metadata?.payment_id;

    if (!paymentId) {
      return res.status(400).json({
        message: "Missing payment_id in webhook metadata.",
      });
    }

    const [payments] = await db.query(
      `
      SELECT id, collection_id, amount_due
      FROM payments
      WHERE id = ?
      `,
      [paymentId]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        message: "Payment record not found.",
      });
    }

    const payment = payments[0];

    await db.query(
      `
      UPDATE payments
      SET
        status = 'paid',
        amount_paid = ?,
        payment_method = 'card',
        reference_number = ?,
        remarks = ?,
        paid_at = NOW()
      WHERE id = ?
      `,
      [
        payment.amount_due,
        checkoutSessionId || null,
        "Paid through PayMongo Checkout",
        payment.id,
      ]
    );

    await syncCollectionLockStatus(payment.collection_id);

    return res.status(200).json({
      message: "Payment updated from PayMongo webhook.",
      paymentId: payment.id,
    });
  } catch (error) {
    console.error("PayMongo webhook error:", error);

    return res.status(500).json({
      message: "Failed to process PayMongo webhook.",
    });
  }
};

export const getAllPayments = async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT
        payments.id,
        payments.student_id,
        payments.collection_id,
        payments.amount_due,
        payments.amount_paid,
        payments.status,
        payments.payment_method,
        payments.reference_number,
        payments.remarks,
        payments.paid_at,
        payments.created_at,
        payments.updated_at,

        students.student_number,
        students.full_name,
        students.personal_email,
        students.course,
        students.year_level,
        students.section,

        collections.title AS collection_title,
        collections.due_date
      FROM payments
      JOIN students ON payments.student_id = students.id
      JOIN collections ON payments.collection_id = collections.id
      ORDER BY payments.created_at DESC
    `);

    res.status(200).json(payments);
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({ message: "Failed to retrieve payments." });
  }
};

export const getPaymentsByCollectionId = async (req, res) => {
  try {
    const { collectionId } = req.params;

    const [payments] = await db.query(
      `
      SELECT
        payments.id,
        payments.student_id,
        payments.collection_id,
        payments.amount_due,
        payments.amount_paid,
        payments.status,
        payments.payment_method,
        payments.reference_number,
        payments.remarks,
        payments.paid_at,
        payments.created_at,
        payments.updated_at,

        students.student_number,
        students.full_name,
        students.personal_email,
        students.course,
        students.year_level,
        students.section,

        collections.title AS collection_title,
        collections.amount AS collection_amount,
        collections.due_date
      FROM payments
      JOIN students ON payments.student_id = students.id
      JOIN collections ON payments.collection_id = collections.id
      WHERE payments.collection_id = ?
      ORDER BY students.full_name ASC
      `,
      [collectionId]
    );

    res.status(200).json(payments);
  } catch (error) {
    console.error("Get collection payments error:", error);
    res.status(500).json({
      message: "Failed to retrieve collection payments.",
    });
  }
};

export const getPaymentsByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [payments] = await db.query(
      `
      SELECT
        payments.id,
        payments.student_id,
        payments.collection_id,
        payments.amount_due,
        payments.amount_paid,
        payments.status,
        payments.payment_method,
        payments.reference_number,
        payments.remarks,
        payments.paid_at,
        payments.created_at,
        payments.updated_at,

        collections.title AS collection_title,
        collections.description AS collection_description,
        collections.due_date,
        collections.status AS collection_status,
        collections.is_locked AS collection_is_locked
      FROM payments
      JOIN collections ON payments.collection_id = collections.id
      WHERE payments.student_id = ?
      ORDER BY collections.due_date ASC
      `,
      [studentId]
    );

    res.status(200).json(payments);
  } catch (error) {
    console.error("Get student payments error:", error);
    res.status(500).json({ message: "Failed to retrieve student payments." });
  }
};

export const createPayment = async (req, res) => {
  try {
    const {
      student_id,
      collection_id,
      amount_due,
      amount_paid = 0,
      status = "pending",
      payment_method = "cash",
      reference_number,
      remarks,
      paid_at,
    } = req.body;

    if (!student_id || !collection_id || !amount_due) {
      return res.status(400).json({
        message: "Student, collection, and amount due are required.",
      });
    }

    if (!["pending", "paid", "overdue"].includes(status)) {
      return res.status(400).json({
        message: "Status must be pending, paid, or overdue.",
      });
    }

    if (!["cash", "gcash", "card"].includes(payment_method)) {
      return res.status(400).json({
        message: "Payment method must be cash, gcash, or card.",
      });
    }

    await db.query(
      `
      INSERT INTO payments (
        student_id,
        collection_id,
        amount_due,
        amount_paid,
        status,
        payment_method,
        reference_number,
        remarks,
        paid_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        student_id,
        collection_id,
        amount_due,
        amount_paid,
        status,
        payment_method,
        reference_number || null,
        remarks || null,
        paid_at || null,
      ]
    );

    res.status(201).json({ message: "Payment record created successfully." });
  } catch (error) {
    console.error("Create payment error:", error);
    res.status(500).json({ message: "Failed to create payment." });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      amount_paid,
      payment_method = "cash",
      reference_number,
      remarks,
    } = req.body;

    if (!["pending", "paid", "overdue"].includes(status)) {
      return res.status(400).json({
        message: "Status must be pending, paid, or overdue.",
      });
    }

    if (!["cash", "gcash", "card"].includes(payment_method)) {
      return res.status(400).json({
        message: "Payment method must be cash, gcash, or card.",
      });
    }

    const [existingPayments] = await db.query(
      `
      SELECT id, collection_id, amount_due
      FROM payments
      WHERE id = ?
      `,
      [id]
    );

    if (existingPayments.length === 0) {
      return res.status(404).json({
        message: "Payment record not found.",
      });
    }

    const existingPayment = existingPayments[0];

    const finalAmountPaid = status === "paid" ? Number(amount_paid || 0) : 0;
    const paidAt = status === "paid" ? new Date() : null;


    await db.query(
      `
      UPDATE payments
      SET
        status = ?,
        amount_paid = ?,
        payment_method = ?,
        reference_number = ?,
        remarks = ?,
        paid_at = ?
      WHERE id = ?
      `,
      [
        status,
        finalAmountPaid,
        payment_method,
        reference_number || null,
        remarks || null,
        paidAt,
        id,
      ]
    );

    await syncCollectionLockStatus(existingPayment.collection_id);

    res.status(200).json({ message: "Payment status updated successfully." });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ message: "Failed to update payment status." });
  }
};

export const createPayMongoCheckout = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const [payments] = await db.query(
      `
      SELECT
        payments.id,
        payments.student_id,
        payments.collection_id,
        payments.amount_due,
        payments.amount_paid,
        payments.status,

        students.full_name,
        students.personal_email,

        collections.title AS collection_title,
        collections.status AS collection_status,
        collections.is_locked AS collection_is_locked
      FROM payments
      JOIN students ON payments.student_id = students.id
      JOIN collections ON payments.collection_id = collections.id
      WHERE payments.id = ?
      `,
      [paymentId]
    );

    if (payments.length === 0) {
      return res.status(404).json({
        message: "Payment record not found.",
      });
    }

    const payment = payments[0];

    if (payment.status === "paid") {
      return res.status(400).json({
        message: "This payment is already marked as paid.",
      });
    }

    const lockState = await getCollectionLockState(payment.collection_id);

    if (lockState?.shouldLock) {
      await syncCollectionLockStatus(payment.collection_id);
    }

    const isCollectionLocked =
      lockState?.shouldLock || Number(payment.collection_is_locked || 0) === 1;

    if (payment.collection_status !== "active" || isCollectionLocked) {
      return res.status(400).json({
        message: "This collection is closed for payments.",
      });
    }

    const amountToPay = Number(payment.amount_due) - Number(payment.amount_paid || 0);

    if (amountToPay <= 0) {
      return res.status(400).json({
        message: "No remaining amount to pay.",
      });
    }

    const amountInCentavos = Math.round(amountToPay * 100);

    const authHeader = Buffer.from(
      `${process.env.PAYMONGO_SECRET_KEY}:`
    ).toString("base64");

    const checkoutResponse = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            line_items: [
              {
                currency: "PHP",
                amount: amountInCentavos,
                name: payment.collection_title,
                quantity: 1,
              },
            ],
            payment_method_types: ["card", "gcash"],
            success_url: `${process.env.CLIENT_URL}/student/payments?payment=success`,
            cancel_url: `${process.env.CLIENT_URL}/student/payments?payment=cancelled`,
            description: `PUPay payment for ${payment.full_name}`,
            metadata: {
              payment_id: String(payment.id),
              student_id: String(payment.student_id),
              collection_id: String(payment.collection_id),
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
      }
    );

    const checkoutUrl = checkoutResponse.data.data.attributes.checkout_url;

    await db.query(
      `
      UPDATE payments
      SET
        payment_method = 'card',
        reference_number = ?
      WHERE id = ?
      `,
      [checkoutResponse.data.data.id, payment.id]
    );

    res.status(200).json({
      message: "Checkout session created successfully.",
      checkoutUrl,
      checkoutSessionId: checkoutResponse.data.data.id,
    });
  } catch (error) {
    console.error(
      "Create PayMongo checkout error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Failed to create PayMongo checkout session.",
      error: error.response?.data || error.message,
    });
  }
};
