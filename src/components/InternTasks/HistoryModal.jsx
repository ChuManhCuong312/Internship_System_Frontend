import React, { useEffect, useState } from "react";
import * as taskApi from "../../api/taskApi";

const HistoryModal = ({ open, onClose, token, taskId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        let server = [];
        if (token) {
          try {
            const res = await taskApi.getTaskHistory(token, taskId);
            server = Array.isArray(res) ? res : [];
          } catch (err) {
            // server may not implement; fallthrough
            console.warn('Could not fetch server history', err);
          }
        }

        const raw = localStorage.getItem("task-progress-history");
        const localMap = raw ? JSON.parse(raw) : {};
        const local = localMap[taskId] || [];

        // Normalize entries to { from, to, note, timestamp, source }
        const normalized = [
          ...server.map((s) => ({ ...s, source: "server" })),
          ...local.map((s) => ({ ...s, source: "local" })),
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setHistory(normalized);
      } catch (err) {
        setError(String(err));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [open, token, taskId]);

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3>Lịch sử tiến độ</h3>
          <button onClick={onClose}>Đóng</button>
        </div>

        {loading ? (
          <div>Đang tải lịch sử...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : history.length === 0 ? (
          <div>Chưa có lịch sử</div>
        ) : (
          <ul>
            {history.map((h, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                <div>
                  <strong>{h.from}% → {h.to}%</strong>
                  <span style={{ marginLeft: 8, color: "#718096" }}>{new Date(h.timestamp).toLocaleString()}</span>
                </div>
                {h.note && <div style={{ marginTop: 4 }}>{h.note}</div>}
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Nguồn: {h.source}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;
