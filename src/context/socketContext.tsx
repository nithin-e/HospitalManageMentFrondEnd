import { RootState } from "@/store/redux/store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

// Create context
const SocketContext = createContext(null);

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

// Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [userBlockStatus, setUserBlockStatus] = useState({});

  const selectUserAndDoctor = (state: RootState) => ({
    user: state.user?.user,
    doctor: state.doctor.data?.doctor
  });

      const doctors = useSelector((state: RootState) => state.doctor.data?.doctor);
  
      console.log('check this doctor data ---------',doctors);
      

  const { user, doctor } = useSelector(selectUserAndDoctor);

  console.log("brrrrroooooo check this out", user);

  useEffect(() => {
    console.log("SocketProvider initializing...");

    // Log socket connection details
const socketUrl = "http://localhost:6001/admin";
    console.log("Attempting to connect to socket server at:", socketUrl);

  

const newSocket = io(socketUrl, {
  transports: ["websocket"],
  withCredentials: true,      
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 20000
});




    newSocket.on("connect", () => {
      console.log("Socket connected successfully with ID:", newSocket.id);

      const userId = user?._id || doctors?.id || user || doctor;
      const email = user?.email || doctors?.email;
      const role = user ? "user" : doctors ? "doctor" : "admin";

      console.log("Emitting register with??????__-------------------:", {
        userId,
        role,
        email,
      });

      if (userId) {
        newSocket.emit("register", { userId, role, email });
      } else {
        console.error("No valid userId found for registration");
      }

      setConnected(true);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error details:", error);
      console.log("Connection options:", newSocket.io.opts);
      console.log(
        "Transport:",
        newSocket.io.engine?.transport?.name || "No transport"
      );
      setConnected(false);
    });

    newSocket.on("disconnect", (reason) => {
      console.log(`Socket disconnected. Reason: ${reason}`);
      setConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket reconnection attempt #${attemptNumber}`);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("Socket reconnection error:", error);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("Socket failed to reconnect after all attempts");
    });

    newSocket.on("error", (error) => {
      console.error("Socket general error:", error);
    });

    // Listen for user_status_updated event
    newSocket.on("user_status_updated", (data) => {
      console.log("Received user_status_updated event:", data);
      const { userId, isBlocked } = data;

      setUserBlockStatus((prev) => ({
        ...prev,
        [userId]: isBlocked,
      }));
    });

    // Store socket in state
    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      console.log("Cleaning up socket connection");
      newSocket.disconnect();
    };
  }, []);

  // Log connection status changes
  useEffect(() => {
    console.log("Socket connection status changed:", connected);
  }, [connected]);

  // Log user block status changes
  useEffect(() => {
    console.log("User block status updated:", userBlockStatus);
  }, [userBlockStatus]);

  const value = {
    socket,
    connected,
    userBlockStatus,
    isUserBlocked: (userId) => userBlockStatus[userId] ?? false,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
