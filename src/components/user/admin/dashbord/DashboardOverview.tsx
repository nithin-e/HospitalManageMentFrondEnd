import { BarChart, Bar, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/user/admin/ui/card";
import UserAvatar from "../ui/UserAvatar";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

// Sample data for stats
const stats = [
  {
    title: "Total patients",
    value: "5,000",
    change: "+22%",
    increasing: true,
    color: "bg-pink-50 text-pink-700",
  },
  {
    title: "New patients this week",
    value: "200",
    change: "-3%",
    increasing: false,
    color: "bg-orange-50 text-orange-700",
  },
  {
    title: "Doctors on this hospital",
    value: "100",
    change: "+5%",
    increasing: true,
    color: "bg-blue-50 text-blue-700",
  },
  {
    title: "Doctorscan this week",
    value: "19",
    change: "+1%",
    increasing: true,
    color: "bg-red-50 text-red-700",
  },
];

// Sample data for the chart
const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 900 },
];

// Sample updates
const updates = [
  {
    id: 1,
    user: { name: "Dr. Emily", avatar: "/lovable-uploads/9978582c-273f-4f6b-ab26-741320ce36c3.png" },
    action: "You added a new patient",
  },
  {
    id: 2,
    user: { name: "Nurse Sarah", avatar: "/lovable-uploads/9978582c-273f-4f6b-ab26-741320ce36c3.png" },
    action: "You added a new patient",
  },
];

const DashboardOverview = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent className={`${stat.color} rounded-md p-4`}>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center mt-1">
                {stat.increasing ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                <span>{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Patient Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Latest updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {updates.map((update) => (
              <div key={update.id} className="flex items-center space-x-4">
                <UserAvatar src={update.user.avatar} name={update.user.name} />
                <span>{update.action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardOverview;