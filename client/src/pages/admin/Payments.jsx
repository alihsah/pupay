import { useEffect, useState } from "react";

import {
  createPayment,
  getPayments,
  updatePaymentStatus,
} from "../../services/paymentService";

import { getStudents } from "../../services/studentService";
import { getCollections } from "../../services/collectionService";

import {
  PaymentFilters,
  PaymentModal,
  PaymentStatusCard,
  PaymentTable,
} from "../../components/payments";

import { Toast } from "../../components/ui";
import "../../styles/pages/admin/Payments.css";

const emptyPaymentForm = {
  student_id: "",
  collection_id: "",
  amount_due: "",
  amount_paid: 0,
  status: "pending",
  payment_method: "cash",
  reference_number: "",
  remarks: "",
};

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [collections, setCollections] = useState([]);

  const [formData, setFormData] = useState(emptyPaymentForm);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [courseFilter, setCourseFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");

  const loadPageData = async (showPageLoading = true) => {
    try {
      if (showPageLoading) {
        setLoading(true);
      }

      const [paymentData, studentData, collectionData] = await Promise.all([
        getPayments(),
        getStudents(),
        getCollections(),
      ]);

      setPayments(paymentData);
      setStudents(studentData);
      setCollections(collectionData);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load payments.");
      setMessageType("error");
    } finally {
      if (showPageLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadPageData(true);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "collection_id") {
      const selectedCollection = collections.find(
        (collection) => String(collection.id) === String(value)
      );

      setFormData((prev) => ({
        ...prev,
        collection_id: value,
        amount_due: selectedCollection?.amount || prev.amount_due,
      }));

      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyPaymentForm);
    setShowPaymentModal(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const payload = {
        ...formData,
        student_id: Number(formData.student_id),
        collection_id: Number(formData.collection_id),
        amount_due: Number(formData.amount_due),
        amount_paid: Number(formData.amount_paid || 0),
      };

      await createPayment(payload);

      setMessage("Payment record created successfully.");
      setMessageType("success");

      resetForm();
      loadPageData(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create payment.");
      setMessageType("error");
    }
  };

  const handleUpdateStatus = async (payment, nextStatus) => {
    try {
      const amountPaid =
        nextStatus === "paid" ? payment.amount_due : payment.amount_paid || 0;

      await updatePaymentStatus(payment.id, {
        status: nextStatus,
        amount_paid: Number(amountPaid),
        payment_method: payment.payment_method || "cash",
        reference_number: payment.reference_number || "",
        remarks: payment.remarks || "",
      });

      setMessage(`Payment marked as ${nextStatus}.`);
      setMessageType("success");

      loadPageData(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update payment.");
      setMessageType("error");
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPayments = payments
    .filter((payment) => {
      
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        payment.full_name?.toLowerCase().includes(searchValue) ||
        payment.student_number?.toLowerCase().includes(searchValue) ||
        payment.collection_title?.toLowerCase().includes(searchValue) ||
        payment.reference_number?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || payment.status === statusFilter;

      const matchesMethod =
        methodFilter === "all" || payment.payment_method === methodFilter;

      const matchesCourse =
        courseFilter === "all" || payment.course === courseFilter;

      const matchesYear =
        yearFilter === "all" || payment.year_level === yearFilter;

      const matchesSection =
        sectionFilter === "all" || payment.section === sectionFilter;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesYear &&
        matchesSection &&
        matchesStatus &&
        matchesMethod
      );
    })
    .sort((a, b) => {
      if (sortOption === "student-az") {
        return a.full_name.localeCompare(b.full_name);
      }

      if (sortOption === "collection-az") {
        return a.collection_title.localeCompare(b.collection_title);
      }

      if (sortOption === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });

  const totalPayments = payments.length;
  const paidPayments = payments.filter((payment) => payment.status === "paid").length;
  const pendingPayments = payments.filter((payment) => payment.status === "pending").length;
  const overduePayments = payments.filter((payment) => payment.status === "overdue").length;

  return (
    <main className="payments-page">
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      />

      <section className="payments-summary-grid">
        <PaymentStatusCard label="Total Payments" value={totalPayments} />
        <PaymentStatusCard label="Paid" value={paidPayments} />
        <PaymentStatusCard label="Pending" value={pendingPayments} />
        <PaymentStatusCard label="Overdue" value={overduePayments} />
      </section>

      <section className="payments-panel">
        <div className="payments-panel-header">
          <div>
            <h2>Payment Records</h2>
            <p>Track student payments, pending balances, and overdue records.</p>
          </div>

          <button
            className="primary-btn"
            type="button"
            onClick={() => setShowPaymentModal(true)}
          >
            New Payment Record
          </button>
        </div>

        <PaymentFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          sectionFilter={sectionFilter}
          setSectionFilter={setSectionFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          methodFilter={methodFilter}
          setMethodFilter={setMethodFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />

        {loading ? (
          <p>Loading payments...</p>
        ) : (
          <PaymentTable
            payments={filteredPayments}
            onUpdateStatus={handleUpdateStatus}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}
      </section>

      {showPaymentModal && (
        <PaymentModal
          formData={formData}
          students={students}
          collections={collections}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={resetForm}
        />
      )}
    </main>
  );
}

export default AdminPayments;