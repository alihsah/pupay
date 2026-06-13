import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  updateAnnouncementStatus,
} from "../../services/announcementService";

import {
  AnnouncementFilters,
  AnnouncementDetailsModal,
  AnnouncementModal,
  AnnouncementTable,
} from "../../components/announcements";

import { Toast } from "../../components/ui";

import "../../styles/pages/admin/Announcements.css";

const emptyForm = {
  title: "",
  message: "",
  type: "general",
  course: "ALL",
  year_level: "ALL",
  section: "ALL",
  status: "active",
};

function AdminAnnouncements() {
  const location = useLocation();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const [loading, setLoading] = useState(true);
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false);
  const [isUpdatingAnnouncement, setIsUpdatingAnnouncement] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  const loadAnnouncements = async (showPageLoading = true) => {
    try {
      if (showPageLoading) {
        setLoading(true);
      }

      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load announcements.");
      setMessageType("error");
    } finally {
      if (showPageLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAnnouncements(true);
  }, []);

  useEffect(() => {
    const aiDraft = location.state?.aiDraft;

    if (!aiDraft) return;

    const collection = location.state?.selectedCollection || {};

    setFormData({
      title: collection.title
        ? `Payment Reminder: ${collection.title}`
        : "Payment Reminder",
      message: aiDraft,
      type: "payment_reminder",
      course: collection.course || "ALL",
      year_level: collection.year_level || "ALL",
      section: collection.section || "ALL",
      status: "active",
    });
    setEditingAnnouncement(null);
    setModalMode("create");
    setShowModal(true);
    setMessage("AI draft loaded. Review before creating the announcement.");
    setMessageType("success");

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetModal = () => {
    setFormData(emptyForm);
    setEditingAnnouncement(null);
    setModalMode("create");
    setShowModal(false);
  };

  const openCreateModal = () => {
    setFormData(emptyForm);
    setEditingAnnouncement(null);
    setModalMode("create");
    setShowModal(true);
  };

  const openEditModal = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title || "",
      message: announcement.message || "",
      type: announcement.type || "general",
      course: announcement.course || "ALL",
      year_level: announcement.year_level || "ALL",
      section: announcement.section || "ALL",
      status: announcement.status || "active",
    });
    setModalMode("edit");
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (modalMode === "edit" && editingAnnouncement) {
        setIsUpdatingAnnouncement(true);

        await updateAnnouncement(editingAnnouncement.id, formData);

        setMessage("Announcement updated successfully.");
        setMessageType("success");
      } else {
        setIsCreatingAnnouncement(true);

        await createAnnouncement(formData);

        setMessage("Announcement created successfully.");
        setMessageType("success");
      }

      resetModal();
      loadAnnouncements(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save announcement.");
      setMessageType("error");
    } finally {
      setIsCreatingAnnouncement(false);
      setIsUpdatingAnnouncement(false);
    }
  };

  const handleArchive = async (announcement) => {
    try {
      await updateAnnouncementStatus(announcement.id, "archived");
      setMessage("Announcement archived successfully.");
      setMessageType("success");
      loadAnnouncements(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to archive announcement.");
      setMessageType("error");
    }
  };

  const handleRestore = async (announcement) => {
    try {
      await updateAnnouncementStatus(announcement.id, "active");
      setMessage("Announcement restored successfully.");
      setMessageType("success");
      loadAnnouncements(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to restore announcement.");
      setMessageType("error");
    }
  };

  const formatAudience = (announcement) => {
    if (
      announcement.course === "ALL" &&
      announcement.year_level === "ALL" &&
      announcement.section === "ALL"
    ) {
      return "All Students";
    }

    const parts = [];

    if (announcement.course !== "ALL") parts.push(announcement.course);
    if (announcement.year_level !== "ALL") parts.push(announcement.year_level);
    if (announcement.section !== "ALL") parts.push(`Section ${announcement.section}`);

    return parts.join(" / ");
  };

  const formatType = (type) => {
    if (type === "payment_reminder") return "Payment Reminder";
    if (type === "deadline") return "Deadline";
    return "General";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredAnnouncements = announcements
    .filter((announcement) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        announcement.title?.toLowerCase().includes(searchValue) ||
        announcement.message?.toLowerCase().includes(searchValue);

      const matchesType =
        typeFilter === "all" || announcement.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" || announcement.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOption === "title-az") return a.title.localeCompare(b.title);
      if (sortOption === "title-za") return b.title.localeCompare(a.title);
      if (sortOption === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const totalAnnouncements = announcements.length;
  const activeAnnouncements = announcements.filter((item) => item.status === "active").length;
  const archivedAnnouncements = announcements.filter((item) => item.status === "archived").length;

  return (
    <main className="announcements-page">
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      />

      <section className="announcements-summary-grid">
        <article className="announcement-summary-card">
          <span>Total Announcements</span>
          <strong>{totalAnnouncements}</strong>
        </article>

        <article className="announcement-summary-card">
          <span>Active</span>
          <strong>{activeAnnouncements}</strong>
        </article>

        <article className="announcement-summary-card">
          <span>Archived</span>
          <strong>{archivedAnnouncements}</strong>
        </article>
      </section>

      <section className="announcements-panel">
        <div className="announcements-panel-header">
          <div>
            <h2>Announcement Records</h2>
            <p>Create reminders and updates for selected student groups.</p>
          </div>

          <button className="primary-btn" type="button" onClick={openCreateModal}>
            New Announcement
          </button>
        </div>

        <AnnouncementFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />

        {loading ? (
          <p>Loading announcements...</p>
        ) : (
          <AnnouncementTable
            announcements={filteredAnnouncements}
            onView={setSelectedAnnouncement}
            onEdit={openEditModal}
            onArchive={handleArchive}
            onRestore={handleRestore}
            formatAudience={formatAudience}
            formatDate={formatDate}
            formatType={formatType}
          />
        )}
      </section>

      {selectedAnnouncement && (
        <AnnouncementDetailsModal
          announcement={selectedAnnouncement}
          formatAudience={formatAudience}
          formatDate={formatDate}
          formatType={formatType}
          onClose={() => setSelectedAnnouncement(null)}
          showAudience
          showStatus
        />
      )}

      {showModal && (
        <AnnouncementModal
          mode={modalMode}
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={resetModal}
          isSubmitting={
            modalMode === "edit"
              ? isUpdatingAnnouncement
              : isCreatingAnnouncement
          }
        />
      )}
    </main>
  );
}

export default AdminAnnouncements;
