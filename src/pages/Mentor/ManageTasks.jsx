import React, { useState } from 'react';
import { 
  Box, Button, Card, CardContent, CardHeader, Container, Divider, Grid, IconButton, 
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  TextField, Typography, MenuItem, Chip, Dialog, DialogTitle, DialogContent, 
  DialogActions, FormControl, InputLabel, Select, TextareaAutosize, useTheme,
  Tabs, Tab
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { vi } from 'date-fns/locale/vi';
import { 
  Add as AddIcon, 
  CheckCircle as CheckCircleIcon, 
  Pending as PendingIcon, 
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled Components
const StatCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  fontWeight: 600,
  ...(status === 'Completed' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  }),
  ...(status === 'In Progress' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.dark,
  }),
  ...(status === 'Pending' && {
    backgroundColor: theme.palette.grey[300],
    color: theme.palette.grey[800],
  }),
}));

const PriorityChip = styled(Chip)(({ theme, priority }) => ({
  fontWeight: 600,
  ...(priority === 'High' && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText,
  }),
  ...(priority === 'Medium' && {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText,
  }),
  ...(priority === 'Low' && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
  }),
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const StyledTextarea = styled(TextareaAutosize)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  fontFamily: theme.typography.fontFamily,
  fontSize: '0.875rem',
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
  },
}));

// Sample data
const initialTasks = [
  {
    id: 1,
    title: 'Thiết kế giao diện đăng nhập',
    description: 'Thiết kế giao diện đăng nhập với Material-UI',
    assignedTo: 'Nguyễn Văn A',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2025-12-15',
  },
  {
    id: 2,
    title: 'Phân tích yêu cầu',
    description: 'Phân tích yêu cầu từ khách hàng',
    assignedTo: 'Trần Thị B',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2025-12-10',
  },
  {
    id: 3,
    title: 'Kiểm thử hệ thống',
    description: 'Kiểm thử các chức năng chính',
    assignedTo: 'Lê Văn C',
    priority: 'Low',
    status: 'Pending',
    dueDate: '2025-12-20',
  },
];

const interns = [
  'Nguyễn Văn A',
  'Trần Thị B',
  'Lê Văn C',
  'Phạm Thị D',
  'Hoàng Văn E',
];

const MentorTasks = () => {
  const theme = useTheme();
  const [tasks, setTasks] = useState(initialTasks);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState('all');
  const [newTask, setNewTask] = useState({
    title: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: null,
    description: ''
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewTask({
      title: '',
      assignedTo: '',
      priority: 'Medium',
      dueDate: null,
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setNewTask(prev => ({
      ...prev,
      dueDate: date
    }));
  };

  const handleAddTask = () => {
    if (newTask.title && newTask.assignedTo && newTask.dueDate) {
      const task = {
        id: tasks.length + 1,
        ...newTask,
        dueDate: newTask.dueDate.toISOString().split('T')[0],
        status: 'Pending'
      };
      setTasks([...tasks, task]);
      handleCloseDialog();
    }
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const filteredTasks = tasks.filter(task => {
    if (tabValue === 'all') return true;
    if (tabValue === 'completed') return task.status === 'Completed';
    if (tabValue === 'in-progress') return task.status === 'In Progress';
    if (tabValue === 'pending') return task.status === 'Pending';
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    pending: tasks.filter(t => t.status === 'Pending').length,
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Box sx={{ display: 'flex' }}>
        <MentorSidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: theme.palette.background.default }}>
          <Container maxWidth="xl">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                Quản lý Nhiệm vụ
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
              >
                Giao nhiệm vụ mới
              </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PendingIcon color="action" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="textSecondary">
                        Tổng nhiệm vụ
                      </Typography>
                    </Box>
                    <Typography variant="h4" component="div">
                      {stats.total}
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <PendingIcon color="warning" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="textSecondary">
                        Đang thực hiện
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="warning.main">
                      {stats.inProgress}
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="textSecondary">
                        Đã hoàn thành
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="success.main">
                      {stats.completed}
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ErrorIcon color="error" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="textSecondary">
                        Đang chờ
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="error.main">
                      {stats.pending}
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
            </Grid>

            {/* Task List */}
            <Card>
              <CardHeader
                title="Danh sách nhiệm vụ"
                action={
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    <Tab label="Tất cả" value="all" />
                    <Tab label="Đang thực hiện" value="in-progress" />
                    <Tab label="Đã hoàn thành" value="completed" />
                    <Tab label="Đang chờ" value="pending" />
                  </Tabs>
                }
              />
              <Divider />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Tiêu đề</TableCell>
                      <TableCell>Thực tập sinh</TableCell>
                      <TableCell>Độ ưu tiên</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell>Hạn chót</TableCell>
                      <TableCell align="right">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((task) => (
                        <TableRow hover key={task.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {task.title}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {task.description}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{task.assignedTo}</TableCell>
                          <TableCell>
                            <PriorityChip 
                              label={task.priority} 
                              size="small"
                              priority={task.priority}
                            />
                          </TableCell>
                          <TableCell>
                            <StatusChip 
                              label={task.status} 
                              size="small"
                              status={task.status}
                            />
                          </TableCell>
                          <TableCell>{new Date(task.dueDate).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell align="right">
                            <ActionButton size="small" color="primary">
                              <VisibilityIcon fontSize="small" />
                            </ActionButton>
                            <ActionButton size="small" color="primary">
                              <EditIcon fontSize="small" />
                            </ActionButton>
                            <ActionButton 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </ActionButton>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="textSecondary">
                            Không có nhiệm vụ nào
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Container>
        </Box>
      </Box>

      {/* Add Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Giao nhiệm vụ mới</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiêu đề nhiệm vụ"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                variant="outlined"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Thực tập sinh</InputLabel>
                <Select
                  name="assignedTo"
                  value={newTask.assignedTo}
                  onChange={handleInputChange}
                  label="Thực tập sinh"
                  required
                >
                  {interns.map((intern) => (
                    <MenuItem key={intern} value={intern}>
                      {intern}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Độ ưu tiên</InputLabel>
                <Select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleInputChange}
                  label="Độ ưu tiên"
                  required
                >
                  <MenuItem value="Low">Thấp</MenuItem>
                  <MenuItem value="Medium">Trung bình</MenuItem>
                  <MenuItem value="High">Cao</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Hạn chót"
                value={newTask.dueDate}
                onChange={handleDateChange}
                minDate={new Date()}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    variant="outlined" 
                    required 
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <InputLabel sx={{ mb: 1, color: 'text.primary' }}>Mô tả</InputLabel>
              <StyledTextarea
                name="description"
                value={newTask.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả chi tiết nhiệm vụ"
                minRows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Hủy
          </Button>
          <Button 
            onClick={handleAddTask} 
            variant="contained" 
            color="primary"
            disabled={!newTask.title || !newTask.assignedTo || !newTask.dueDate}
          >
            Giao nhiệm vụ
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default MentorTasks;