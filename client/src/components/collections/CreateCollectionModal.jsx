import { useEffect, useMemo, useState } from "react";
import { Modal } from "../ui";
import { countTargetStudents } from "../../services/studentService";

const COURSES = ["ALL", "BSIT", "BSHM", "BSOA", "BSCPE"];
const YEARS = ["ALL", "1st Year", "2nd Year", "3rd Year", "4th Year"];
const SECTIONS = ["ALL", "1", "2"];

function CreateCollectionModal({ 
  formData, 
  onChange, 
  onSubmit, 
  onClose,
  isCreating,
 }) {
  const [matchingStudents, setMatchingStudents] = useState(0);
  const [isCountingStudents, setIsCountingStudents] = useState(false);

  useEffect(() => {
    const loadMatchingStudents = async () => {
      try {
        setIsCountingStudents(true);

        const result = await countTargetStudents({
          course: formData.course,
          year_level: formData.year_level,
          section: formData.section,
        });

        setMatchingStudents(result.total);
      } catch (error) {
        setMatchingStudents(0);
      } finally {
        setIsCountingStudents(false);
      }
    };

    loadMatchingStudents();
  }, [formData.course, formData.year_level, formData.section]);

  const estimatedContribution = useMemo(() => {
    const goalAmount = Number(formData.goal_amount || 0);

    if (!goalAmount || !matchingStudents) {
      return 0;
    }

    return goalAmount / matchingStudents;
  }, [formData.goal_amount, matchingStudents]);

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });
  };
  return (
    <Modal
      title="Create Collection"
      subtitle="Create a collection goal for selected students."
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

        <div className="form-group">
          <label>Split Preview</label>

          <div className="collection-split-preview-input">
            {isCountingStudents ? (
              <>
                <strong>Calculating...</strong>
                <span>Checking matching active students.</span>
              </>
            ) : (
              <>
                <strong>
                  {matchingStudents > 0
                    ? `${formatCurrency(estimatedContribution)} each`
                    : "No matching students"}
                </strong>

                <span>
                  {matchingStudents > 0
                    ? `${matchingStudents} active student${
                        matchingStudents === 1 ? "" : "s"
                      } matched`
                    : "Choose a valid course, year, and section target."}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="form-group full-span">
          
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            placeholder="Describe what this collection is for."
            rows="1"
          />
        </div>

        <div className="collection-auto-note full-span">
          Student contribution will be automatically calculated based on the
          number of matching active students.
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" type="button" onClick={onClose}>
            Cancel
          </button>

          <button
            className="primary-btn"
            type="submit"
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create Collection"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateCollectionModal;