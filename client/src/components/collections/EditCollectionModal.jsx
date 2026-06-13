import { Modal } from "../ui";

const COURSES = ["ALL", "BSIT", "BSHM", "BSOA", "BSCPE"];
const YEARS = ["ALL", "1st Year", "2nd Year", "3rd Year", "4th Year"];
const SECTIONS = ["ALL", "1", "2"];

function EditCollectionModal({
  formData,
  onChange,
  onSubmit,
  onClose,
  isUpdating = false,
}) {
  return (
    <Modal
      title="Edit Collection"
      subtitle="Update this collection and its target audience."
      onClose={onClose}
    >
      <form className="collections-form modal-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label>Collection Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="Example: Class Fund"
            required
          />
        </div>

        <div className="form-group">
          <label>Goal Amount</label>
          <input
            name="goal_amount"
            value={formData.goal_amount}
            onChange={onChange}
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
            value={formData.due_date}
            onChange={onChange}
            type="date"
            required
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={onChange}>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="form-group">
          <label>Course</label>
          <select name="course" value={formData.course} onChange={onChange}>
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
            value={formData.year_level}
            onChange={onChange}
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
          <select name="section" value={formData.section} onChange={onChange}>
            {SECTIONS.map((section) => (
              <option key={section} value={section}>
                {section === "ALL" ? "All Sections" : `Section ${section}`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group full-span">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Describe what this collection is for."
            rows="2"
          />
        </div>

        <div className="modal-actions">
          <button
            className="secondary-btn"
            type="button"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </button>

          <button
            className="primary-btn"
            type="submit"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditCollectionModal;