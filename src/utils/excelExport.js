import ExcelJS from "exceljs";

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
