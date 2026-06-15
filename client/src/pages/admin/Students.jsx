import { useEffect, useState } from "react";

import {
  createStudent,
  getStudents,
  importStudents,
  updateStudent,
} from "../../services/studentService";

import { Modal, Toast } from "../../components/ui";

import "../../styles/pages/admin/Students.css";

const emptyForm = {
  student_number: "",
  full_name: "",
  personal_email: "",
  course: "BSIT",
  year_level: "1st Year",
  section: "1",
  status: "active",
};

function Students() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingStudent, setEditingStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState(emptyForm);

  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);
  const [isImportingStudents, setIsImportingStudents] = useState(false);

  const [isUpdatingStudent, setIsUpdatingStudent] = useState(false);

  const loadStudents = async (showPageLoading = true) => {
    try {
      if (showPageLoading) {
        setLoading(true);
      }

      const data = await getStudents();
      setStudents(data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load students.");
      setMessageType("error");
    } finally {
      if (showPageLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadStudents(true);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleExcelImport = async (event) => {
    event.preventDefault();

    if (!excelFile) {
      setMessage("Please select an Excel file first.");
      setMessageType("error");
      return;
    }

    try {
      setIsImportingStudents(true);

      const result = await importStudents(excelFile);

      setMessage(
        `${result.message} Inserted: ${result.summary.inserted}, Updated: ${result.summary.updated}, Skipped: ${result.summary.skipped}`
      );
      setMessageType("success");

      setExcelFile(null);
      setShowImportModal(false);
      loadStudents(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to import students.");
      setMessageType("error");
    } finally {
      setIsImportingStudents(false);
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
  setFormData(emptyForm);
    setEditingStudent(null);
    setShowAddModal(false);
    setShowEditModal(false);
    setShowImportModal(false);
    setEditFormData(emptyForm);
    setExcelFile(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setIsSubmittingStudent(true);

      await createStudent(formData);

      setMessage("Student added successfully.");
      setMessageType("success");

      resetForm();
      loadStudents(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save student.");
      setMessageType("error");
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);

    setEditFormData({
      student_number: student.student_number || "",
      full_name: student.full_name || "",
      personal_email: student.personal_email || "",
      course: student.course || "BSIT",
      year_level: student.year_level || "1st Year",
      section: student.section || "1",
      status: student.status || "active",
    });

    setShowEditModal(true);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingStudent) return;

    try {
      setIsUpdatingStudent(true);

      await updateStudent(editingStudent.id, editFormData);

      setMessage("Student updated successfully.");
      setMessageType("success");

      setShowEditModal(false);
      setEditingStudent(null);
      setEditFormData(emptyForm);

      loadStudents(false);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update student.");
      setMessageType("error");
    } finally {
      setIsUpdatingStudent(false);
    }
  };

  const formatSection = (student) => {
  const yearMap = {
    "1st Year": "1",
    "2nd Year": "2",
    "3rd Year": "3",
    "4th Year": "4",
  };

    return `${student.course} ${yearMap[student.year_level]}-${student.section}`;
  };

  const COURSES = [
    "BSIT",
    "BSHM",
    "BSOA",
    "BSCPE",
  ];

  const YEARS = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
  ];

  const SECTIONS = [
    "1",
    "2",
  ];

  const filteredStudents = students
    .filter((student) => {
      const searchValue = searchTerm.toLowerCase();

      const matchesSearch =
        student.student_number?.toLowerCase().includes(searchValue) ||
        student.full_name?.toLowerCase().includes(searchValue) ||
        student.personal_email?.toLowerCase().includes(searchValue);

      const matchesCourse =
        courseFilter === "all" || student.course === courseFilter;

      const matchesYear =
        yearFilter === "all" || student.year_level === yearFilter;

      const matchesSection =
        sectionFilter === "all" || student.section === sectionFilter;

      const matchesStatus =
        statusFilter === "all" || student.status === statusFilter;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesYear &&
        matchesSection &&
        matchesStatus
      );
    })
    .sort((a, b) => {
      if (sortOption === "name-az") {
        return a.full_name.localeCompare(b.full_name);
      }

      if (sortOption === "name-za") {
        return b.full_name.localeCompare(a.full_name);
      }

      if (sortOption === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });

  const renderStudentFields = (values, onChange) => (
    <>
      <div className="form-group">
        <label>Student Number</label>
        <input
          name="student_number"
          value={values.student_number}
          onChange={onChange}
          placeholder="2023-123456-PQ-0"
          required
        />
      </div>

      <div className="form-group">
        <label>Full Name</label>
        <input
          name="full_name"
          value={values.full_name}
          onChange={onChange}
          placeholder="LastName, FirstName Initial"
          required
        />
      </div>

      <div className="form-group">
        <label>Personal Email</label>
        <input
          name="personal_email"
          value={values.personal_email}
          onChange={onChange}
          placeholder="student@gmail.com"
          type="email"
          required
        />
      </div>

      <div className="form-group">
        <label>Course</label>
        <select name="course" value={values.course} onChange={onChange}>
          {COURSES.map((course) => (
            <option key={course} value={course}>
              {course}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Year Level</label>
        <select name="year_level" value={values.year_level} onChange={onChange}>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Section</label>
        <select name="section" value={values.section} onChange={onChange}>
          {SECTIONS.map((section) => (
            <option key={section} value={section}>
              Section {section}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Status</label>
        <select name="status" value={values.status} onChange={onChange}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </>
  );

  return (
    <main className="students-page">   
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      /> 

      <div className="students-toolbar">
        <div className="filter-group search-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search in Student Records"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <label>Course</label>
            <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
              <option value="all">All Courses</option>
              {COURSES.map((course) => (
                <option key={course} value={course}>{course}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Year Level</label>
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              <option value="all">All Years</option>
              {YEARS.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Section</label>
            <select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)}>
              <option value="all">All Sections</option>
              {SECTIONS.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name-az">Name A-Z</option>
              <option value="name-za">Name Z-A</option>
            </select>
          </div>
        </div>
      </div>

      <section className="students-panel">
        <div className="students-panel-header">
          <div>
            <h2>Student Records</h2>
            <p>Only students listed here can access student dashboards.</p>
          </div>

          <div className="header-actions">
            <button
              className="secondary-btn"
              type="button"
              onClick={() => setShowImportModal(true)}
            >
              Import Excel
            </button>

            <button
              className="primary-btn"
              type="button"
              onClick={() => setShowAddModal(true)}
            >
              Add Student
            </button>
          </div>
        </div>

        {loading ? (
          <p>Loading students...</p>
        ) : (
          <div className="students-table-wrap">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Student No.</th>
                  <th>Name</th>
                  <th>Emails</th>
                  <th>Program</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>{student.student_number}</td>
                    <td>{student.full_name}</td>
                    <td>
                      <small>{student.personal_email || "No personal email"}</small>
                    </td>
                    <td>
                      <span>{student.course || "N/A"}</span>
                      <small>
                        {formatSection(student)}
                      </small>
                    </td>
                    <td>
                      <span className={`status-pill ${student.status}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div className="students-actions">
                        <button type="button" onClick={() => handleEdit(student)}>
                          Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="6">No students found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showEditModal && (
        <Modal
          title="Edit Student"
          subtitle="Update this student's account verification details."
          onClose={resetForm}
        >
          <form className="students-form modal-form" onSubmit={handleEditSubmit}>
            {renderStudentFields(editFormData, handleEditChange)}

            <div className="modal-actions">
              <button className="secondary-btn" type="button" onClick={resetForm}>
                Cancel
              </button>

              <button
                className="primary-btn"
                type="submit"
                disabled={isUpdatingStudent}
              >
                {isUpdatingStudent ? "Updating..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showAddModal && (
        <Modal
          title="Add Student"
          subtitle="Create a student record for account verification."
          onClose={resetForm}
        >
          <form className="students-form modal-form" onSubmit={handleSubmit}>
            {renderStudentFields(formData, handleChange)}

            <div className="modal-actions">
              <button className="secondary-btn" type="button" onClick={resetForm}>
                Cancel
              </button>

              <button
                className="primary-btn"
                type="submit"
                disabled={isSubmittingStudent}
              >
                {isSubmittingStudent ? "Adding..." : "Add Student"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showImportModal && (
        <Modal
          title="Import Students"
          subtitle="Upload an Excel file with student records."
          onClose={resetForm}
        >
          <form className="students-import-modal-form" onSubmit={handleExcelImport}>
            <div className="form-group">
              <label>Excel File</label>
              <input
                key={excelFile ? "selected-file" : "empty-file"}
                type="file"
                accept=".xlsx,.xls"
                onChange={(event) => setExcelFile(event.target.files[0])}
              />
            </div>

            <div className="students-import-guide">
              <strong>Required columns</strong>
              <span>
                student_number, full_name, personal_email, course, year_level,
                section, status
              </span>
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" type="button" onClick={resetForm}>
                Cancel
              </button>

              <button
                className="primary-btn"
                type="submit"
                disabled={isImportingStudents}
              >
                {isImportingStudents ? "Importing..." : "Import Excel"}
              </button>
            </div>
          </form>
        </Modal>
      )}
            
    </main>
  );
}

export default Students;