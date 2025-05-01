
import React from "react";
import { PlusCircle } from "lucide-react";

interface AvailableTimeCardProps {
  title: string;
  day: string;
  time: string;
}

const AvailableTimeCard: React.FC<AvailableTimeCardProps> = ({
  title,
  day,
  time,
}) => {
  return (
    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
      <div className="flex items-center">
        <div className="mr-4">
          <PlusCircle size={20} className="text-gray-400" />
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-500">
            {day} at {time}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AvailableTimeCard;