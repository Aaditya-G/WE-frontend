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

  const handleReconnection = useCallback(async () => {
    if (!userId || !roomCode) return;
    
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      setError('Maximum reconnection attempts reached');
      return;
    }

    try {
      setIsReconnecting(true);
      setReconnectAttempts(prev => prev + 1);
      
      await reconnectToRoom(parseInt(userId), roomCode);
      
      setIsReconnecting(false);
      setError(null);
      toast({
        title: 'Reconnected',
        description: 'Successfully reconnected to the game room',
      });
    } catch (err) {
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
  }, [userId, roomCode, reconnectToRoom, reconnectAttempts, toast]);

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
  }, [roomCode, isConnected, navigate, handleReconnection, socket, reconnectAttempts]);

  // Try to reconnect when connection is lost
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