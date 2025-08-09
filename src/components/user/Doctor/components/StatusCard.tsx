import React from "react";

interface StatusCardProps {
  title: string;
  value: number;
  total?: number;
  trendValue?: number;
  icon?: React.ReactNode;
  statusType?: 'scheduled' | 'completed' | 'cancelled' | 'confirmed' | 'default';
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  title, 
  value, 
  total, 
  trendValue, 
  icon,
  statusType = 'default'
}) => {
  // Determine colors based on status type
  const getStatusColors = () => {
    switch (statusType) {
      case 'scheduled':
        return { 
          bg: 'bg-blue-50', 
          text: 'text-blue-600', 
          trendPositive: 'text-blue-500', 
          trendNegative: 'text-blue-300' 
        };
      case 'completed':
        return { 
          bg: 'bg-green-50', 
          text: 'text-green-600', 
          trendPositive: 'text-green-500', 
          trendNegative: 'text-green-300' 
        };
      case 'cancelled':
        return { 
          bg: 'bg-red-50', 
          text: 'text-red-600', 
          trendPositive: 'text-red-500', 
          trendNegative: 'text-red-300' 
        };
      case 'confirmed':
        return { 
          bg: 'bg-purple-50', 
          text: 'text-purple-600', 
          trendPositive: 'text-purple-500', 
          trendNegative: 'text-purple-300' 
        };
      default:
        return { 
          bg: 'bg-gray-50', 
          text: 'text-gray-600', 
          trendPositive: 'text-gray-500', 
          trendNegative: 'text-gray-300' 
        };
    }
  };

  const colors = getStatusColors();
  const percentage = total ? Math.round((value / total) * 100) : 0;
  const trendPositive = trendValue ? trendValue >= 0 : true;
  const showTrend = trendValue !== undefined && !isNaN(trendValue);

  return (
    <div className={`${colors.bg} p-4 rounded-lg shadow-sm`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-sm font-medium ${colors.text} mb-1`}>{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon && (
          <div className={`p-2 rounded-full ${colors.bg.replace('50', '100')}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        {total !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${colors.text.replace('text', 'bg')}`} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        )}
        
        {showTrend && (
          <span className={`ml-2 text-sm font-medium ${trendPositive ? colors.trendPositive : colors.trendNegative}`}>
            {trendPositive ? '↑' : '↓'} {Math.abs(trendValue)}%
          </span>
        )}
      </div>
      
      {total !== undefined && (
        <p className="mt-1 text-xs text-gray-500">{percentage}% of total</p>
      )}
    </div>
  );
};

export default StatusCard;