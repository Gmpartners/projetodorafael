// src/components/customer/ui/ProgressBar.jsx
import { useTheme } from '@/contexts/ThemeContext';

export const ProgressBar = ({ progress, statusCode, height = '6px' }) => {
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
      width: '100%',
      height: height,
      backgroundColor: 'rgba(123, 44, 191, 0.1)',
      borderRadius: height === '6px' ? '3px' : '2px',
      overflow: 'hidden'
    }}>
      <div className="progress-bar" style={{
        height: '100%',
        width: `${progress}%`,
        background: getStatusColor(statusCode),
        borderRadius: height === '6px' ? '3px' : '2px',
        position: 'relative'
      }}>
        {statusCode < 4 && (
          <div className="progress-pulse" style={{
            position: 'absolute',
            right: '0',
            top: '0',
            height: '100%',
            width: '15px',
            background: 'rgba(255, 255, 255, 0.6)',
            filter: 'blur(3px)',
            animation: 'pulse 1.5s infinite'
          }}></div>
        )}
      </div>
    </div>
  );
};