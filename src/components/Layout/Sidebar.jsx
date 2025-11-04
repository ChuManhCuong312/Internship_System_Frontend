import React from 'react';
import { FaHome, FaUser, FaCalendarAlt, FaClock, FaTasks, FaLifeRing, FaBell, FaRobot, FaSignOutAlt } from 'react-icons/fa';
import avatar from "../../assets/avatar.png";
import '../../styles/sideBar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div>
        <div className="sidebar-header">
          <img src={avatar} alt="avatar" />
          <h4>Andrew Smith</h4>
          <p>Product Designer</p>
        </div>
        <ul className="sidebar-menu">
          <li className="active"><FaHome /> Trang chủ</li>
          <li><FaUser /> Hồ sơ cá nhân</li>
          <li><FaCalendarAlt /> Lịch & Chương trình</li>
          <li><FaClock /> Chấm công & Nghỉ phép</li>
          <li><FaTasks /> Nhiệm vụ & Báo cáo</li>
          <li><FaLifeRing /> Quyền lợi & Hỗ trợ</li>
          <li><FaBell /> Thông báo</li>
          <li><FaRobot /> Chatbot</li>
        </ul>
      </div>
      <div className="sidebar-footer">
        <button><FaSignOutAlt /> Đăng xuất</button>
      </div>
    </div>
  );
};

export default Sidebar;