import { Search } from "lucide-react";

const FilterSection = ({
  searchTerm,
  setSearchTerm,
  filterDepartment,
  setFilterDepartment,
  filterMentor,
  setFilterMentor,
  allDepartments,
  assignedMentors,
  onResetFilters,
}) => {
  const hasActiveFilters = searchTerm || filterDepartment !== "all-departments" || filterMentor !== "all-mentors";

  return (
    <div className="card filter-card">
      <div className="filter-content">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Tìm chương trình theo tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-grid">
          <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="select">
            <option value="all-departments">Lọc theo phòng ban</option>
            {allDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select value={filterMentor} onChange={(e) => setFilterMentor(e.target.value)} className="select">
            <option value="all-mentors">Lọc theo mentor</option>
            {assignedMentors.map((m) => (
              <option key={m.mentorId} value={m.mentorId}>
                {m.fullName}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="filter-actions">
            <button className="btn btn-secondary btn-small" onClick={onResetFilters}>
              Bỏ bộ lọc
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSection;