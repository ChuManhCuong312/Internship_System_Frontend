import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import taskApi from '../../api/taskApi';
import mentorApi from '../../api/mentorApi';
import hrApi from '../../api/hrApi';
import styles from './TaskStats.module.css';

const TaskStats = () => {
  const { token, user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    total: 0,
    todo: 0,
    inProgress: 0,
    done: 0,
    reviewed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskStats = async () => {
      if (!token || !user?.userId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch mentor ID first
        const mentorData = await mentorApi.getMentorByUserId(token, user.userId);

        if (!mentorData?.mentorId) {
          setStats({
            total: 0,
            todo: 0,
            inProgress: 0,
            done: 0,
            reviewed: 0,
          });
          return;
        }

        let tasks = [];

        // Try to fetch all tasks for this mentor directly
        try {
          const response = await taskApi.getTasksByMentor(
            token,
            mentorData.mentorId,
            0,
            1000
          );

          if (response?.data && Array.isArray(response.data)) {
            tasks = response.data;
          } else if (response?.content && Array.isArray(response.content)) {
            tasks = response.content;
          } else if (Array.isArray(response)) {
            tasks = response;
          }
        } catch (err) {
          console.warn('Error fetching tasks by mentor, will try by programs instead:', err);
        }

        // Fallback: if no tasks found by mentor, aggregate tasks from all programs of this mentor
        if (tasks.length === 0) {
          try {
            const programsRes = await hrApi.filterProgramsByMentor(
              token,
              mentorData.mentorId
            );

            let programs = [];
            if (Array.isArray(programsRes)) {
              programs = programsRes;
            } else if (programsRes && Array.isArray(programsRes.data)) {
              programs = programsRes.data;
            } else if (programsRes && Array.isArray(programsRes.content)) {
              programs = programsRes.content;
            }

            if (programs.length > 0) {
              const taskResponses = await Promise.all(
                programs
                  .filter((p) => p && p.programId)
                  .map((p) =>
                    taskApi.getTasksByProgram(token, p.programId, 0, 1000)
                  )
              );

              const taskMap = new Map();

              taskResponses.forEach((res) => {
                let programTasks = [];

                if (res?.data && Array.isArray(res.data)) {
                  programTasks = res.data;
                } else if (res?.content && Array.isArray(res.content)) {
                  programTasks = res.content;
                } else if (Array.isArray(res)) {
                  programTasks = res;
                }

                programTasks.forEach((t) => {
                  if (t && t.taskId != null) {
                    taskMap.set(t.taskId, t);
                  }
                });
              });

              tasks = Array.from(taskMap.values());
            }
          } catch (err) {
            console.warn('Error fetching tasks by programs for mentor stats:', err);
          }
        }

        // Calculate stats
        const calculatedStats = {
          total: tasks.length,
          todo: tasks.filter((t) => t.status === 'TODO').length,
          inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
          done: tasks.filter((t) => t.status === 'DONE').length,
          reviewed: tasks.filter((t) => t.status === 'REVIEWED').length,
        };

        setStats(calculatedStats);
      } catch (err) {
        console.error('Error fetching task stats:', err);
        setError('Không thể tải thống kê nhiệm vụ');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskStats();
  }, [token, user]);

  if (loading) {
    return (
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.skeleton}></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.skeleton}></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.skeleton}></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.skeleton}></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.skeleton}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>📊</div>
        <div className={styles.statContent}>
          <h4>Tổng nhiệm vụ</h4>
          <p className={styles.statValue}>{stats.total}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>⏳</div>
        <div className={styles.statContent}>
          <h4>Đang thực hiện</h4>
          <p className={styles.statValue}>{stats.inProgress}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>✅</div>
        <div className={styles.statContent}>
          <h4>Hoàn thành</h4>
          <p className={styles.statValue}>{stats.done}</p>
        </div>
      </div>


    </div>
  );
};

export default TaskStats;
