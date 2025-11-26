import React from "react";

const AttendanceTable = ({
  mode,
  records,
  formatDate,
  formatTime,
  getStatusBadge,
  calculateWorkingMinutes,
}) => {
  return (
    <div className="table-container">
      <table className="attendance-table">
        <thead>
          <tr>
            {mode === "daily" ? (
              <>
                <th>Thực tập sinh</th>
                <th>Chương trình</th>
                <th>Ngày</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Phút làm việc</th>
                <th>Trạng thái</th>
              </>
            ) : (
              <>
                <th>Thực tập sinh</th>
                <th>Chương trình</th>
                <th>Ngày có chấm công</th>
                <th>Ngày làm theo lịch</th>
                <th>Ngày vắng</th>
                <th>Ngày đi muộn</th>
                <th>Ngày thiếu giờ</th>
                <th>Ngày đủ giờ</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {records && records.length > 0 ? (
            records.map((record, index) => {
              const name =
                record.internName ||
                record.fullName ||
                record.name ||
                record.intern_name ||
                "--";
              const key =
                record.attendanceId ||
                record.id ||
                record.internId ||
                index;

              if (mode === "daily") {
                const workingMinutes = calculateWorkingMinutes(record);
                const status = record.status;
                const programName = record.programName || "--";
                return (
                  <tr key={key}>
                    <td>{name}</td>
                    <td>{programName}</td>
                    <td>{formatDate(record.date)}</td>
                    <td>
                      <span className="time-cell">
                        {formatTime(record.checkIn)}
                      </span>
                    </td>
                    <td>
                      <span className="time-cell">
                        {formatTime(record.checkOut)}
                      </span>
                    </td>
                    <td>{workingMinutes != null ? workingMinutes : "--"}</td>
                    <td>{getStatusBadge(status)}</td>
                  </tr>
                );
              }

              const programName = record.programName || "--";
              const totalDays =
                record.totalDays != null ? record.totalDays : 0;
              const workingDays =
                record.workingDays != null ? record.workingDays : 0;
              const absentDays =
                record.absentDays != null ? record.absentDays : 0;
              const lateDays =
                record.lateDays != null ? record.lateDays : 0;
              const insufficientDays =
                record.insufficientDays != null
                  ? record.insufficientDays
                  : 0;
              const sufficientDays =
                record.sufficientDays != null ? record.sufficientDays : 0;

              return (
                <tr key={key}>
                  <td>{name}</td>
                  <td>{programName}</td>
                  <td>{totalDays}</td>
                  <td>{workingDays}</td>
                  <td>{absentDays}</td>
                  <td>{lateDays}</td>
                  <td>{insufficientDays}</td>
                  <td>{sufficientDays}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={mode === "daily" ? 7 : 8} className="no-data">
                Chưa có dữ liệu chấm công
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceTable;
