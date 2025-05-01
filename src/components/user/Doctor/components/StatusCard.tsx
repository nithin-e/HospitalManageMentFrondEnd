import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    positive: boolean;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change }) => {
  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {change && (
        <p
          className={`text-sm ${
            change.positive ? "text-green-500" : "text-red-500"
          }`}
        >
          {change.positive ? "+" : "-"}
          {change.value}
        </p>
      )}
    </div>
  );
};

export default StatsCard;