import React from 'react';
import {
  Box,
  Chip,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Wifi,
  WifiOff,
  SyncProblem,
} from '@mui/icons-material';

interface ConnectionStatusProps {
  status: 'connected' | 'connecting' | 'disconnected';
  listId?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ status, listId }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          label: 'Live',
          color: 'success' as const,
          icon: <Wifi sx={{ fontSize: 16 }} />,
          tooltip: 'Real-time collaboration is active',
        };
      case 'connecting':
        return {
          label: 'Connecting',
          color: 'warning' as const,
          icon: <CircularProgress size={16} />,
          tooltip: 'Connecting to real-time updates...',
        };
      case 'disconnected':
      default:
        return {
          label: 'Offline',
          color: 'error' as const,
          icon: <WifiOff sx={{ fontSize: 16 }} />,
          tooltip: 'Real-time collaboration is not available',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Tooltip title={config.tooltip} arrow>
      <Box>
        <Chip
          size="small"
          label={config.label}
          color={config.color}
          icon={config.icon}
          variant="outlined"
          sx={{
            fontSize: '0.75rem',
            height: 24,
            '& .MuiChip-icon': {
              fontSize: 16,
            },
          }}
        />
      </Box>
    </Tooltip>
  );
};

export default ConnectionStatus;