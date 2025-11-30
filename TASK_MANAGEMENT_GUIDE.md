# Task Management System - Mentor Module

## Overview

The Task Management System is a comprehensive solution for mentors to assign, track, and manage tasks for interns. It's built based on the database schema provided and integrates seamlessly with the existing internship management system.

## Database Schema

### Tables Used

1. **tasks** - Main task information
   - `task_id` - Primary key
   - `program_id` - Associated program
   - `title` - Task title
   - `description` - Task description
   - `assigned_by` - Mentor ID
   - `priority` - LOW, MEDIUM, HIGH
   - `status` - TODO, IN_PROGRESS, DONE, REVIEWED
   - `created_at` - Creation timestamp
   - `deadline` - Task deadline
   - `due_soon` - Boolean flag for upcoming deadlines

2. **task_team_assignments** - Team assignments for tasks
   - `id` - Primary key
   - `task_id` - Foreign key to tasks
   - `team_id` - Foreign key to teams

3. **tasks_files** - File attachments for tasks
   - `task_files_id` - Primary key
   - `task_id` - Foreign key to tasks
   - `link_file` - File URL/path

4. **task_progress** - Task progress tracking
   - `progress_id` - Primary key
   - `task_id` - Foreign key to tasks
   - `percent_complete` - 0-100
   - `note` - Progress notes
   - `updated_at` - Last update timestamp

## File Structure

```
src/
├── api/
│   └── taskApi.js                 # API methods for task operations
├── hooks/
│   └── useTasksLogic.js           # Custom hook for task logic
├── components/
│   └── Tasks/
│       └── TaskModal.jsx          # Modal for creating/editing tasks
├── pages/
│   └── Mentor/
│       └── Tasks.jsx              # Main task management page
└── styles/
    ├── taskManagement.css         # Main page styles
    └── taskModal.css              # Modal styles
```

## Features

### 1. Task Management

#### Create Task
- Click "Giao nhiệm vụ mới" button
- Fill in task details:
  - **Title** (required) - Task name
  - **Description** (required) - Detailed task description
  - **Program** (required) - Select associated program
  - **Priority** - LOW, MEDIUM, HIGH (default: MEDIUM)
  - **Status** - TODO, IN_PROGRESS, DONE, REVIEWED (default: TODO)
  - **Deadline** (required) - Task due date
  - **Teams** - Assign to multiple teams

#### Edit Task
- Click the edit button (✏️) on any task row
- Modify task details in the modal
- Click "Cập nhật" to save changes

#### Delete Task
- Click the delete button (🗑️) on any task row
- Confirm deletion in the alert dialog

### 2. Task Filtering

The system provides advanced filtering capabilities:

- **Status Filter** - Filter by task status
  - Chưa bắt đầu (TODO)
  - Đang thực hiện (IN_PROGRESS)
  - Hoàn thành (DONE)
  - Đã xem xét (REVIEWED)

- **Priority Filter** - Filter by priority level
  - Thấp (LOW)
  - Trung bình (MEDIUM)
  - Cao (HIGH)

- **Search** - Search by task title

### 3. Task Sorting

Click on column headers to sort:
- Task ID
- Title
- Priority
- Status
- Deadline

Toggle between ascending (↑) and descending (↓) order.

### 4. Pagination

- **Page Navigation** - Previous/Next buttons
- **Page Size** - Select 5, 10, 20, or 50 records per page
- **Page Info** - Shows current page and total pages

### 5. Statistics Dashboard

Quick overview cards showing:
- **Tổng nhiệm vụ** - Total tasks count
- **Chưa bắt đầu** - TODO tasks count
- **Đang thực hiện** - IN_PROGRESS tasks count
- **Hoàn thành** - DONE tasks count

### 6. Visual Indicators

#### Status Badges
- 🔲 **Chưa bắt đầu** (TODO) - Gray background
- 🟨 **Đang thực hiện** (IN_PROGRESS) - Yellow background
- 🟩 **Hoàn thành** (DONE) - Green background
- 🟦 **Đã xem xét** (REVIEWED) - Blue background

#### Priority Badges
- 🟩 **Thấp** (LOW) - Green
- 🟨 **Trung bình** (MEDIUM) - Yellow
- 🟥 **Cao** (HIGH) - Red

#### Overdue Indicator
- Rows with overdue tasks are highlighted in light red
- Deadline dates in red indicate overdue status

## API Endpoints

### Task Operations

```javascript
// Get all tasks by mentor
GET /api/tasks/mentor/{mentorId}
  ?page=0&size=10&sortBy=taskId&direction=asc

// Get tasks by program
GET /api/tasks/program/{programId}
  ?page=0&size=10

// Get task by ID
GET /api/tasks/{taskId}

// Create task
POST /api/tasks
Body: {
  title: string,
  description: string,
  programId: number,
  priority: "LOW|MEDIUM|HIGH",
  status: "TODO|IN_PROGRESS|DONE|REVIEWED",
  deadline: date
}

// Update task
PUT /api/tasks/{taskId}
Body: { ...same as create }

// Delete task
DELETE /api/tasks/{taskId}

// Filter tasks
GET /api/tasks/filter/search
  ?status=TODO&priority=HIGH&searchText=...&page=0&size=10

// Get overdue tasks
GET /api/tasks/overdue
  ?page=0&size=10

// Get due soon tasks
GET /api/tasks/due-soon
  ?days=7&page=0&size=10
```

