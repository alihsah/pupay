import { useEffect, useState } from "react";

import {
  getPayments,
  updatePaymentStatus,
} from "../../services/paymentService";

import { getCollections } from "../../services/collectionService";

import {
  PaymentFilters,
  PaymentStatusCard,
  PaymentTable,
  PaymentStatusConfirmModal,
} from "../../components/payments";

import { Toast } from "../../components/ui";
import "../../styles/pages/admin/Payments.css";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [collections, setCollections] = useState([]);

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
  const [collectionFilter, setCollectionFilter] = useState("all");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [nextPaymentStatus, setNextPaymentStatus] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadPageData = async (showPageLoading = true) => {
    try {
      if (showPageLoading) {
        setLoading(true);
      }

      const [paymentData, collectionData] = await Promise.all([
        getPayments(),
        getCollections(),
      ]);

      setPayments(paymentData);
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

   const openStatusConfirmModal = (payment, nextStatus) => {
    setSelectedPayment(payment);
    setNextPaymentStatus(nextStatus);
    setConfirmText("");
  };

  const closeStatusConfirmModal = () => {
    setSelectedPayment(null);
    setNextPaymentStatus("");
    setConfirmText("");
    setIsUpdatingStatus(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedPayment || !nextPaymentStatus) return;

    try {
      setIsUpdatingStatus(true);

      const amountPaid =
        nextPaymentStatus === "paid" ? selectedPayment.amount_due : 0;

      await updatePaymentStatus(selectedPayment.id, {
        status: nextPaymentStatus,
        amount_paid: Number(amountPaid),
        payment_method: selectedPayment.payment_method || "cash",
        reference_number: selectedPayment.reference_number || "",
        remarks: selectedPayment.remarks || "",
      });

      setMessage(`Payment marked as ${nextPaymentStatus}.`);
      setMessageType("success");

      closeStatusConfirmModal();
      loadPageData(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update payment.");
      setMessageType("error");
      setIsUpdatingStatus(false);
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

      const matchesCollection =
      collectionFilter === "all" ||
      String(payment.collection_id) === String(collectionFilter);

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
        matchesCollection &&
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
        </div>

        <PaymentFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          collections={collections}
          collectionFilter={collectionFilter}
          setCollectionFilter={setCollectionFilter}
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
            onUpdateStatus={openStatusConfirmModal}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        )}

        <PaymentStatusConfirmModal
          payment={selectedPayment}
          nextStatus={nextPaymentStatus}
          confirmText={confirmText}
          setConfirmText={setConfirmText}
          isUpdating={isUpdatingStatus}
          onClose={closeStatusConfirmModal}
          onConfirm={handleUpdateStatus}
          formatCurrency={formatCurrency}
        />
      </section>
    </main>
  );
}

export default AdminPayments;