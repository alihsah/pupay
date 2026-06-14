import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getCollections,
  updateCollectionStatus,
} from "../../services/collectionService";

import {
  getAnnouncements,
  updateAnnouncementStatus,
} from "../../services/announcementService";

import { Toast } from "../../components/ui";

import "../../styles/pages/admin/Archives.css";

const COURSES = ["BSIT", "BSHM", "BSOA", "BSCPE"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SECTIONS = ["1", "2"];
const ANNOUNCEMENT_TYPES = ["general", "payment_reminder", "deadline"];

function AdminArchives() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("collections");

  const [archivedCollections, setArchivedCollections] = useState([]);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState([]);

  const [loading, setLoading] = useState(true);
  const [restoringCollectionId, setRestoringCollectionId] = useState(null);
  const [restoringAnnouncementId, setRestoringAnnouncementId] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  const loadArchives = async (showPageLoading = true) => {
    try {
      if (showPageLoading) {
        setLoading(true);
      }

      const [collections, announcements] = await Promise.all([
        getCollections(),
        getAnnouncements(),
      ]);

      setArchivedCollections(
        collections.filter((collection) => collection.status === "archived")
      );

      setArchivedAnnouncements(
        announcements.filter((announcement) => announcement.status === "archived")
      );
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load archives.");
      setMessageType("error");
    } finally {
      if (showPageLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadArchives(true);
  }, []);

  const resetFilters = () => {
    setSearchTerm("");
    setCourseFilter("all");
    setYearFilter("all");
    setSectionFilter("all");
    setTypeFilter("all");
    setSortOption("newest");
  };

  const handleChangeTab = (tab) => {
    setActiveTab(tab);
    resetFilters();
  };

  const handleRestoreCollection = async (collection) => {
    try {
      setRestoringCollectionId(collection.id);

      await updateCollectionStatus(collection.id, "active", { restore: true });

      setMessage("Collection restored successfully.");
      setMessageType("success");

      loadArchives(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to restore collection.");
      setMessageType("error");
    } finally {
      setRestoringCollectionId(null);
    }
  };

  const handleRestoreAnnouncement = async (announcement) => {
    try {
      setRestoringAnnouncementId(announcement.id);

      await updateAnnouncementStatus(announcement.id, "active");

      setMessage("Announcement restored successfully.");
      setMessageType("success");

      loadArchives(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to restore announcement.");
      setMessageType("error");
    } finally {
      setRestoringAnnouncementId(null);
    }
  };

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });
  };

  const formatDate = (date) => {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAudience = (item) => {
    if (
      item.course === "ALL" &&
      item.year_level === "ALL" &&
      item.section === "ALL"
    ) {
      return "All Students";
    }

    const parts = [];

    if (item.course !== "ALL") parts.push(item.course);
    if (item.year_level !== "ALL") parts.push(item.year_level);
    if (item.section !== "ALL") parts.push(`Section ${item.section}`);

    return parts.join(" • ");
  };

  const formatAnnouncementType = (type) => {
    if (!type) return "General";

    return type
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const filteredCollections = archivedCollections
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

      return matchesSearch && matchesCourse && matchesYear && matchesSection;
    })
    .sort((a, b) => {
      if (sortOption === "title-az") return a.title.localeCompare(b.title);
      if (sortOption === "title-za") return b.title.localeCompare(a.title);
      if (sortOption === "oldest") return new Date(a.created_at) - new Date(b.created_at);
      if (sortOption === "due-soon") return new Date(a.due_date) - new Date(b.due_date);

      return new Date(b.created_at) - new Date(a.created_at);
    });

  const filteredAnnouncements = archivedAnnouncements
    .filter((announcement) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        announcement.title?.toLowerCase().includes(searchValue) ||
        announcement.message?.toLowerCase().includes(searchValue);

      const matchesType =
        typeFilter === "all" || announcement.type === typeFilter;

      const matchesCourse =
        courseFilter === "all" || announcement.course === courseFilter;

      const matchesYear =
        yearFilter === "all" || announcement.year_level === yearFilter;

      const matchesSection =
        sectionFilter === "all" || announcement.section === sectionFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesCourse &&
        matchesYear &&
        matchesSection
      );
    })
    .sort((a, b) => {
      if (sortOption === "title-az") return a.title.localeCompare(b.title);
      if (sortOption === "title-za") return b.title.localeCompare(a.title);
      if (sortOption === "oldest") return new Date(a.created_at) - new Date(b.created_at);

      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <main className="archives-page">
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      />

      <section className="archives-panel">
        <div className="archives-panel-header">
          <div>
            <h2>Archives</h2>
            <p>View and restore archived collections and announcements.</p>
          </div>
        </div>

        <div className="archives-tabs">
          <button
            className={activeTab === "collections" ? "active" : ""}
            type="button"
            onClick={() => handleChangeTab("collections")}
          >
            Archived Collections
            <span>{archivedCollections.length}</span>
          </button>

          <button
            className={activeTab === "announcements" ? "active" : ""}
            type="button"
            onClick={() => handleChangeTab("announcements")}
          >
            Archived Announcements
            <span>{archivedAnnouncements.length}</span>
          </button>
        </div>

        <div className="archives-toolbar">
          <div className="filter-group search-group">
            <label>Search</label>
            <input
              type="text"
              placeholder={
                activeTab === "collections"
                  ? "Search archived collections..."
                  : "Search archived announcements..."
              }
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="archives-filters-row">
            {activeTab === "announcements" && (
              <div className="filter-group">
                <label>Type</label>
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                >
                  <option value="all">All Types</option>
                  {ANNOUNCEMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {formatAnnouncementType(type)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="filter-group">
              <label>Course</label>
              <select
                value={courseFilter}
                onChange={(event) => setCourseFilter(event.target.value)}
              >
                <option value="all">All Courses</option>
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
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
                    {year}
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
                    Section {section}
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
                <option value="title-az">Title A-Z</option>
                <option value="title-za">Title Z-A</option>
                {activeTab === "collections" && (
                  <option value="due-soon">Due Date Soonest</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <p>Loading archives...</p>
        ) : activeTab === "collections" ? (
          <div className="archives-card-grid">
            {filteredCollections.map((collection) => (
              <article className="archive-card" key={collection.id}>
                <div className="archive-card-header">
                  <div>
                    <h3>{collection.title}</h3>
                    <p>{collection.description || "No description provided."}</p>
                  </div>

                  <span className="status-pill archived">Archived</span>
                </div>

                <div className="archive-card-meta">
                  <div>
                    <span>Target Amount</span>
                    <strong>{formatCurrency(collection.goal_amount)}</strong>
                  </div>

                  <div>
                    <span>Contribution</span>
                    <strong>{formatCurrency(collection.amount)}</strong>
                  </div>

                  <div>
                    <span>Due Date</span>
                    <strong>{formatDate(collection.due_date)}</strong>
                  </div>

                  <div>
                    <span>Audience</span>
                    <strong>{formatAudience(collection)}</strong>
                  </div>
                </div>

                <div className="archive-card-actions">
                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() => navigate(`/admin/collections/${collection.id}`)}
                  >
                    View Details
                  </button>

                  <button
                    className="primary-btn"
                    type="button"
                    onClick={() => handleRestoreCollection(collection)}
                    disabled={restoringCollectionId === collection.id}
                  >
                    {restoringCollectionId === collection.id
                      ? "Restoring..."
                      : "Restore"}
                  </button>
                </div>
              </article>
            ))}

            {filteredCollections.length === 0 && (
              <div className="archives-empty-state">
                <h3>No archived collections found</h3>
                <p>Archived collections will appear here when you archive them.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="archives-card-grid">
            {filteredAnnouncements.map((announcement) => (
              <article className="archive-card" key={announcement.id}>
                <div className="archive-card-header">
                  <div>
                    <h3>{announcement.title}</h3>
                    <p>{announcement.message || "No message provided."}</p>
                  </div>

                  <span className="status-pill archived">Archived</span>
                </div>

                <div className="archive-card-meta">
                  <div>
                    <span>Type</span>
                    <strong>{formatAnnouncementType(announcement.type)}</strong>
                  </div>

                  <div>
                    <span>Audience</span>
                    <strong>{formatAudience(announcement)}</strong>
                  </div>

                  <div>
                    <span>Created</span>
                    <strong>{formatDate(announcement.created_at)}</strong>
                  </div>

                  <div>
                    <span>Status</span>
                    <strong>Archived</strong>
                  </div>
                </div>

                <div className="archive-card-actions">
                  <button
                    className="primary-btn"
                    type="button"
                    onClick={() => handleRestoreAnnouncement(announcement)}
                    disabled={restoringAnnouncementId === announcement.id}
                  >
                    {restoringAnnouncementId === announcement.id
                      ? "Restoring..."
                      : "Restore"}
                  </button>
                </div>
              </article>
            ))}

            {filteredAnnouncements.length === 0 && (
              <div className="archives-empty-state">
                <h3>No archived announcements found</h3>
                <p>Archived announcements will appear here when you archive them.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminArchives;
