import React from "react";

const ReportFilters = ({
  programs,
  pendingSearchKeyword,
  setPendingSearchKeyword,
  pendingProgramId,
  setPendingProgramId,
  pendingMajor,
  setPendingMajor,
  pendingTeamName,
  setPendingTeamName,
  pendingMentorName,
  setPendingMentorName,
  majorOptions,
  mentorOptions,
  teams,
  sortedTeams,
  report,
  loading,
  token,
  exporting,
  handleSearchReport,
  handleExport,
  handleClearFilters,
  setSelectedTeamId,
  setTeams,
}) => {
  return (
    <>
      <div className="filter-container">
        <div className="filter-row">
          <div className="filter-group">
            <label>Tìm kiếm (tên / SĐT / email)</label>
            <input
              type="text"
              value={pendingSearchKeyword}
              onChange={(e) => setPendingSearchKeyword(e.target.value)}
              placeholder="Nhập tên, SĐT hoặc email"
            />
          </div>
          <div className="filter-group">
            <label>Chương trình</label>
            <select
              value={pendingProgramId}
              onChange={(e) => {
                const value = e.target.value;
                setPendingProgramId(value);
                setSelectedTeamId("");
                setPendingTeamName("");
                setTeams([]);
              }}
            >
              <option value="">-- Tất cả chương trình --</option>
              {programs.map((p) => (
                <option key={p.programId} value={p.programId}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Ngành (tuỳ chọn)</label>
            <select
              value={pendingMajor}
              onChange={(e) => setPendingMajor(e.target.value)}
              disabled={!report?.interns?.length}
            >
              <option value="">-- Tất cả ngành --</option>
              {majorOptions.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Team (tuỳ chọn)</label>
            <select
              value={pendingTeamName}
              onChange={(e) => {
                const name = e.target.value;
                setPendingTeamName(name);
                const team = sortedTeams.find((t, idx) => {
                  const generatedName = `Team ${idx + 1}`;
                  return generatedName === name;
                });
                setSelectedTeamId(team ? team.teamId : "");
              }}
              disabled={!teams.length}
            >
              <option value="">-- Tất cả team --</option>
              {sortedTeams.map((t, idx) => {
                const name = `Team ${idx + 1}`;
                return (
                  <option key={t.teamId} value={name}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="filter-group">
            <label>Mentor (tuỳ chọn)</label>
            <select
              value={pendingMentorName}
              onChange={(e) => setPendingMentorName(e.target.value)}
              disabled={!report?.interns?.length}
            >
              <option value="">-- Tất cả mentor --</option>
              {mentorOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-actions">
            <button
              className="btn-filter-apply"
              onClick={() => handleSearchReport(false)}
              disabled={loading || !token}
            >
              {loading ? "Đang tải..." : "Tìm kiếm"}
            </button>
            <button
              className="btn-filter-apply"
              onClick={handleExport}
              disabled={exporting || !report}
            >
              {exporting ? "Đang xuất..." : "Xuất Excel"}
            </button>
          </div>
        </div>
        <div className="clear-filter-container">
          <button className="clear-filter-btn" onClick={handleClearFilters}>
            ✖ Clear filter
          </button>
        </div>
      </div>
    </>
  );
};

export default ReportFilters;
