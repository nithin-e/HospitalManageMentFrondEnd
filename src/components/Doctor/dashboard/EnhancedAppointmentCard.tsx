import React from 'react';

interface EnhancedAppointmentCardProps {
  name: string;
  startTime: string;
  endTime: string;
  avatarUrl: string;
  isBeeping: boolean;
  status?: string;
  prescriptionStatus?: any;
  onStartClick: () => void;
  onAddPrescriptionClick?: () => void;
}

const EnhancedAppointmentCard: React.FC<EnhancedAppointmentCardProps> = ({ 
  name, 
  startTime, 
  endTime, 
  avatarUrl, 
  isBeeping, 
  status, 
  prescriptionStatus, 
  onStartClick, 
  onAddPrescriptionClick 
}) => {
  const getStatusInfo = () => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800', text: 'Completed' };
      case 'confirmed':
        return { color: 'bg-blue-100 text-blue-800', text: 'Confirmed' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', text: 'Cancelled' };
      case 'no-show':
        return { color: 'bg-gray-100 text-gray-800', text: 'No Show' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: 'Scheduled' };
    }
  };

  const statusInfo = getStatusInfo();
  const isCompleted = status?.toLowerCase() === 'completed';
  const isCancelled = status?.toLowerCase() === 'cancelled';
  const prescriptionStatusNot = prescriptionStatus?.toLowerCase() === 'not done';

  return (
    <>
      <style>
        {`
          @keyframes beep {
            0% {
              transform: scale(1);
              background-color: #ef4444;
            }
            100% {
              transform: scale(1.05);
              background-color: #dc2626;
            }
          }
          @keyframes pulseBackground {
            0% {
              opacity: 0.3;
            }
            50% {
              opacity: 0.1;
            }
            100% {
              opacity: 0.3;
            }
          }
        `}
      </style>
      
      <div className="flex items-center justify-between p-4 relative">
        {isBeeping && (
          <div 
            className="absolute inset-0 bg-red-100 opacity-0 rounded-lg"
            style={{
              animation: 'pulseBackground 2s infinite',
              zIndex: 0
            }}
          />
        )}
        
        <div className="flex items-center z-10">
          {/* <img 
            src={avatarUrl} 
            alt={name} 
            className="w-12 h-12 rounded-full mr-4"
          /> */}
          <div>
            <div className="flex items-center">
              <h3 className="font-medium mr-2">{name}</h3>
              {status && (
                <span className={`text-xs px-2 py-1 rounded-full ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm">
              {startTime} {endTime && `- ${endTime}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 z-10">
          {prescriptionStatusNot && isCompleted && onAddPrescriptionClick && (
            <button
              onClick={onAddPrescriptionClick}
              className="px-3 py-2 rounded-lg font-medium bg-green-500 text-white hover:bg-green-600 transition-colors duration-300 text-sm"
            >
              Add Prescription
            </button>
          )}
          
          <button
            onClick={onStartClick}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 relative ${
              isBeeping
                ? 'bg-red-500 text-white shadow-lg transform scale-105'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
            style={{
              animation: isBeeping ? 'beep 0.5s infinite alternate' : 'none',
            }}
            disabled={isCompleted || isCancelled}
          >
            {isCompleted ? 'Completed' : 
             isCancelled ? 'Cancelled' : 'Start'}
          </button>
        </div>
      </div>
    </>
  );
};

export default EnhancedAppointmentCard;