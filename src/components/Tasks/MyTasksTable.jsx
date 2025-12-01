import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import taskApi from '../../api/taskApi';
import taskManagementApi from '../../api/taskManagementApi';
import Cookies from 'js-cookie';

const STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'REVIEWED', 'DONE'];

const MyTasksTable = () => {
  const { token, user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [progressMap, setProgressMap] = useState({}); // taskId -> {percent, note}
  const [historyMap, setHistoryMap] = useState({}); // taskId -> [history]
  const [reminders, setReminders] = useState({});

  const internId = (() => {
    try {
      const cookieInternId = Cookies.get('internId');
      if (cookieInternId) return parseInt(cookieInternId);
      return user?.internId;
    } catch (e) { return user?.internId; }
  })();

  useEffect(() => {
    if (!internId || !token) return;

    const fetchTasksForIntern = async () => {
      try {
        // 1) Fetch tasks directly from /api/tasks/intern/{internId}
        let validTasks = [];
        try {
          const tasksRes = await axiosClient.get(`/tasks/intern/${internId}`);
          validTasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
        } catch (taskErr) {
          console.error('Failed to fetch tasks for intern:', taskErr);
          setTasks([]);
          setReminders({});
          setHistoryMap({});
          setProgressMap({});
          return;
        }

        if (validTasks.length === 0) {
          console.log('No tasks found for intern.');
          setTasks([]);
          setReminders({});
          setHistoryMap({});
          setProgressMap({});
          return;
        }

        setTasks(validTasks);

        // compute reminders
        const newReminders = {};
        for (const t of validTasks) {
          const deadline = t.deadline ? new Date(t.deadline) : null;
          if (deadline) {
            const diffMs = deadline - new Date();
            newReminders[t.taskId] = diffMs <= 24 * 3600 * 1000 && diffMs > 0;
          }
        }
        setReminders(newReminders);

        // load progress history for displayed tasks
        try {
          const allProgress = await taskManagementApi.getAllProgress(token);
          const grouped = {};
          (Array.isArray(allProgress) ? allProgress : []).forEach(p => {
            if (!grouped[p.taskId]) grouped[p.taskId] = [];
            grouped[p.taskId].push(p);
          });
          setHistoryMap(grouped);

          // fill latest progress Map
          const latest = {};
          Object.keys(grouped).forEach(k => {
            const arr = grouped[k].sort((a,b)=> new Date(b.updatedAt) - new Date(a.updatedAt));
            latest[k] = arr[0];
          });
          setProgressMap(latest);
        } catch (progressErr) {
          console.warn('Could not fetch progress history:', progressErr);
          setProgressMap({});
          setHistoryMap({});
        }

      } catch (err) {
        console.error('Error fetching tasks for intern:', err);
      }
    };

    fetchTasksForIntern();
  }, [internId, token]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskApi.updateTaskStatus(token, taskId, newStatus);
      setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSaveProgress = async (taskId) => {
    const entry = progressMap[taskId];
    const percent = entry?.percentComplete ?? 0;
    const note = entry?.note ?? '';
    try {
      await taskManagementApi.createProgress(token, { taskId, percentComplete: percent, note });
      // append to history
      const all = await taskManagementApi.getAllProgress(token);
      const grouped = {};
      (all || []).forEach(p => {
        if (!grouped[p.taskId]) grouped[p.taskId] = [];
        grouped[p.taskId].push(p);
      });
      setHistoryMap(grouped);
      const arr = grouped[taskId] || [];
      setProgressMap(prev => ({ ...prev, [taskId]: arr.sort((a,b)=> new Date(b.updatedAt)-new Date(a.updatedAt))[0] }));
    } catch (err) {
      console.error('Failed to save progress', err);
    }
  };

  const handleSliderChange = (taskId, value) => {
    setProgressMap(prev => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), percentComplete: parseInt(value, 10) }
    }));
  };

  const handleNoteChange = (taskId, value) => {
    setProgressMap(prev => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), note: value }
    }));
  };

  return (
    <div>
      <table className="task-table">
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Deadline</th>
            <th>Trạng thái</th>
            <th>Ghi chú tiến độ</th>
            <th>% Hoàn thành</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {tasks.length === 0 && (
            <tr><td colSpan="6" style={{ textAlign: 'center', color: '#718096' }}>Chưa có nhiệm vụ</td></tr>
          )}

          {tasks.map(task => {
            const prog = progressMap[task.taskId] || { percentComplete: 0, note: '' };
            const isDueSoon = reminders[task.taskId];
            const deadlineStr = task.deadline ? new Date(task.deadline).toLocaleString() : '--';
            return (
              <tr key={task.taskId}>
                <td>{task.title}</td>
                <td style={{ color: isDueSoon ? '#b91c1c' : 'inherit', fontWeight: isDueSoon ? '700' : '400' }}>
                  {deadlineStr}
                  {isDueSoon && <div style={{ fontSize: 12, color: '#b91c1c' }}>Sắp hết hạn</div>}
                </td>
                <td>
                  <select value={task.status || 'TODO'} onChange={(e)=>handleStatusChange(task.taskId, e.target.value)}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <textarea
                    rows={2}
                    value={prog.note || ''}
                    onChange={(e)=>handleNoteChange(task.taskId, e.target.value)}
                    placeholder="Ghi chú tiến độ..."
                    style={{ width: 220 }}
                  />
                  <div style={{ marginTop: 6 }}>
                    <button onClick={()=>handleSaveProgress(task.taskId)} className="checkin-btn">Lưu tiến độ</button>
                  </div>
                </td>
                <td style={{ minWidth: 180 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="range" min="0" max="100" value={prog.percentComplete || 0}
                      onChange={(e)=>handleSliderChange(task.taskId, e.target.value)} />
                    <div style={{ width: 48, textAlign: 'center' }}>{prog.percentComplete || 0}%</div>
                  </div>
                </td>
                <td>
                  <details>
                    <summary>Lịch sử</summary>
                    <div style={{ maxHeight: 180, overflow: 'auto' }}>
                      { (historyMap[task.taskId] || []).length === 0 && <div style={{ color: '#718096' }}>Chưa có lịch sử</div> }
                      { (historyMap[task.taskId] || []).map(h => (
                        <div key={h.progressId} style={{ borderBottom: '1px solid #eee', padding: '6px 0' }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{h.percentComplete}%</div>
                          <div style={{ fontSize: 12, color: '#4a5568' }}>{h.note}</div>
                          <div style={{ fontSize: 11, color: '#718096' }}>{new Date(h.updatedAt).toLocaleString()}</div>
                        </div>
                      )) }
                    </div>
                  </details>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MyTasksTable;
