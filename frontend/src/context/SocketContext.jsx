import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef(null);
  const [processingVideos, setProcessingVideos] = useState({});

  useEffect(() => {
    if (user) {
      // Connect to socket server
      socketRef.current = io('http://localhost:5000', {
        transports: ['websocket']
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        socket.emit('join-room', user.id);
      });

      // Listen for processing events
      socket.on('processing-started', ({ videoId }) => {
        setProcessingVideos(prev => ({
          ...prev,
          [videoId]: { progress: 0, status: 'processing', step: 'Starting...' }
        }));
      });

      socket.on('processing-progress', ({ videoId, progress, step }) => {
        setProcessingVideos(prev => ({
          ...prev,
          [videoId]: { progress, status: 'processing', step }
        }));
      });

      socket.on('processing-complete', ({ videoId, status, scores }) => {
        setProcessingVideos(prev => ({
          ...prev,
          [videoId]: { progress: 100, status, step: 'Complete', scores }
        }));
        // Remove from processing list after 5 seconds
        setTimeout(() => {
          setProcessingVideos(prev => {
            const updated = { ...prev };
            delete updated[videoId];
            return updated;
          });
        }, 5000);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, processingVideos }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
