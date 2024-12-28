// SocketContext.tsx

import { SOCKET_URL } from '@/const';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  connectSocket: () => Promise<Socket>;
  disconnectSocket: () => void;
  reconnectToRoom: (userId: number, roomCode: string) => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
  connectSocket: async () => {
    throw new Error('connectSocket not implemented');
  },
  disconnectSocket: () => {},
  reconnectToRoom: async () => {
    throw new Error('reconnectToRoom not implemented');
  },
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Promise-based socket connector:
   * - Resolves when the socket is actually 'connect'ed.
   * - Rejects if 'connect_error' happens.
   */
  const connectSocket = useCallback((): Promise<Socket> => {
    return new Promise((resolve, reject) => {
      // If we already have a socket & it's connected, just resolve immediately
      if (socket && socket.connected) {
        return resolve(socket);
      }

      try {
        if (!socket) {
          // Create a *new* socket
          const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            autoConnect: false,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000,
          });

          // Event: connect
          newSocket.on('connect', () => {
setIsConnected(true);
            setError(null);
            resolve(newSocket);
          });

          // Event: connect_error
          newSocket.on('connect_error', (err) => {
setError('Failed to connect to server');
            setIsConnected(false);
            reject(err);
          });

          // Event: disconnect
          newSocket.on('disconnect', () => {
setIsConnected(false);
          });

          // Event: reconnect
          newSocket.on('reconnect', () => {
setIsConnected(true);
            setError(null);
          });

          // Event: reconnect_error
          newSocket.on('reconnect_error', (err) => {
            console.error('Reconnection error:', err);
            setError('Failed to reconnect to server');
          });

          // Event: reconnect_failed
          newSocket.on('reconnect_failed', () => {
            console.error('Failed to reconnect after all attempts');
            setError('Failed to reconnect after multiple attempts');
          });

          // Actually connect
          newSocket.connect();
          setSocket(newSocket);
        } else {
          // We have a socket, but it's not connected:
          socket.once('connect', () => {
            setIsConnected(true);
            setError(null);
            resolve(socket);
          });

          socket.once('connect_error', (err) => {
            setError('Failed to connect to server');
            setIsConnected(false);
            reject(err);
          });

          socket.connect();
        }
      } catch (err) {
        console.error('Socket initialization error:', err);
        setError('Failed to initialize socket connection');
        reject(err);
      }
    });
  }, [socket]);

  /**
   * Reconnect to a specific room.
   * Returns a Promise that resolves when 'joinRoom' is emitted.
   */
  const reconnectToRoom = useCallback(
    async (userId: number, roomCode: string): Promise<void> => {
      try {
        const connectedSocket = await connectSocket();
        connectedSocket.emit('joinRoom', { userId, code: roomCode });
} catch (err) {
        console.error('Failed to reconnect and join room:', err);
        throw err; // Propagate the error to allow the caller to handle it
      }
    },
    [connectSocket]
  );

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
        error,
        connectSocket,
        disconnectSocket,
        reconnectToRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
