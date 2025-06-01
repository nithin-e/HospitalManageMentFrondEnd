import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

// Create context
const SocketContext = createContext(null);

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

// Provider component
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  // State to store user block status (e.g., { userId: isBlocked })
  const [userBlockStatus, setUserBlockStatus] = useState({});

  useEffect(() => {
    console.log('Notification system initializing...');

    // Log socket connection details
    const socketUrl = 'http://localhost:5000/notification';
    console.log('Setting up notification channel at:', socketUrl);

    // Initialize socket connection with detailed options
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      withCredentials: true, 
    });

    // Set up event listeners with detailed logging
    newSocket.on('connect', () => {
      console.log('Notification service connected with ID:', newSocket.id);
      console.log('Notification transport method:', newSocket.io.engine.transport.name);
      setConnected(true);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Notification service connection error:', error);
      console.log('Notification connection options:', newSocket.io.opts);
      console.log('Notification transport:', newSocket.io.engine?.transport?.name || 'No transport');
      setConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log(`Notification service disconnected. Reason: ${reason}`);
      setConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`Notification service reconnected after ${attemptNumber} attempts`);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Notification service reconnection attempt #${attemptNumber}`);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Notification service reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('Notification service failed to reconnect after all attempts');
    });

    newSocket.on('error', (error) => {
      console.error('Notification service general error:', error);
    });

    // Listen for user_status_updated event
    newSocket.on('user_status_updated', (data) => {
      console.log('Received user block notification update:', data);
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
      console.log('Shutting down notification service connection');
      newSocket.disconnect();
    };
  }, []);

  // Log connection status changes
  useEffect(() => {
    console.log('Notification service status changed:', connected ? 'active' : 'inactive');
  }, [connected]);

  // Log user block status changes
  useEffect(() => {
    console.log('User notification block status updated:', userBlockStatus);
  }, [userBlockStatus]);

  // Value passed to consumers
  const value = {
    socket,
    connected,
    userBlockStatus, 
    isUserBlocked: (userId) => userBlockStatus[userId] ?? false, 
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};