### Team Assignment

```javascript
// Assign task to team
POST /api/tasks/{taskId}/assign-team
Body: { teamId: number }

// Remove team assignment
DELETE /api/tasks/assignment/{assignmentId}
```

### File Management

```javascript
// Upload task file
POST /api/tasks/{taskId}/upload-file
Body: FormData with file

// Delete task file
DELETE /api/tasks/file/{fileId}
```

### Progress Tracking

```javascript
// Update task progress
PUT /api/tasks/{taskId}/progress
Body: {
  percentComplete: number (0-100),
  note: string
}

// Get task progress
GET /api/tasks/{taskId}/progress
```

## Component Details

### TaskModal.jsx

Modal component for creating and editing tasks.

**Props:**
- `isOpen` (boolean) - Modal visibility
- `onClose` (function) - Close handler
- `onSubmit` (function) - Submit handler
- `task` (object) - Task data for editing (null for create)
- `programs` (array) - Available programs
- `teams` (array) - Available teams

**Features:**
- Form validation
- Error messages
- SweetAlert2 confirmation dialogs
- Team multi-select

### useTasksLogic.js

Custom hook for managing task state and operations.

**Returns:**
```javascript
{
  tasks,                    // Array of tasks
  loading,                  // Loading state
  error,                    // Error message
  page,                     // Current page
  size,                     // Page size
  totalElements,            // Total records
  totalPages,               // Total pages
  sortBy,                   // Sort column
  direction,                // Sort direction
  activeFilters,            // Active filter object
  setPage,                  // Set page function
  setSize,                  // Set page size function
  setSortBy,                // Set sort column
  setDirection,             // Set sort direction
  createTask,               // Create task function
  updateTask,               // Update task function
  deleteTask,               // Delete task function
  updateProgress,           // Update progress function
  uploadFile,               // Upload file function
  deleteFile,               // Delete file function
  handleSort,               // Handle sort click
  handleApplyFilter,        // Apply filter function
  handleResetFilter,        // Reset filter function
  fetchTasks,               // Fetch tasks function
}
```

## Usage Example

### Basic Setup

```jsx
import Tasks from './pages/Mentor/Tasks';

// In your router
<Route path="/mentor/tasks" element={<Tasks />} />
```

### Creating a Task

1. Navigate to `/mentor/tasks`
2. Click "Giao nhiệm vụ mới"
3. Fill in the form:
   - Title: "Design Homepage"
   - Description: "Create responsive homepage design"
   - Program: "Chương trình thực tập 2024"
   - Priority: "HIGH"
   - Deadline: "2024-12-31"
4. Click "Giao nhiệm vụ"

### Filtering Tasks

1. Click "🔍 Lọc" button
2. Select filters:
   - Status: "Đang thực hiện"
   - Priority: "Cao"
3. Click "Áp dụng"
4. Click "✕ Xóa bộ lọc" to reset

### Sorting Tasks

1. Click on any column header (Title, Priority, Status, Deadline)
2. Click again to toggle sort direction
3. Arrow indicator (↑/↓) shows current sort direction

## Styling

### Color Scheme

- **Primary Gradient** - #667eea to #764ba2 (Purple)
- **Success** - #2e7d32 (Green)
- **Warning** - #f57c00 (Orange)
- **Error** - #d32f2f (Red)
- **Background** - #f9f9f9 (Light Gray)

### Responsive Design

- Desktop: Full layout with all features
- Tablet: Adjusted grid layout
- Mobile: Single column layout, stacked buttons

## Error Handling

The system includes comprehensive error handling:

- **Validation Errors** - Form field validation with error messages
- **API Errors** - Toast notifications for API failures
- **Network Errors** - Graceful error messages
- **Empty States** - User-friendly empty state messages

## Performance Optimization

- **Pagination** - Load data in chunks
- **Lazy Loading** - Load data on demand
- **Memoization** - Prevent unnecessary re-renders
- **Debouncing** - Optimize search input

## Security

- **Token-based Authentication** - All requests include Bearer token
- **Role-based Access** - Only mentors can access
- **Input Validation** - Client and server-side validation
- **CSRF Protection** - Secure cookie configuration

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Dependencies

- React 18+
- React Router 6+
- Axios
- SweetAlert2
- React Toastify
- React Spring (for animations)

## Future Enhancements

- [ ] Bulk task operations
- [ ] Task templates
- [ ] Task dependencies
- [ ] Recurring tasks
- [ ] Task analytics and reports
- [ ] Email notifications
- [ ] Task comments and discussions
- [ ] File preview functionality
- [ ] Task history and audit log
- [ ] Integration with calendar

## Troubleshooting

### Tasks not loading
- Check API endpoint configuration
- Verify authentication token
- Check browser console for errors

### Modal not opening
- Ensure `isOpen` prop is true
- Check for JavaScript errors
- Verify CSS is loaded

### Filters not working
- Clear browser cache
- Verify filter parameters
- Check API response format

## Support

For issues or questions, please contact the development team or check the project documentation.

---

**Last Updated:** November 30, 2024
**Version:** 1.0.0
