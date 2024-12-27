import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '@/services/api/start';
import { _USER } from '@/types';

export const useRoomCreation = (userData: _USER | null) => {
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const { socket, connectSocket, disconnectSocket } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Use ref to track if response handler is set up
  const handlerSetupRef = useRef(false);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (socket) {
      socket.off('joinRoomResponse');
      socket.off('createRoomResponse');
    }
    handlerSetupRef.current = false;
  }, [socket]);

  const handleCreateNewGame = useCallback(async () => {
    if (!userData) {
      toast({
        title: 'Error',
        description: 'User data is missing.',
        variant: 'destructive',
      });
      return;
    }

    // Prevent multiple attempts
    if (creatingRoom) {
      console.log('Room creation already in progress');
      return;
    }

    try {
      setCreatingRoom(true);

      // 1. Ensure we have a connected socket
      let currentSocket = socket;
      if (!currentSocket?.connected) {
        currentSocket = await connectSocket();
      }

      if (!currentSocket) {
        throw new Error('Failed to establish socket connection');
      }

      // 2. Create room in backend
      const { code } = await createRoom(userData.id);
      console.log('Room created with code:', code);
      setRoomCode(code);

      // 3. Set up response handlers (only if not already set up)
      if (!handlerSetupRef.current) {
        handlerSetupRef.current = true;

        const handleResponse = (response: { success: boolean; message?: string }) => {
          console.log('Received response:', response);
          
          if (response.success) {
            sessionStorage.setItem('roomCode', code);
            sessionStorage.setItem('userId', userData.id.toString());
            navigate(`/play/${code}`,);
          } else {
            toast({
              title: 'Error',
              description: response.message || 'Failed to join room.',
              variant: 'destructive',
            });
          }
          cleanup();
        };

        // Clean up existing listeners first
        currentSocket.off('joinRoomResponse');
        currentSocket.off('createRoomResponse');
        
        // Add new listeners that will auto-remove after first trigger
        currentSocket.once('joinRoomResponse', handleResponse);
        currentSocket.once('createRoomResponse', handleResponse);
      }

      // 4. Emit join room event
      console.log('Emitting joinRoom event');
      currentSocket.emit('joinRoom', { userId: userData.id, code });

    } catch (error: any) {
      console.error('Error in handleCreateNewGame:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create room.',
        variant: 'destructive',
      });
      cleanup();
      disconnectSocket();
    }
  }, [userData, creatingRoom, socket, connectSocket, disconnectSocket, toast, navigate, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    creatingRoom,
    roomCode,
    handleCreateNewGame,
  };
};