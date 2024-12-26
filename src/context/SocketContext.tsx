import { SOCKET_URL } from '@/const';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectSocket: () => void;
  disconnectSocket: () => void;
  reconnectToRoom: (userId: number, roomCode: string) => void;
  error: string | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  connectSocket: () => {},
  disconnectSocket: () => {},
  reconnectToRoom: () => {},
  error: null,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectSocket = useCallback(() => {
    try {
      if (!socket) {
        const newSocket = io(SOCKET_URL || 'http://localhost:3000', {
          transports: ['websocket'],
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000,
        });

        // Socket event listeners
        newSocket.on('connect', () => {
          console.log('Socket connected:', newSocket.id);
          setIsConnected(true);
          setError(null);
        });

        newSocket.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
          console.error('Connection error:', err);
          setError('Failed to connect to server');
          setIsConnected(false);
        });

        newSocket.on('reconnect', (attemptNumber) => {
          console.log('Socket reconnected after', attemptNumber, 'attempts');
          setIsConnected(true);
          setError(null);
        });

        newSocket.on('reconnect_error', (err) => {
          console.error('Reconnection error:', err);
          setError('Failed to reconnect to server');
        });

        newSocket.on('reconnect_failed', () => {
          console.error('Failed to reconnect after all attempts');
          setError('Failed to reconnect after multiple attempts');
        });

        // Connect the socket
        newSocket.connect();
        setSocket(newSocket);
      } else if (!socket.connected) {
        socket.connect();
      }
    } catch (err) {
      console.error('Socket initialization error:', err);
      setError('Failed to initialize socket connection');
    }
  }, [socket]);

  const reconnectToRoom = useCallback((userId: number, roomCode: string) => {
    if (!socket || !socket.connected) {
      connectSocket();
    }

    if (socket && socket.connected) {
      socket.emit('joinRoom', { userId, code: roomCode });
    } else {
      const reconnectInterval = setInterval(() => {
        if (socket && socket.connected) {
          socket.emit('joinRoom', { userId, code: roomCode });
          clearInterval(reconnectInterval);
        }
      }, 1000);

      // Clear interval after 10 seconds if unsuccessful
      setTimeout(() => clearInterval(reconnectInterval), 10000);
    }
  }, [socket, connectSocket]);

  const disconnectSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
      setError(null);
    }
  }, [socket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connectSocket,
        disconnectSocket,
        reconnectToRoom,
        error,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};