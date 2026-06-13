import { Modal } from "../ui";

const COURSES = ["ALL", "BSIT", "BSHM", "BSOA", "BSCPE"];
const YEARS = ["ALL", "1st Year", "2nd Year", "3rd Year", "4th Year"];
const SECTIONS = ["ALL", "1", "2"];

function AnnouncementModal({
  mode = "create",
  formData,
  onChange,
  onSubmit,
  onClose,
  isSubmitting = false,
}) {
  const isEdit = mode === "edit";

  return (
    <Modal
      title={isEdit ? "Edit Announcement" : "Create Announcement"}
      subtitle={
        isEdit
          ? "Update this announcement and its target audience."
          : "Create an announcement for all students or a specific group."
      }
      onClose={onClose}
    >
      <form className="announcements-form modal-form" onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            name="title"
            value={formData.title}
            onChange={onChange}
            placeholder="Example: Payment Reminder"
            required
          />
        </div>

        <div className="form-group">
          <label>Type</label>
          <select name="type" value={formData.type} onChange={onChange}>
            <option value="general">General</option>
            <option value="payment_reminder">Payment Reminder</option>
            <option value="deadline">Deadline</option>
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
          <select name="year_level" value={formData.year_level} onChange={onChange}>
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

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={onChange}>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="form-group full-span">
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={onChange}
            placeholder="Write the announcement message..."
            rows="5"
            required
          />
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" type="button" onClick={onClose}>
            Cancel
          </button>

          <button
            className="primary-btn"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
                ? "Save Changes"
                : "Create Announcement"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AnnouncementModal;