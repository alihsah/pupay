function AnnouncementFilters({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  sortOption,
  setSortOption,
}) {
  return (
    <div className="announcements-toolbar">
      <div className="filter-group search-group">
        <label>Search</label>
        <input
          type="text"
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="announcements-filters-row">
        <div className="filter-group">
          <label>Type</label>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="payment_reminder">Payment Reminder</option>
            <option value="deadline">Deadline</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sort By</label>
          <select value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title-az">Title A-Z</option>
            <option value="title-za">Title Z-A</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default AnnouncementFilters;