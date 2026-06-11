function PaymentFilters({
  searchTerm,
  setSearchTerm,
  courseFilter,
  setCourseFilter,
  yearFilter,
  setYearFilter,
  sectionFilter,
  setSectionFilter,
  statusFilter,
  setStatusFilter,
  methodFilter,
  setMethodFilter,
  sortOption,
  setSortOption,
}) {
  const COURSES = ["BSIT", "BSHM", "BSOA", "BSCPE"];
  const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const SECTIONS = ["1", "2"];

  return (
    <div className="payments-toolbar">
      <div className="filter-group search-group">
        <label>Search</label>
        <input
          type="text"
          placeholder="Search student, collection, or reference..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="payments-filters-row">
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
          <label>Status</label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Method</label>
          <select
            value={methodFilter}
            onChange={(event) => setMethodFilter(event.target.value)}
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="gcash">GCash</option>
            <option value="card">Card</option>
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
            <option value="student-az">Student A-Z</option>
            <option value="collection-az">Collection A-Z</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default PaymentFilters;