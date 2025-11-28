import React, { useState } from "react";
import HistoryModal from "./HistoryModal";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const statusOptions = [
  { value: "TODO", label: "Chưa làm" },
  { value: "IN_PROGRESS", label: "Đang làm" },
  { value: "DONE", label: "Đã xong" },
];

const formatDate = (d) => {
  if (!d) return "-";
  const date = new Date(d);
  return date.toLocaleString();
};

const TasksTable = ({ tasks = [], onUpdate }) => {
  const { token } = useContext(AuthContext);
  const [localNote, setLocalNote] = useState({});
  const [historyOpenFor, setHistoryOpenFor] = useState(null);

  const handleStatusChange = (taskId, value) => {
    onUpdate(taskId, { status: value }, "");
  };

  const handleProgressChange = (taskId, value) => {
    const prev = tasks.find((t) => t.id === taskId)?.progress ?? 0;
    onUpdate(taskId, { progress: value }, `Cập nhật %: ${prev}% → ${value}%`);
  };

  const handleNoteChange = (taskId, text) => {
    setLocalNote((s) => ({ ...s, [taskId]: text }));
  };

  const submitNote = (taskId) => {
    const note = localNote[taskId] || "";
    onUpdate(taskId, {}, note);
    setLocalNote((s) => ({ ...s, [taskId]: "" }));
  };

  const openHistory = (taskId) => setHistoryOpenFor(taskId);
  const closeHistory = () => setHistoryOpenFor(null);

  return (
    <>
    <table className="task-table">
      <thead>
        <tr>
          <th>Tiêu đề</th>
          <th>Deadline</th>
          <th>Trạng thái</th>
          <th>Ghi chú tiến độ</th>
          <th>% Hoàn thành</th>
        </tr>
      </thead>
      <tbody>
        {tasks.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ textAlign: "center", color: "#718096" }}>
              Chưa có dữ liệu
            </td>
          </tr>
        ) : (
          tasks.map((task) => (
            <tr key={task.id} className={task.reminder ? "near-deadline" : ""}>
              <td>{task.title || task.name}</td>
              <td>
                <div>
                  <span>{formatDate(task.deadline)}</span>
                  {task.reminder && <span className="reminder"> &nbsp;⚠️ Sắp hết hạn</span>}
                </div>
              </td>
              <td>
                <select
                  value={task.status || "TODO"}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  {statusOptions.map((s) => (
                    <option value={s.value} key={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    placeholder="Ghi chú ngắn"
                    value={localNote[task.id] || ""}
                    onChange={(e) => handleNoteChange(task.id, e.target.value)}
                  />
                  <button onClick={() => submitNote(task.id)}>Lưu</button>
                  <button onClick={() => openHistory(task.id)}>Xem lịch sử</button>
                </div>
              </td>
              <td>
                <div className="progress-cell">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={task.progress ?? 0}
                    onChange={(e) => handleProgressChange(task.id, Number(e.target.value))}
                  />
                  <div>{task.progress ?? 0}%</div>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
    {historyOpenFor && (
      <HistoryModal open={!!historyOpenFor} onClose={closeHistory} token={token} taskId={historyOpenFor} />
    )}
    </>
  );
};

export default TasksTable;
