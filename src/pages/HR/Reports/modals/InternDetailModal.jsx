import React from "react";
import Modal from "../../../../components/Layout/Modal";

const InternDetailModal = ({ selectedIntern, onClose }) => {
  if (!selectedIntern) return null;

  return (
    <Modal title="Chi tiết đánh giá" onClose={onClose}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 4,
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "stretch",
            marginTop: 6,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                backgroundColor: "#ffffff",
                height: "100%",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: 8,
                }}
              >
                Thông tin chi tiết
              </h4>
              <p
                style={{
                  margin: "2px 0 8px",
                  fontSize: 14,
                  color: "#4b5563",
                  lineHeight: 1.5,
                }}
              >
                Chương trình: {selectedIntern.programName || "-"}
              </p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  columnGap: 14,
                  rowGap: 6,
                }}
              >
                <p style={{ margin: 0, fontSize: 15, color: "#111827", lineHeight: 1.5 }}>
                  <strong>Họ tên:</strong> {selectedIntern.fullName || "-"}
                </p>
                <p style={{ margin: 0, fontSize: 15, color: "#111827", lineHeight: 1.5 }}>
                  <strong>Email:</strong> {selectedIntern.email || "-"}
                </p>
                <p style={{ margin: 0, fontSize: 15, color: "#111827", lineHeight: 1.5 }}>
                  <strong>SĐT:</strong> {selectedIntern.phone || "-"}
                </p>
                <p style={{ margin: 0, fontSize: 15, color: "#111827", lineHeight: 1.5 }}>
                  <strong>Trường:</strong> {selectedIntern.school || "-"}
                </p>
                <p style={{ margin: 0, fontSize: 15, color: "#111827", lineHeight: 1.5 }}>
                  <strong>Ngành:</strong> {selectedIntern.major || "-"}
                </p>
                <p style={{ margin: 0, fontSize: 15, color: "#111827", lineHeight: 1.5 }}>
                  <strong>Chương trình:</strong> {selectedIntern.programName || "-"}
                </p>
                <p style={{ margin: 0, fontSize: 15, color: "#111827", lineHeight: 1.5 }}>
                  <strong>Team:</strong> {selectedIntern.teamName || "-"}
                </p>
                <p style={{ margin: 0, fontSize: 15, color: "#111827", lineHeight: 1.5 }}>
                  <strong>Mentor:</strong> {selectedIntern.mentorName || "-"}
                </p>
              </div>
            </div>
          </div>

          <div
            style={{
              flex: 1,
              padding: "10px 12px",
              borderRadius: 16,
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 10,
              }}
            >
              Thống kê đánh giá
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  backgroundColor: "#eff6ff",
                  border: "1px solid #dbeafe",
                  fontSize: 13,
                }}
              >
                <div style={{ color: "#1d4ed8", marginBottom: 4, fontSize: 14 }}>
                  Số lần đánh giá
                </div>
                <div style={{ fontWeight: 700, color: "#1d4ed8", fontSize: 18 }}>
                  {selectedIntern.evaluationCount ?? 0}
                </div>
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  backgroundColor: "#eff6ff",
                  border: "1px solid #dbeafe",
                  fontSize: 13,
                }}
              >
                <div style={{ color: "#1d4ed8", marginBottom: 4, fontSize: 14 }}>Điểm kỹ thuật</div>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: 18 }}>
                  {selectedIntern.avgTechnical != null
                    ? selectedIntern.avgTechnical.toFixed(2)
                    : "-"}
                </div>
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  backgroundColor: "#eff6ff",
                  border: "1px solid #dbeafe",
                  fontSize: 13,
                }}
              >
                <div style={{ color: "#1d4ed8", marginBottom: 4, fontSize: 14 }}>Giao tiếp</div>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: 18 }}>
                  {selectedIntern.avgCommunication != null
                    ? selectedIntern.avgCommunication.toFixed(2)
                    : "-"}
                </div>
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  backgroundColor: "#eff6ff",
                  border: "1px solid #dbeafe",
                  fontSize: 13,
                }}
              >
                <div style={{ color: "#1d4ed8", marginBottom: 4, fontSize: 14 }}>Kỷ luật</div>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: 18 }}>
                  {selectedIntern.avgDiscipline != null
                    ? selectedIntern.avgDiscipline.toFixed(2)
                    : "-"}
                </div>
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  backgroundColor: "#eff6ff",
                  border: "1px solid #dbeafe",
                  fontSize: 13,
                }}
              >
                <div style={{ color: "#1d4ed8", marginBottom: 4, fontSize: 14 }}>Thái độ</div>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: 18 }}>
                  {selectedIntern.avgAttitude != null
                    ? selectedIntern.avgAttitude.toFixed(2)
                    : "-"}
                </div>
              </div>

              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: 14,
                  backgroundColor: "#eff6ff",
                  border: "1px solid #dbeafe",
                  fontSize: 13,
                }}
              >
                <div style={{ color: "#1d4ed8", marginBottom: 4, fontSize: 14 }}>Điểm cuối kỳ</div>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: 20 }}>
                  {selectedIntern.finalScore != null
                    ? selectedIntern.finalScore.toFixed(2)
                    : "-"}
                </div>
              </div>
            </div>

          </div>
        </div>
        <div
          style={{
            marginTop: 12,
          }}
        >
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <h4
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 4,
              }}
            >
              Ghi chú đánh giá
            </h4>

            <div>
              <h5
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                Ghi chú gần nhất
              </h5>
              <div
                style={{
                  padding: "8px 10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  backgroundColor: "#f9fafb",
                  minHeight: 40,
                  fontSize: 15,
                  color: "#111827",
                  lineHeight: 1.6,
                }}
              >
                {selectedIntern.latestNote || "Không có ghi chú"}
              </div>
            </div>

            <div>
              <h5
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                Tất cả ghi chú
              </h5>
              <div
                style={{
                  padding: "8px 10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: 8,
                  backgroundColor: "#f9fafb",
                  minHeight: 60,
                  whiteSpace: "pre-line",
                  fontSize: 15,
                  color: "#111827",
                  lineHeight: 1.6,
                }}
              >
                {selectedIntern.allNotes || "Không có ghi chú"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InternDetailModal;
