import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
} from '@mui/material';
import {
  Add,
  ListAlt,
  Group,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useTodoLists } from '../../hooks';
import { ListGrid, CreateListDialog } from '../../components/todo-lists';
import { useNavigate } from 'react-router-dom';
import { useTodoStats } from '../../hooks/useTodoStats';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lists, loading, error, refetch } = useTodoLists();
  const { stats: todoStats, refetch: refetchStats } = useTodoStats();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateList = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    refetch();
    refetchStats(); // Also refresh the stats
  };

  // Calculate stats from actual data
  const myListsCount = lists.filter(list => !list.isArchived).length;
  const completedTasksCount = todoStats?.completed || 0;
  const collaboratingCount = lists.filter(list => list.members.length > 1).length;
  const pendingTasksCount = todoStats ? (todoStats.notStarted + todoStats.inProgress) : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" gutterBottom>
          Welcome back, {user?.firstName}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your todos and collaborate with your team effectively.
        </Typography>
      </Box>

      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <ListAlt color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">My Lists</Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {myListsCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Todo Lists
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Completed</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {completedTasksCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tasks Done
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Group color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">Collaborating</Typography>
              </Box>
              <Typography variant="h4" color="secondary.main">
                {collaboratingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Shared Lists
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Add color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {pendingTasksCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Open Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Todo Lists */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">
              My Todo Lists
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                onClick={() => navigate('/lists')}
              >
                View All Lists
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleCreateList}
              >
                Create List
              </Button>
            </Box>
          </Box>
          
          <ListGrid
            lists={lists.slice(0, 8)} // Show up to 8 lists on dashboard
            loading={loading}
            error={error}
            onListClick={(list) => {
              navigate(`/lists/${list.id}`);
            }}
            onCreateList={handleCreateList}
            emptyStateTitle="No todo lists yet"
            emptyStateMessage="Create your first todo list to start organizing your tasks and collaborating with others."
            showCreateButton={true}
          />
        </CardContent>
      </Card>
      
      {/* Create List Dialog */}
      <CreateListDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Container>
  );
};

export default Dashboard;