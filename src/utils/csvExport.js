const buildCsvRow = (values = []) =>
  values
    .map((value) => {
      if (value === null || value === undefined) return "";
      const stringValue = String(value);
      if (/[",\n]/.test(stringValue)) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    })
    .join(",");

export const exportAttendanceCsv = (
  records = [],
  {
    viewMode = "date",
    selectedDate,
    selectedMonth,
    selectedYear,
    filename,
  } = {}
) => {
  if (!records.length) {
    throw new Error("Không có dữ liệu để xuất.");
  }

  const computedFilename =
    filename ||
    (viewMode === "date"
      ? `attendance_${selectedDate || "date"}.csv`
      : `attendance_${selectedYear || "year"}-${selectedMonth || "month"}.csv`);

  const headers =
    viewMode === "date"
      ? [
          "Thực tập sinh",
          "Ngày",
          "Check-in",
          "Check-out",
          "Giờ làm (phút)",
          "Trạng thái",
        ]
      : [
          "Thực tập sinh",
          "Ngày làm",
          "Ngày muộn",
          "Tổng phút làm",
          "Giờ trung bình (phút)",
          "Tỷ lệ đúng giờ (%)",
        ];

  const dataRows =
    viewMode === "date"
      ? records.map((record) =>
          buildCsvRow([
            record.internName,
            record.date,
            record.checkIn,
            record.checkOut,
            record.workingMinutes,
            record.status,
          ])
        )
      : records.map((record) =>
          buildCsvRow([
            record.internName,
            record.workingDays,
            record.lateDays,
            record.totalWorkingMinutes,
            record.avgWorkingMinutes,
            record.punctualityRate,
          ])
        );

  const csvContent = [buildCsvRow(headers), ...dataRows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", computedFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};


