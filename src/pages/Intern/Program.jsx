import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import InternSidebar from '../../components/Layout/InternSidebar';
import axiosClient from '../../api/axiosClient';
import Cookies from 'js-cookie';
import '../../styles/dashBoard.css';

const Program = () => {
  const { token, user } = useContext(AuthContext);
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const internId = (() => {
    try {
      const cookieInternId = Cookies.get('internId');
      if (cookieInternId) return parseInt(cookieInternId);
      return user?.internId;
    } catch (e) {
      return user?.internId;
    }
  })();

  useEffect(() => {
    if (!internId || !token) return;

    const fetchProgram = async () => {
      try {
        setLoading(true);
        // Fetch program by intern ID
        const res = await axiosClient.get(`/programs/intern/${internId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Extract program info from events or direct response
        if (Array.isArray(res.data) && res.data.length > 0) {
          // If it returns events, extract program info
          const programEvent = res.data.find(e => e.type === 'program');
          if (programEvent) {
            setProgram({
              id: programEvent.id,
              name: programEvent.title,
              description: programEvent.description,
              startDate: programEvent.dateTime
            });
          } else {
            // Try to get first event as program
            const firstEvent = res.data[0];
            setProgram({
              id: firstEvent.id,
              name: firstEvent.title,
              description: firstEvent.description,
              startDate: firstEvent.dateTime
            });
          }
        } else {
          setError('Không tìm thấy thông tin chương trình');
        }
      } catch (err) {
        console.error('Error fetching program:', err);
        setError('Lỗi khi tải thông tin chương trình');
      } finally {
        setLoading(false);
      }
    };

    fetchProgram();
  }, [internId, token]);

  return (
    <div className="dashboard-layout">
      <InternSidebar />
      <div className="dashboard-content">
        <h2>Thông tin chương trình</h2>

        {loading && (
          <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
            <p>Đang tải...</p>
          </div>
        )}

        {error && (
          <div className="card" style={{ textAlign: 'center', padding: '20px', color: '#d32f2f' }}>
            <p>{error}</p>
          </div>
        )}

        {program && (
          <div className="main-grid">
            <div className="card col-span-2">
              <h3>{program.name}</h3>
              <p><strong>Mô tả:</strong> {program.description || 'Chưa có mô tả'}</p>
              <p><strong>Ngày bắt đầu:</strong> {program.startDate ? new Date(program.startDate).toLocaleString() : '--'}</p>
            </div>
          </div>
        )}

        {!loading && !program && !error && (
          <div className="card" style={{ textAlign: 'center', padding: '20px', color: '#718096' }}>
            <p>Bạn chưa tham gia chương trình nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Program;
