// src/components/customer/ui/StatusBadge.jsx
import { useTheme } from '@/contexts/ThemeContext';

export const StatusBadge = ({ status, statusCode }) => {
  const theme = useTheme();
  
  const getStatusColor = (statusCode) => {
    switch(statusCode) {
      case 1: return theme.statusPending;
      case 2: return theme.statusProcessing;
      case 3: return theme.statusShipped;
      case 4: return theme.statusDelivered;
      default: return theme.info;
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '5px'
    }}>
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: getStatusColor(statusCode)
      }}></span>
      <span style={{
        fontSize: '13px',
        fontWeight: '500',
        color: getStatusColor(statusCode)
      }}>
        {status}
      </span>
    </div>
  );
};