import { useState, useCallback, useEffect, useRef } from 'react';
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
  const [participantCount, setParticipantCount] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  
  const hasJoinedRoom = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const handleJoinRoomResponse = useCallback(
    (response: { success: boolean; message?: string }) => {
      console.log('📨 Received joinRoomResponse:', response);
      
      if (response.success) {
        console.log('✅ Successfully joined room');
        hasJoinedRoom.current = true;
        setIsReconnecting(false);
        setReconnectAttempts(0);
        setError(null);
        sessionStorage.setItem('roomCode', roomCode as string);
        sessionStorage.setItem('userId', userId as string);
      } else {
        console.log('❌ Failed to join room:', response.message);
        setError(response.message || 'Failed to join room.');
        setIsReconnecting(false);
        toast({
          title: 'Error',
          description: response.message || 'Failed to join room.',
          variant: 'destructive',
        });
      }
    },
    [roomCode, toast, userId]
  );

  const handleReconnection = useCallback(async () => {
    if (!userId || !roomCode || isReconnecting || hasJoinedRoom.current) {
      return;
    }
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      setError('Maximum reconnection attempts reached');
      setIsReconnecting(false);
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
      
      clearReconnectTimeout();
      
      if (socket) {
        socket.off('joinRoomResponse', handleJoinRoomResponse);
        socket.on('joinRoomResponse', handleJoinRoomResponse);
      }

      await reconnectToRoom(parseInt(userId, 10), roomCode);

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
        const backoffDelay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
        reconnectTimeoutRef.current = setTimeout(handleReconnection, backoffDelay);
      }
    }
  }, [userId, roomCode, reconnectAttempts, reconnectToRoom, toast, socket, handleJoinRoomResponse, isReconnecting]);

  // Handle connection state changes
  useEffect(() => {
    if (isConnected) {
      setIsReconnecting(false);
      if (!hasJoinedRoom.current && userId && roomCode) {
        socket?.emit('joinRoom', { userId: parseInt(userId, 10), code: roomCode });
      }
    }
  }, [isConnected, userId, roomCode, socket]);

  useEffect(() => {
    const storedRoomCode = sessionStorage.getItem('roomCode');
    const storedUserId = sessionStorage.getItem('userId');

    if (!storedRoomCode || !storedUserId || storedRoomCode !== roomCode) {
      navigate('/');
      return;
    }

    setUserId(storedUserId);

    if (!isConnected && !hasJoinedRoom.current) {
      handleReconnection();
    }

    if (socket) {
      const handleDisconnect = () => {
        hasJoinedRoom.current = false;
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          toast({
            title: 'Connection Lost',
            description: 'Attempting to reconnect...',
          });
          handleReconnection();
        }
      };

      socket.on('disconnect', handleDisconnect);
      socket.on('participantCount', (data: { count: number }) => {
        setParticipantCount(data.count);
      });

      return () => {
        socket.off('disconnect', handleDisconnect);
        socket.off('participantCount');
        socket.off('joinRoomResponse', handleJoinRoomResponse);
        clearReconnectTimeout();
      };
    }
  }, [roomCode, isConnected, navigate, handleReconnection, socket, reconnectAttempts, toast, handleJoinRoomResponse]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearReconnectTimeout();
      hasJoinedRoom.current = false;
      setIsReconnecting(false);
    };
  }, []);

  return {
    isConnected,
    isReconnecting,
    error,
    reconnectAttempts,
    MAX_RECONNECT_ATTEMPTS,
    userId,
    participantCount,
  };
};