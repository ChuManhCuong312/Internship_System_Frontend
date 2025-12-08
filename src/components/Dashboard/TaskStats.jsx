import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import taskApi from '../../api/taskApi';
import mentorApi from '../../api/mentorApi';
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

        // Fetch all tasks for this mentor
        const response = await taskApi.getTasksByMentor(token, mentorData.mentorId, 0, 1000);
        
        let tasks = [];
        if (response.data && Array.isArray(response.data)) {
          tasks = response.data;
        } else if (response.content && Array.isArray(response.content)) {
          tasks = response.content;
        } else if (Array.isArray(response)) {
          tasks = response;
        }

        // Calculate stats
        const stats = {
          total: tasks.length,
          todo: tasks.filter(t => t.status === 'TODO').length,
          inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
          done: tasks.filter(t => t.status === 'DONE').length,
          reviewed: tasks.filter(t => t.status === 'REVIEWED').length,
        };

        setStats(stats);
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
