import React from "react";
import Modal from "../../../../components/Layout/Modal";

const InternDetailModal = ({ selectedIntern, onClose }) => {
  if (!selectedIntern) return null;

  return (
    <Modal title="Chi tiết đánh giá" onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            borderBottom: "1px solid #e0e0e0",
            paddingBottom: 10,
            marginBottom: 4,
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            Thông tin thực tập sinh
          </h4>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 8,
            rowGap: 4,
          }}
        >
          <p style={{ margin: 0 }}>
            <strong>Họ tên:</strong> {selectedIntern.fullName || "-"}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Email:</strong> {selectedIntern.email || "-"}
          </p>
          <p style={{ margin: 0 }}>
            <strong>SĐT:</strong> {selectedIntern.phone || "-"}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Trường / Ngành:</strong> {selectedIntern.school || "-"} / {" "}
            {selectedIntern.major || "-"}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Chương trình:</strong> {selectedIntern.programName || "-"}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Team / Mentor:</strong> {selectedIntern.teamName || "-"} / {" "}
            {selectedIntern.mentorName || "-"}
          </p>
        </div>

        <div
          style={{
            borderTop: "1px solid #f3f4f6",
            paddingTop: 12,
          }}
        >
          <h4
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 8,
            }}
          >
            Thống kê đánh giá
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 8,
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Số lần đánh giá:</strong> {" "}
              {selectedIntern.evaluationCount ?? 0}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Điểm kỹ thuật:</strong> {" "}
              {selectedIntern.avgTechnical != null
                ? selectedIntern.avgTechnical.toFixed(2)
                : "-"}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Giao tiếp:</strong> {" "}
              {selectedIntern.avgCommunication != null
                ? selectedIntern.avgCommunication.toFixed(2)
                : "-"}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Kỷ luật:</strong> {" "}
              {selectedIntern.avgDiscipline != null
                ? selectedIntern.avgDiscipline.toFixed(2)
                : "-"}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Thái độ:</strong> {" "}
              {selectedIntern.avgAttitude != null
                ? selectedIntern.avgAttitude.toFixed(2)
                : "-"}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Điểm cuối kỳ:</strong> {" "}
              {selectedIntern.finalScore != null
                ? selectedIntern.finalScore.toFixed(2)
                : "-"}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Ghi chú gần nhất
            </h4>
            <div
              style={{
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                backgroundColor: "#f9fafb",
                minHeight: 40,
                fontSize: 14,
              }}
            >
              {selectedIntern.latestNote || "Không có ghi chú"}
            </div>
          </div>

          <div>
            <h4
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Tất cả ghi chú
            </h4>
            <div
              style={{
                padding: "10px 12px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                backgroundColor: "#f9fafb",
                minHeight: 60,
                whiteSpace: "pre-line",
                fontSize: 14,
              }}
            >
              {selectedIntern.allNotes || "Không có ghi chú"}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InternDetailModal;
