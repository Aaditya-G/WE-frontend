import { useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '@/services/api/start';
import { _USER } from '@/types';

export const useRoomCreation = (userData: _USER | null) => {
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const { socket, connectSocket, disconnectSocket, isConnected } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  const waitForSocketConnection = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const maxAttempts = 5;
      let attempts = 0;
      const interval = setInterval(() => {
        if (isConnected) {
          clearInterval(interval);
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          reject(new Error('Failed to connect to WebSocket server.'));
        }
        attempts++;
      }, 1000);
    });
  };

  const handleCreateNewGame = async () => {
    if (!userData) {
      toast({
        title: 'Error',
        description: 'User data is missing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCreatingRoom(true);
      const { code } = await createRoom(userData.id);
      setRoomCode(code);
      
      connectSocket();
      await waitForSocketConnection();

      const setupRoomJoin = () => {
        if (!socket) return;

        const handleJoinRoomResponse = (response: { success: boolean; message?: string }) => {
          if (response.success) {
            sessionStorage.setItem('roomCode', code);
            sessionStorage.setItem('userId', userData.id.toString());
            navigate(`/play/${code}`);
          } else {
            toast({
              title: 'Error',
              description: response.message || 'Failed to join room.',
              variant: 'destructive',
            });
          }
          socket.off('joinRoomResponse', handleJoinRoomResponse);
          setCreatingRoom(false);
        };

        socket.on('joinRoomResponse', handleJoinRoomResponse);
        socket.emit('joinRoom', { userId: userData.id, code });

        setTimeout(() => {
          socket.off('joinRoomResponse', handleJoinRoomResponse);
          if (!roomCode) return;
          toast({
            title: 'Error',
            description: 'Timed out joining the room. Please try again.',
            variant: 'destructive',
          });
          setCreatingRoom(false);
        }, 5000);
      };

      setupRoomJoin();

    } catch (error: any) {
      console.error('Error in handleCreateNewGame:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create room. Please try again.',
        variant: 'destructive',
      });
      setCreatingRoom(false);
      disconnectSocket();
    }
  };

  return {
    creatingRoom,
    roomCode,
    handleCreateNewGame,
  };
};