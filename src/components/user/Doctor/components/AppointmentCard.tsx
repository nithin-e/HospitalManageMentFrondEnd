import React from "react";
import { Button } from "@/components/user/Doctor/DoctorUi/button";

interface AppointmentCardProps {
  name: string;
  startTime: string;
  endTime: string;
  avatarUrl?: string;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  name,
  startTime,
  endTime,
  avatarUrl,
}) => {
  return (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
      <div className="flex items-center">
        {avatarUrl && (
          <div className="w-10 h-10 rounded-full overflow-hidden mr-4">
            <img
              src={avatarUrl}
              alt={`${name}'s avatar`}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-gray-500">
            {startTime} - {endTime}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm">
        Start
      </Button>
    </div>
  );
};

export default AppointmentCard;