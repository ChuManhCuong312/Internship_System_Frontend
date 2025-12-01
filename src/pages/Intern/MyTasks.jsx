import React, { useEffect, useState, useContext } from "react";
import InternSidebar from "../../components/Layout/InternSidebar";
import "../../styles/dashBoard.css";
import "../../styles/myTasks.css";
import { AuthContext } from "../../context/AuthContext";
import * as taskApi from "../../api/taskApi";
import TasksTable from "../../components/InternTasks/TasksTable";

const MyTasks = () => {
  const { user, token } = useContext(AuthContext);
  const internId = user?.internId || null;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      if (!token || !internId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await taskApi.getMyTasks(token, internId);
        // normalize and compute reminder flag
        const enriched = (data || []).map((t) => {
          const deadline = t.deadline ? new Date(t.deadline) : null;
          const now = new Date();
          let reminder = false;
          if (deadline) {
            const diffMs = deadline - now;
            const diffDays = diffMs / (1000 * 60 * 60 * 24);
            if (diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000) reminder = true;
          }
          return { ...t, reminder };
        });
        setTasks(enriched);
      } catch (err) {
        setError(err?.message || err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token, internId]);

  const handleUpdate = async (taskId, changes, note) => {
    // changes could be { status, progress }
    const prev = tasks.find((t) => t.id === taskId) || {};
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, ...changes } : t));
    setTasks(updated);

    // attempt to persist
    try {
      if (changes.progress !== undefined) {
        await taskApi.updateTaskProgress(token, taskId, internId, changes.progress, note);
      }
      if (changes.status !== undefined) {
        await taskApi.updateTaskStatus(token, taskId, internId, changes.status);
      }
      // log history
      if (changes.progress !== undefined) {
        await taskApi.logProgressHistory(token, taskId, {
          from: prev.progress ?? 0,
          to: changes.progress,
          note: note || "",
        });
      }
    } catch (err) {
      console.warn("Failed to persist task update", err);
      setError(err?.message || err);
      // fallback: keep local change and save history to localStorage
      if (changes.progress !== undefined) {
        saveHistoryLocal(taskId, {
          from: prev.progress ?? 0,
          to: changes.progress,
          note: note || "(offline)",
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  const saveHistoryLocal = (taskId, entry) => {
    try {
      const key = "task-progress-history";
      const raw = localStorage.getItem(key);
      const map = raw ? JSON.parse(raw) : {};
      if (!map[taskId]) map[taskId] = [];
      map[taskId].push({ ...entry, timestamp: entry.timestamp || new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(map));
    } catch (err) {
      console.warn("local history save failed", err);
    }
  };

  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <div className="header-grid">
          <div className="card">
            <h4>Đang làm</h4>
            <p>{tasks.filter((t) => t.status === "IN_PROGRESS").length}</p>
          </div>
          <div className="card">
            <h4>Chưa làm</h4>
            <p>{tasks.filter((t) => t.status === "TODO" || !t.status).length}</p>
          </div>
          <div className="card">
            <h4>Đã xong</h4>
            <p>{tasks.filter((t) => t.status === "DONE").length}</p>
          </div>
          <div className="card">
            <h4>Báo cáo tuần</h4>
            <p>--</p>
          </div>
        </div>

        <div className="main-grid">
          <div className="card col-span-2">
            <h4>Danh sách nhiệm vụ của tôi</h4>
            {loading ? (
              <div>Đang tải...</div>
            ) : error ? (
              <div style={{ color: "red" }}>{String(error)}</div>
            ) : (
              <TasksTable tasks={tasks} onUpdate={handleUpdate} />
            )}
          </div>

          <div className="card">
            <h4>Báo cáo</h4>
            <p>Tạo báo cáo ngày/tuần</p>
            <button className="checkin-btn">Tạo báo cáo</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTasks;