import React, { useState } from "react";
import MentorSidebar from "../../components/Layout/MentorSidebar";
import "../../styles/dashBoard.css";

const MentorTasks = () => {
  const [tasks, setTasks] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
    description: ""
  });

  const handleAddTask = () => {
    if (newTask.title && newTask.assignedTo && newTask.dueDate) {
      const task = {
        id: tasks.length + 1,
        ...newTask,
        status: "Pending"
      };
      setTasks([...tasks, task]);
      setNewTask({ title: "", assignedTo: "", priority: "Medium", dueDate: "", description: "" });
      setShowAddForm(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed": return "status done";
      case "In Progress": return "status pending";
      default: return "status pending";
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High": return "priority high";
      case "Medium": return "priority medium";
      default: return "priority low";
    }
  };

  return (
    <div className="dashboard-layout">
      <MentorSidebar />
      <div className="dashboard-content">
        <div className="flex justify-between items-center mb-6">
          <h2 className="page-title">Quản lý Nhiệm vụ</h2>
          <button 
            className="btn-primary" 
            onClick={() => setShowAddForm(true)}
          >
            + Giao nhiệm vụ mới
          </button>
        </div>

        {/* Thống kê nhanh */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon mentor">📋</div>
            <div>
              <h4>Tổng nhiệm vụ</h4>
              <p className="stat-value">{tasks.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">⏳</div>
            <div>
              <h4>Đang thực hiện</h4>
              <p className="stat-value">{tasks.filter(t => t.status === "In Progress").length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">✅</div>
            <div>
              <h4>Đã hoàn thành</h4>
              <p className="stat-value">{tasks.filter(t => t.status === "Completed").length}</p>
            </div>
          </div>
        </div>

        {/* Form thêm nhiệm vụ mới */}
        {showAddForm && (
          <div className="card mb-6">
            <h4>Giao nhiệm vụ mới</h4>
            <div className="form-grid">
              <div>
                <label>Tiêu đề nhiệm vụ</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Nhập tiêu đề nhiệm vụ"
                />
              </div>
              <div>
                <label>Thực tập sinh</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                >
                  <option value="">Chọn thực tập sinh</option>
                  <option value="Nguyễn Văn A">Nguyễn Văn A</option>
                  <option value="Trần Thị B">Trần Thị B</option>
                  <option value="Lê Văn C">Lê Văn C</option>
                  <option value="Phạm Thị D">Phạm Thị D</option>
                  <option value="Hoàng Văn E">Hoàng Văn E</option>
                </select>
              </div>
              <div>
                <label>Độ ưu tiên</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                >
                  <option value="Low">Thấp</option>
                  <option value="Medium">Trung bình</option>
                  <option value="High">Cao</option>
                </select>
              </div>
              <div>
                <label>Hạn chót</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                />
              </div>
              <div className="col-span-2">
                <label>Mô tả</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Nhập mô tả chi tiết nhiệm vụ"
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="btn-primary" onClick={handleAddTask}>Giao nhiệm vụ</button>
              <button className="btn-secondary" onClick={() => setShowAddForm(false)}>Hủy</button>
            </div>
          </div>
        )}

        {/* Danh sách nhiệm vụ */}
        <div className="card">
          <h4>Danh sách nhiệm vụ</h4>
          <table className="task-table">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Thực tập sinh</th>
                <th>Độ ưu tiên</th>
                <th>Trạng thái</th>
                <th>Hạn chót</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>
                    <div>
                      <strong>{task.title}</strong>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                  </td>
                  <td>{task.assignedTo}</td>
                  <td><span className={`priority-badge ${getPriorityClass(task.priority)}`}>{task.priority}</span></td>
                  <td><span className={`status-badge ${getStatusClass(task.status)}`}>{task.status}</span></td>
                  <td>{task.dueDate}</td>
                  <td>
                    <button className="btn-primary btn-sm">Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MentorTasks;