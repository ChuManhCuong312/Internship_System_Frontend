/**
 * Color scheme for Task Status and Priority
 * Use these constants throughout the app for consistent styling
 */

// Status Colors
export const STATUS_COLORS = {
  TODO: {
    bg: '#E3F2FD',
    text: '#1565C0',
    border: '#90CAF9',
    label: 'Chưa bắt đầu'
  },
  IN_PROGRESS: {
    bg: '#FFF3E0',
    text: '#E65100',
    border: '#FFCC80',
    label: 'Đang thực hiện'
  },
  REVIEWED: {
    bg: '#F3E5F5',
    text: '#7B1FA2',
    border: '#CE93D8',
    label: 'Đang review'
  },
  DONE: {
    bg: '#E8F5E9',
    text: '#2E7D32',
    border: '#A5D6A7',
    label: 'Hoàn thành'
  }
};

// Priority Colors
export const PRIORITY_COLORS = {
  LOW: {
    bg: '#E0F2F1',
    text: '#00695C',
    border: '#80CBC4',
    label: 'Thấp'
  },
  MEDIUM: {
    bg: '#FFF8E1',
    text: '#F57F17',
    border: '#FFE082',
    label: 'Trung bình'
  },
  HIGH: {
    bg: '#FFEBEE',
    text: '#C62828',
    border: '#EF9A9A',
    label: 'Cao'
  }
};

/**
 * Get status style object for inline styling
 * @param {string} status - TODO, IN_PROGRESS, REVIEWED, DONE
 * @returns {object} Style object with backgroundColor, color, border
 */
export const getStatusStyle = (status) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.TODO;
  return {
    backgroundColor: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
    textTransform: 'uppercase'
  };
};

/**
 * Get priority style object for inline styling
 * @param {string} priority - LOW, MEDIUM, HIGH
 * @returns {object} Style object with backgroundColor, color, border
 */
export const getPriorityStyle = (priority) => {
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM;
  return {
    backgroundColor: colors.bg,
    color: colors.text,
    border: `1px solid ${colors.border}`,
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
    textTransform: 'uppercase'
  };
};

/**
 * Get status label in Vietnamese
 * @param {string} status 
 * @returns {string}
 */
export const getStatusLabel = (status) => {
  return STATUS_COLORS[status]?.label || status;
};

/**
 * Get priority label in Vietnamese
 * @param {string} priority 
 * @returns {string}
 */
export const getPriorityLabel = (priority) => {
  return PRIORITY_COLORS[priority]?.label || priority;
};

// Status Badge Component helper
export const StatusBadge = ({ status }) => {
  const style = getStatusStyle(status);
  const label = getStatusLabel(status);
  return <span style={style}>{label}</span>;
};

// Priority Badge Component helper
export const PriorityBadge = ({ priority }) => {
  const style = getPriorityStyle(priority);
  const label = getPriorityLabel(priority);
  return <span style={style}>{label}</span>;
};

export default {
  STATUS_COLORS,
  PRIORITY_COLORS,
  getStatusStyle,
  getPriorityStyle,
  getStatusLabel,
  getPriorityLabel,
  StatusBadge,
  PriorityBadge
};
