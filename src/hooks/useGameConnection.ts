// useGameConnection.ts

import { useState, useCallback, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface GameConnectionProps {
  roomCode: string | undefined;
}

export const useGameConnection = ({ roomCode }: GameConnectionProps) => {
  const navigate = useNavigate();
  const { socket, isConnected, reconnectToRoom, error: socketError } = useSocket();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [error, setError] = useState<string | null>(socketError);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const handleJoinRoomResponse = useCallback(
    (response: { success: boolean; message?: string }) => {
      console.log('📨 Received joinRoomResponse:', response);
      
      if (response.success) {
        console.log('✅ Successfully joined room');
        sessionStorage.setItem('roomCode', roomCode as string);
        sessionStorage.setItem('userId', userId as string);
        navigate(`/play/${roomCode}`);
      } else {
        console.log('❌ Failed to join room:', response.message);
        setError(response.message || 'Failed to join room.');
        toast({
          title: 'Error',
          description: response.message || 'Failed to join room.',
          variant: 'destructive',
        });
      }

      // Clean up
      if (socket) {
        socket.off('joinRoomResponse', handleJoinRoomResponse);
      }
      setIsReconnecting(false);
      
    },
    [navigate, roomCode, toast, userId, socket]
  );

  const handleReconnection = useCallback(async () => {
    if (!userId || !roomCode) return;
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      setError('Maximum reconnection attempts reached');
      toast({
        title: 'Connection Lost',
        description: 'Unable to reconnect after multiple attempts. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsReconnecting(true);
      setReconnectAttempts(prev => prev + 1);
      
      await reconnectToRoom(parseInt(userId, 10), roomCode);
      
      if (socket) {
        // Remove any existing listeners to prevent duplicates
        socket.off('joinRoomResponse', handleJoinRoomResponse);

        // Add the listener for 'joinRoomResponse'
        socket.on('joinRoomResponse', handleJoinRoomResponse);

        // Emit 'joinRoom' event
        socket.emit('joinRoom', { userId: parseInt(userId, 10), code: roomCode });

        console.log('⏳ Waiting for joinRoomResponse...');
      }

    } catch (err: any) {
      setIsReconnecting(false);
      setError(err instanceof Error ? err.message : 'Failed to reconnect');
      
      if (reconnectAttempts + 1 >= MAX_RECONNECT_ATTEMPTS) {
        toast({
          title: 'Connection Lost',
          description: 'Unable to reconnect after multiple attempts. Please refresh the page.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Reconnection Failed',
          description: 'Failed to reconnect to the game room. Retrying...',
          variant: 'destructive',
        });
      }
    }
  }, [userId, roomCode, reconnectAttempts, reconnectToRoom, toast, socket, handleJoinRoomResponse]);

  useEffect(() => {
    const storedRoomCode = sessionStorage.getItem('roomCode');
    const storedUserId = sessionStorage.getItem('userId');

    if (!storedRoomCode || !storedUserId || storedRoomCode !== roomCode) {
      navigate('/');
      return;
    }

    setUserId(storedUserId);

    if (!isConnected && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      handleReconnection();
    }

    if (socket) {
      const handleDisconnect = () => {
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          toast({
            title: 'Connection Lost',
            description: 'Attempting to reconnect...',
          });
          handleReconnection();
        }
      };

      socket.on('disconnect', handleDisconnect);

      return () => {
        socket.off('disconnect', handleDisconnect);
      };
    }
  }, [roomCode, isConnected, navigate, handleReconnection, socket, reconnectAttempts, toast]);

  // Optional: Try to reconnect when connection status changes
  useEffect(() => {
    if (!isConnected && userId && roomCode && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      handleReconnection();
    }
  }, [isConnected, userId, roomCode, handleReconnection, reconnectAttempts]);

  return {
    isConnected,
    isReconnecting,
    error,
    reconnectAttempts,
    MAX_RECONNECT_ATTEMPTS,
    userId,
  };
};
