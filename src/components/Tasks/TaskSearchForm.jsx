import React, { useState } from 'react';
import styles from './TaskSearchForm.module.css';

const TaskSearchForm = ({ 
  filterData, 
  setFilterData, 
  tags, 
  onSearch, 
  onReset,
  onManageTags,
  hideManageTags = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldShowManageTags = typeof onManageTags === 'function' && !hideManageTags;

  const handleStatusChange = (e) => {
    setFilterData(prev => ({ ...prev, status: e.target.value }));
  };

  const handlePriorityChange = (e) => {
    setFilterData(prev => ({ ...prev, priority: e.target.value }));
  };

  const handleSearchTextChange = (e) => {
    setFilterData(prev => ({ ...prev, searchText: e.target.value }));
  };

  const handleTagToggle = (tagId) => {
    setFilterData(prev => {
      const isSelected = prev.tagIds.includes(tagId);
      return {
        ...prev,
        tagIds: isSelected 
          ? prev.tagIds.filter(id => id !== tagId)
          : [...prev.tagIds, tagId]
      };
    });
  };

  const hasActiveFilters = 
    filterData.status || 
    filterData.priority || 
    filterData.searchText || 
    filterData.tagIds.length > 0;

  const handleSearch = () => {
    onSearch();
  };

  const handleReset = () => {
    setFilterData({
      status: '',
      priority: '',
      searchText: '',
      tagIds: []
    });
    onReset();
  };

  return (
    <div className={styles.searchFormContainer}>
      {/* Search Header */}
      <div className={styles.searchHeader}>
        <div className={styles.searchInputWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm nhiệm vụ..."
            value={filterData.searchText}
            onChange={handleSearchTextChange}
            className={styles.searchInput}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          {filterData.searchText && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => setFilterData(prev => ({ ...prev, searchText: '' }))}
              title="Xóa tìm kiếm"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="button"
          className={`${styles.expandBtn} ${isExpanded ? styles.expanded : ''}`}
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
        >
          ⚙️
        </button>
      </div>


      {/* Expanded Filter Panel */}
      {isExpanded && (
        <div className={styles.expandedPanel}>
          {/* Status Filter */}
          <div className={styles.filterRow}>
            <div className={styles.filterColumn}>
              <label className={styles.filterLabel}>Trạng thái</label>
              <select
                value={filterData.status}
                onChange={handleStatusChange}
                className={styles.filterSelect}
              >
                <option value="">Tất cả</option>
                <option value="TODO">Chưa bắt đầu</option>
                <option value="IN_PROGRESS">Đang thực hiện</option>
                <option value="DONE">Hoàn thành</option>
                <option value="REVIEWED">Đã xem xét</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div className={styles.filterColumn}>
              <label className={styles.filterLabel}>Độ ưu tiên</label>
              <select
                value={filterData.priority}
                onChange={handlePriorityChange}
                className={styles.filterSelect}
              >
                <option value="">Tất cả</option>
                <option value="LOW">Thấp</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="HIGH">Cao</option>
              </select>
            </div>
          </div>

          {/* Tags Filter */}
          <div className={styles.tagsFilterSection}>
            <div className={styles.tagsFilterHeader}>
              <label className={styles.filterLabel}>Tags</label>
              {shouldShowManageTags && (
                <button
                  type="button"
                  className={styles.manageTagsBtn}
                  onClick={onManageTags}
                  title="Quản lý tags"
                >
                  ⚙️ Quản lý
                </button>
              )}
            </div>
            <div className={styles.tagsGrid}>
              {tags.length === 0 ? (
                <p className={styles.noTagsMessage}>Không có tag nào</p>
              ) : (
                tags.map(tag => (
                  <button
                    key={tag.tagId}
                    type="button"
                    className={`${styles.tagButton} ${filterData.tagIds.includes(tag.tagId) ? styles.selected : ''}`}
                    onClick={() => handleTagToggle(tag.tagId)}
                    style={{
                      backgroundColor: filterData.tagIds.includes(tag.tagId) 
                        ? tag.color || '#3b82f6'
                        : '#f3f4f6',
                      color: filterData.tagIds.includes(tag.tagId) ? '#fff' : '#374151',
                      borderColor: tag.color || '#3b82f6'
                    }}
                  >
                    {filterData.tagIds.includes(tag.tagId) && <span className={styles.checkmark}>✓</span>}
                    {tag.name}
                  </button>
                ))
              )}
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                className={styles.clearAllBtn}
                onClick={handleReset}
              >
                ↻ Xóa tất cả
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button
              type="button"
              className={styles.searchBtn}
              onClick={handleSearch}
            >
              🔍 Tìm kiếm
            </button>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleReset}
            >
              ↻ Đặt lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getStatusLabel = (status) => {
  const statusMap = {
    'TODO': 'Chưa bắt đầu',
    'IN_PROGRESS': 'Đang thực hiện',
    'DONE': 'Hoàn thành',
    'REVIEWED': 'Đã xem xét'
  };
  return statusMap[status] || status;
};

const getPriorityLabel = (priority) => {
  const priorityMap = {
    'LOW': 'Thấp',
    'MEDIUM': 'Trung bình',
    'HIGH': 'Cao'
  };
  return priorityMap[priority] || priority;
};

export default TaskSearchForm;
