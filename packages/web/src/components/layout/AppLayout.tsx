import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Button,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Settings,
  List,
  Assignment,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{ 
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ fontWeight: 700, cursor: 'pointer' }}
            onClick={() => navigate('/lists')}
          >
            TodoFlow
          </Typography>
          
          {user && (
            <Box display="flex" alignItems="center" gap={1} mx={4}>
              <Button
                color="inherit"
                startIcon={<List />}
                onClick={() => navigate('/lists')}
                sx={{ color: 'text.primary' }}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                startIcon={<Assignment />}
                onClick={() => navigate('/todos')}
                sx={{ color: 'text.primary' }}
              >
                Todos
              </Button>
            </Box>
          )}
          
          <Box sx={{ flexGrow: 1 }} />

          {user && (
            <>
              <Chip
                label={`${user.firstName} ${user.lastName}`}
                avatar={
                  <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    {getInitials(user.firstName, user.lastName)}
                  </Avatar>
                }
                variant="outlined"
                onClick={() => navigate('/profile')}
                sx={{ 
                  mr: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              />
              
              <IconButton
                size="large"
                edge="end"
                aria-label="account menu"
                aria-controls="account-menu"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              
              <Menu
                id="account-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                  <Settings sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, bgcolor: 'background.default' }}>
        {children}
      </Box>
    </Box>
  );
};

export default AppLayout;