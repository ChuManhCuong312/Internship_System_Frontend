import React from "react";

const ReportStats = ({ report }) => {
  if (!report) return null;

  return (
    <div className="stats-row">
      <div className="stat-card">
        <div>
          <h4>Tổng số thực tập sinh</h4>
          <p className="stat-value">{report.totalInterns ?? 0}</p>
        </div>
      </div>
      <div className="stat-card">
        <div>
          <h4>Số thực tập sinh đã được đánh giá</h4>
          <p className="stat-value">{report.internsWithEvaluations ?? 0}</p>
        </div>
      </div>
      <div className="stat-card">
        <div>
          <h4>Điểm trung bình cuối kỳ</h4>
          <p className="stat-value">
            {report.avgFinalScore != null
              ? report.avgFinalScore.toFixed(2)
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportStats;
