import ExcelJS from "exceljs";

export const exportToCSV = (header, rows, filename = "data.csv") => {
  if (!Array.isArray(header) || !Array.isArray(rows)) {
    throw new Error("Dữ liệu CSV không hợp lệ");
  }

  const toCsvRow = (values) =>
    values
      .map((value) => {
        const safe = String(value ?? "").replace(/"/g, '""');
        return `"${safe}` + `"`;
      })
      .join(",");

  const csvContent = [toCsvRow(header), ...rows.map((r) => toCsvRow(r))].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportTableToExcel = async (
  header,
  rows,
  filename = "data.xlsx",
  sheetName = "Dữ liệu"
) => {
  if (!Array.isArray(header) || !Array.isArray(rows)) {
    throw new Error("Dữ liệu Excel không hợp lệ");
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Thêm header
  const headerRow = worksheet.addRow(header);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF667eea" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "center" };

  // Thêm dữ liệu
  rows.forEach((row, index) => {
    const excelRow = worksheet.addRow(row);

    // Zebra rows
    if (index % 2 === 0) {
      excelRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF5F7FA" },
      };
    }
  });

  // Auto fit độ rộng cột tương đối
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, cellValue.length);
    });
    column.width = maxLength + 2;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const exportAllowancesToExcel = async (allowances, filename = "Trợ_cấp.xlsx") => {
  try {
    // Validate input
    if (!Array.isArray(allowances)) {
      throw new Error("Dữ liệu không hợp lệ: allowances phải là một mảng");
    }

    if (allowances.length === 0) {
      throw new Error("Không có dữ liệu để xuất");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Trợ cấp");

    // Sort allowances by ID descending (cao đến thấp)
    const sortedAllowances = [...allowances].sort((a, b) => b.allowanceId - a.allowanceId);

    // Set column widths
    worksheet.columns = [
      { header: "STT", key: "stt", width: 8 },
      { header: "ID", key: "allowanceId", width: 10 },
      { header: "Tên Thực tập sinh", key: "internName", width: 20 },
      { header: "Loại trợ cấp", key: "type", width: 15 },
      { header: "Số tiền (VND)", key: "amount", width: 18 },
      { header: "Ngày áp dụng", key: "dateApplied", width: 15 },
      { header: "Ghi chú", key: "note", width: 30 },
    ];

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF667eea" },
    };
    headerRow.alignment = { horizontal: "center", vertical: "center" };

    // Add data rows
    sortedAllowances.forEach((allowance, index) => {
      const row = worksheet.addRow({
        stt: index + 1,
        allowanceId: allowance.allowanceId,
        internName: allowance.internName || "",
        type: allowance.type,
        amount: allowance.amount,
        dateApplied: new Date(allowance.dateApplied),
        note: allowance.note || "",
      });

      // Alternate row colors
      if (index % 2 === 0) {
        row.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF5F7FA" },
        };
      }

      // Format amount column as currency
      row.getCell("amount").numFmt = '#,##0';
      row.getCell("amount").alignment = { horizontal: "right" };

      // Format date column
      row.getCell("dateApplied").numFmt = 'dd/mm/yyyy';
      row.getCell("dateApplied").alignment = { horizontal: "center" };

      // Center align other columns
      row.getCell("stt").alignment = { horizontal: "center" };
      row.getCell("allowanceId").alignment = { horizontal: "center" };
      row.getCell("internName").alignment = { horizontal: "left" };
      row.getCell("type").alignment = { horizontal: "center" };
    });

    // Add summary row
    const summaryRow = worksheet.addRow({});
    summaryRow.getCell("type").value = "Tổng cộng:";
    summaryRow.getCell("type").font = { bold: true };
    summaryRow.getCell("amount").value = allowances.reduce((sum, a) => sum + a.amount, 0);
    summaryRow.getCell("amount").font = { bold: true };
    summaryRow.getCell("amount").numFmt = '#,##0';
    summaryRow.getCell("amount").alignment = { horizontal: "right" };
    summaryRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE8E8FF" },
    };

    // Generate file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
};
