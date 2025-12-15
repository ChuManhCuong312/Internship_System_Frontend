import React, { useContext, useEffect, useState } from "react";
import MentorSidebar from "../../components/Layout/MentorSidebar";
import TaskStats from "../../components/Dashboard/TaskStats";
import "../../styles/dashBoard.css";
import avatar from "../../assets/avatar.png";
import { AuthContext } from "../../context/AuthContext";
import mentorApi from "../../api/mentorApi";
import hrApi from "../../api/hrApi";

const MentorDashboard = () => {
  const { token, user } = useContext(AuthContext);
  const [internCount, setInternCount] = useState(0);

  useEffect(() => {
    const fetchInternCountForMentor = async () => {
      if (!token || !user?.userId) return;

      try {
        // Lấy mentorId từ userId
        const mentorData = await mentorApi.getMentorByUserId(token, user.userId);

        if (!mentorData || !mentorData.mentorId) {
          setInternCount(0);
          return;
        }

        const mentorId = mentorData.mentorId;

        // Lấy tất cả chương trình mà mentor này tham gia
        const programsRes = await hrApi.filterProgramsByMentor(token, mentorId);

        let programs = [];
        if (Array.isArray(programsRes)) {
          programs = programsRes;
        } else if (programsRes && Array.isArray(programsRes.data)) {
          programs = programsRes.data;
        } else if (programsRes && Array.isArray(programsRes.content)) {
          programs = programsRes.content;
        }

        if (!programs.length) {
          setInternCount(0);
          return;
        }

        const uniqueInternIds = new Set();

        // Với mỗi chương trình, lấy danh sách team và interns trong từng team
        await Promise.all(
          programs.map(async (program) => {
            if (!program || !program.programId) return;

            try {
              const teamsRes = await hrApi.getTeamsInProgram(token, program.programId);

              let teams = [];
              if (Array.isArray(teamsRes)) {
                teams = teamsRes;
              } else if (teamsRes && Array.isArray(teamsRes.data)) {
                teams = teamsRes.data;
              } else if (teamsRes && Array.isArray(teamsRes.content)) {
                teams = teamsRes.content;
              }

              await Promise.all(
                teams.map(async (team) => {
                  if (!team || !team.teamId) return;

                  try {
                    const internsRes = await hrApi.getInternsInTeam(token, team.teamId);

                    let interns = [];
                    if (Array.isArray(internsRes)) {
                      interns = internsRes;
                    } else if (internsRes && Array.isArray(internsRes.data)) {
                      interns = internsRes.data;
                    } else if (internsRes && Array.isArray(internsRes.content)) {
                      interns = internsRes.content;
                    }

                    interns.forEach((intern) => {
                      if (intern && intern.internId != null) {
                        uniqueInternIds.add(intern.internId);
                      }
                    });
                  } catch (err) {
                    console.error("Error fetching interns in team:", err);
                  }
                })
              );
            } catch (err) {
              console.error("Error fetching teams in program:", err);
            }
          })
        );

        setInternCount(uniqueInternIds.size);
      } catch (error) {
        console.error("Error fetching mentor intern count:", error);
        setInternCount(0);
      }
    };

    fetchInternCountForMentor();
  }, [token, user]);

  return (
    <div className="dashboard-layout">
      <MentorSidebar />
      <div className="dashboard-content">
        <h2 className="page-title">Mentor Dashboard</h2>

        {/* Thống kê nhanh */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon mentor">👨‍🏫</div>
            <div>
              <h4>Thực tập sinh đang hướng dẫn</h4>
              <p className="stat-value">{internCount}</p>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <TaskStats />
          </div>
          <div className="stat-card">
            <div className="stat-icon mentor">📝</div>
            <div>
              <h4>Báo cáo đã phản hồi</h4>
              <p className="stat-value">8</p>
            </div>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="main-grid">
          <div className="card col-span-2">
            <h4>Danh sách thực tập sinh</h4>
            <table className="task-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Ngành</th>
                  <th>Tiến độ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Nguyễn Văn A</td>
                  <td>Kỹ thuật</td>
                  <td className="status done">80%</td>
                </tr>
                <tr>
                  <td>Trần Thị B</td>
                  <td>Marketing</td>
                  <td className="status pending">65%</td>
                </tr>
                <tr>
                  <td>Lê Văn C</td>
                  <td>Thiết kế</td>
                  <td className="status pending">70%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="card">
            <h4>Thông tin mentor</h4>
            <div className="mentor-info">
              <img src={avatar} alt="avatar" />
              <div>
                <p>Mentor Dương</p>
                <p className="email">duong@mentor.com</p>
              </div>
            </div>
            <p>Phòng ban: Kỹ thuật</p>
            <p>Số lượng TTS: {internCount}</p>
          </div>
        </div>

        {/* Dưới cùng */}
        <div className="bottom-grid">
          <div className="card">
            <h4>Nhiệm vụ cần giao</h4>
            <ul className="activity-list">
              <li>Chuẩn bị nhiệm vụ tuần 3</li>
              <li>Giao bài tập nhóm IT</li>
              <li>Thiết lập deadline báo cáo</li>
            </ul>
          </div>

          <div className="card">
            <h4>Báo cáo chờ phản hồi</h4>
            <ul className="activity-list">
              <li>Báo cáo tuần của TTS A</li>
              <li>Báo cáo kỹ năng mềm TTS B</li>
              <li>Báo cáo thiết kế TTS C</li>
            </ul>
          </div>

          <div className="card">
            <h4>Đánh giá cuối kỳ</h4>
            <ul className="activity-list">
              <li>Đánh giá TTS A: kỹ năng & thái độ</li>
              <li>Đánh giá TTS B: tiến độ & sáng tạo</li>
              <li>Gửi tổng hợp cho HR</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;
