
import React from "react";
import Sidebar from "../../Doctor/layout/Sidebar";
import AppointmentCard from "../../Doctor/components/AppointmentCard";
import AvailableTimeCard from "../../Doctor/components/AvailableTimeCard";
import StatsCard from "../../Doctor/components/StatusCard";

// Sample avatar image - using placeholder avatar
const sampleAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

const DoctorDashBoard: React.FC = () => {
  const doctorName = "Maria Smith";
  const currentHour = new Date().getHours();
  
  // Determine greeting based on time of day
  let greeting = "Good morning";
  if (currentHour >= 12 && currentHour < 18) {
    greeting = "Good afternoon";
  } else if (currentHour >= 18) {
    greeting = "Good evening";
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar doctorName={doctorName} />
      <div className="flex-1 overflow-y-auto">
        <main className="max-w-4xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-8">{greeting}, Dr. Smith</h1>

          {/* Today's appointments */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Today's appointments</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y">
                <AppointmentCard
                  name="Katie Johnson"
                  startTime="9:00 AM"
                  endTime="9:30 AM"
                />
                <AppointmentCard
                  name="Samuel Allen"
                  startTime="10:00 AM"
                  endTime="10:30 AM"
                  avatarUrl={sampleAvatar}
                />
                <AppointmentCard
                  name="Julie Williams"
                  startTime="11:00 AM"
                  endTime="11:30 AM"
                />
              </div>
            </div>
          </section>

          {/* Next available times */}
          <section className="mb-10">
            <h2 className="text-xl font-bold mb-4">Next available times</h2>
            <div className="bg-white rounded-lg shadow">
              <div className="divide-y">
                <AvailableTimeCard
                  title="New patient (20 min)"
                  day="Wed, 10th"
                  time="2:00 PM"
                />
                <AvailableTimeCard
                  title="Consultation (30 min)"
                  day="Thu, 11th"
                  time="3:00 PM"
                />
              </div>
            </div>
          </section>

          {/* Overview */}
          <section>
            <h2 className="text-xl font-bold mb-4">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatsCard
                title="Total patients"
                value="5,000"
                change={{ value: "2%", positive: true }}
              />
              <StatsCard
                title="New patients this week"
                value="200"
                change={{ value: "3%", positive: false }}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DoctorDashBoard;