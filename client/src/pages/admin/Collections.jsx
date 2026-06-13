import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CollectionCard from "../../components/collections/CollectionCard";
import CreateCollectionModal from "../../components/collections/CreateCollectionModal";
import CollectionActionConfirmModal from "../../components/collections/CollectionActionConfirmModal";

import {
  createCollection,
  getCollections,
  getCollectionProgress,
  updateCollection,
  updateCollectionStatus,
} from "../../services/collectionService";

import Modal from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";

import "../../styles/pages/admin/Collections.css";

const emptyCollectionForm = {
  title: "",
  description: "",
  goal_amount: "",
  course: "ALL",
  year_level: "ALL",
  section: "ALL",
  due_date: "",
  status: "active",
};

const COURSES = ["ALL", "BSIT", "BSHM", "BSOA", "BSCPE"];
const YEARS = ["ALL", "1st Year", "2nd Year", "3rd Year", "4th Year"];
const SECTIONS = ["ALL", "1", "2"];
const STATUSES = ["active", "closed", "archived"];

function AdminCollections() {
  const navigate = useNavigate();
  
  const [collections, setCollections] = useState([]);
  const [collectionProgress, setCollectionProgress] = useState({});
  const [formData, setFormData] = useState(emptyCollectionForm);
  const [editingCollection, setEditingCollection] = useState(null);
  const [showCollectionForm, setShowCollectionForm] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(emptyCollectionForm);

  const [loading, setLoading] = useState(true);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isUpdatingCollection, setIsUpdatingCollection] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  const [selectedCollectionAction, setSelectedCollectionAction] = useState(null);
  const [nextCollectionStatus, setNextCollectionStatus] = useState("");
  const [collectionConfirmText, setCollectionConfirmText] = useState("");
  const [isUpdatingCollectionStatus, setIsUpdatingCollectionStatus] = useState(false);

  const loadCollections = async (showPageLoading = true) => {
    try {
      if (showPageLoading) {
        setLoading(true);
      }

      const data = await getCollections();
      setCollections(data);

      const progressResults = await Promise.all(
        data.map(async (collection) => {
          const progress = await getCollectionProgress(collection.id);
          return [collection.id, progress];
        })
      );

      setCollectionProgress(Object.fromEntries(progressResults));
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load collections.");
      setMessageType("error");
    } finally {
      if (showPageLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCollections(true);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(emptyCollectionForm);
    setEditingCollection(null);
    setShowCollectionForm(false);
    setShowEditModal(false);
    setEditFormData(emptyCollectionForm);
  };

  const handleEdit = (collection) => {
    setEditingCollection(collection);

    setEditFormData({
      title: collection.title || "",
      description: collection.description || "",
      goal_amount: collection.goal_amount || "",
      course: collection.course || "ALL",
      year_level: collection.year_level || "ALL",
      section: collection.section || "ALL",
      due_date: collection.due_date ? String(collection.due_date).slice(0, 10) : "",
      status: collection.status || "active",
    });

    setShowEditModal(true);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingCollection) return;

    try {
      setIsUpdatingCollection(true);

      const payload = {
        ...editFormData,
        goal_amount: Number(editFormData.goal_amount),
      };

      await updateCollection(editingCollection.id, payload);

      setMessage("Collection updated successfully.");
      setMessageType("success");

      setShowEditModal(false);
      setEditingCollection(null);
      setEditFormData(emptyCollectionForm);

      loadCollections(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update collection.");
      setMessageType("error");
    } finally {
      setIsUpdatingCollection(false);
    }
  };

  const openCollectionActionConfirm = (collection, nextStatus) => {
    if (nextStatus === "archived") {
      setSelectedCollectionAction(collection);
      setNextCollectionStatus("archive");
      setCollectionConfirmText("");
      return;
    }

    if (nextStatus === "closed") {
      setSelectedCollectionAction(collection);
      setNextCollectionStatus("close");
      setCollectionConfirmText("");
      return;
    }

    handleStatusChange(collection, nextStatus);
  };

  const closeCollectionActionConfirm = () => {
    setSelectedCollectionAction(null);
    setNextCollectionStatus("");
    setCollectionConfirmText("");
    setIsUpdatingCollectionStatus(false);
  };

  const handleStatusChange = async (collection, nextStatus) => {
    try {
      setIsUpdatingCollectionStatus(true);

      await updateCollectionStatus(collection.id, nextStatus);

      setMessage(`Collection marked as ${nextStatus}.`);
      setMessageType("success");

      closeCollectionActionConfirm();
      loadCollections(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update status.");
      setMessageType("error");
      setIsUpdatingCollectionStatus(false);
    }
  };

  const handleConfirmCollectionAction = async () => {
    if (!selectedCollectionAction || !nextCollectionStatus) return;

    const statusMap = {
      close: "closed",
      archive: "archived",
    };

    await handleStatusChange(
      selectedCollectionAction,
      statusMap[nextCollectionStatus]
    );
  };

  const formatAudience = (collection) => {
    if (
      collection.course === "ALL" &&
      collection.year_level === "ALL" &&
      collection.section === "ALL"
    ) {
      return "All Students";
    }

    const parts = [];

    if (collection.course !== "ALL") parts.push(collection.course);
    if (collection.year_level !== "ALL") parts.push(collection.year_level);
    if (collection.section !== "ALL") parts.push(`Section ${collection.section}`);

    return parts.join(" • ");
  };

  const formatCurrency = (amount) => {
    return Number(amount).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });
  };

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCollections = collections
    .filter((collection) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        collection.title?.toLowerCase().includes(searchValue) ||
        collection.description?.toLowerCase().includes(searchValue);

      const matchesCourse =
        courseFilter === "all" || collection.course === courseFilter;

      const matchesYear =
        yearFilter === "all" || collection.year_level === yearFilter;

      const matchesSection =
        sectionFilter === "all" || collection.section === sectionFilter;

      const matchesStatus =
        statusFilter === "all" || collection.status === statusFilter;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesYear &&
        matchesSection &&
        matchesStatus
      );
    })
    .sort((a, b) => {
      if (sortOption === "title-az") {
        return a.title.localeCompare(b.title);
      }

      if (sortOption === "title-za") {
        return b.title.localeCompare(a.title);
      }

      if (sortOption === "due-soon") {
        return new Date(a.due_date) - new Date(b.due_date);
      }

      if (sortOption === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });

  const totalCollections = collections.length;
  const activeCollections = collections.filter((c) => c.status === "active").length;
  const closedCollections = collections.filter((c) => c.status === "closed").length;
  const archivedCollections = collections.filter((c) => c.status === "archived").length;

  return (
    <main className="collections-page">
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      />
      <section className="collections-summary-grid">
        <article className="collection-summary-card">
          <span>Total Collections</span>
          <strong>{totalCollections}</strong>
        </article>

        <article className="collection-summary-card">
          <span>Active</span>
          <strong>{activeCollections}</strong>
        </article>

        <article className="collection-summary-card">
          <span>Closed</span>
          <strong>{closedCollections}</strong>
        </article>

        <article className="collection-summary-card">
          <span>Archived</span>
          <strong>{archivedCollections}</strong>
        </article>
      </section>

      <section className="collections-panel">
       <div className="collections-panel-header">
          <div>
            <h2>Collection Records</h2>
            <p>Track active, closed, and archived payment collections.</p>
          </div>

          <div className="header-actions">
            <button
              className="primary-btn"
              type="button"
              onClick={() => setShowCollectionForm(true)}
            >
              New Collection
            </button>
          </div>
        </div>

        <div className="collections-toolbar">
          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="filters-row">
            <div className="filter-group">
              <label>Course</label>
              <select
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
              >
                <option value="all">All Courses</option>
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course === "ALL" ? "All Students" : course}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Year Level</label>
              <select
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
              >
                <option value="all">All Years</option>
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year === "ALL" ? "All Years" : year}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Section</label>
              <select
                value={sectionFilter}
                onChange={(event) => setSectionFilter(event.target.value)}
              >
                <option value="all">All Sections</option>
                {SECTIONS.map((section) => (
                  <option key={section} value={section}>
                    {section === "ALL" ? "All Sections" : `Section ${section}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All Status</option>
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="due-soon">Due Date Soonest</option>
                <option value="title-az">Title A-Z</option>
                <option value="title-za">Title Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <p>Loading collections...</p>
        ) : (
          <div className="admin-collections-card-grid">
            {filteredCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                progress={collectionProgress[collection.id]}
                onOpen={() => navigate(`/admin/collections/${collection.id}`)}
                onEdit={() => handleEdit(collection)}
                onStatusChange={openCollectionActionConfirm}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                formatAudience={formatAudience}
              />
            ))}

            {filteredCollections.length === 0 && (
              <div className="collections-empty-state">
                <h3>No collections found</h3>
                <p>Try changing your search, filters, or sort option.</p>
              </div>
            )}
          </div>
        )}
      </section>

      {showCollectionForm && (
        <CreateCollectionModal
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={resetForm}
          isCreating={isCreatingCollection}
        />
      )}

      {showEditModal && (
        <Modal
          title="Edit Collection"
          subtitle="Update this collection's details and assigned student group."
          onClose={resetForm}
        >
          <form className="collections-form modal-form" onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label>Collection Title</label>
              <input
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                placeholder="Example: Class Fund"
                required
              />
            </div>

            <div className="form-group">
              <label>Target Amount</label>
              <input
                name="goal_amount"
                value={editFormData.goal_amount}
                onChange={handleEditChange}
                placeholder="Example: 3000"
                type="number"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Due Date</label>
              <input
                name="due_date"
                value={editFormData.due_date}
                onChange={handleEditChange}
                type="date"
                required
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={editFormData.status}
                onChange={handleEditChange}
              >
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="form-group">
              <label>Course</label>
              <select
                name="course"
                value={editFormData.course}
                onChange={handleEditChange}
              >
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course === "ALL" ? "All Courses" : course}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Year Level</label>
              <select
                name="year_level"
                value={editFormData.year_level}
                onChange={handleEditChange}
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year === "ALL" ? "All Years" : year}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Section</label>
              <select
                name="section"
                value={editFormData.section}
                onChange={handleEditChange}
              >
                {SECTIONS.map((section) => (
                  <option key={section} value={section}>
                    {section === "ALL" ? "All Sections" : `Section ${section}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                placeholder="Describe what this collection is for."
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                type="button"
                onClick={resetForm}
                disabled={isUpdatingCollection}
              >
                Cancel
              </button>

              <button
                className="primary-btn"
                type="submit"
                disabled={isUpdatingCollection}
              >
                {isUpdatingCollection ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <CollectionActionConfirmModal
        collection={selectedCollectionAction}
        action={nextCollectionStatus}
        confirmText={collectionConfirmText}
        setConfirmText={setCollectionConfirmText}
        isUpdating={isUpdatingCollectionStatus}
        onClose={closeCollectionActionConfirm}
        onConfirm={handleConfirmCollectionAction}
      />
    </main>
  );
};
export default AdminCollections;