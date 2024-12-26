import { useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { createRoom } from '@/services/api/start';
import { _USER } from '@/types';

export const useRoomCreation = (userData: _USER | null) => {
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const { connectSocket, disconnectSocket } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateNewGame = async () => {
    console.log('🎮 Starting handleCreateNewGame');
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

      // 1. Create the room
      const { code } = await createRoom(userData.id);
      console.log('📝 Room created with code:', code);
      setRoomCode(code);

      // 2. Connect the socket (and wait for it to actually connect)
      const connectedSocket = await connectSocket();
      console.log(
        '🔗 Socket is actually connected:',
        connectedSocket.connected,
        connectedSocket.id
      );

      // 3. Set up listener for joinRoomResponse
      const handleJoinRoomResponse = (response: { success: boolean; message?: string }) => {
        console.log('📨 Received joinRoomResponse:', response);
        
        if (response.success) {
          console.log('✅ Successfully joined room');
          sessionStorage.setItem('roomCode', code);
          sessionStorage.setItem('userId', userData.id.toString());
          navigate(`/play/${code}`);
        } else {
          console.log('❌ Failed to join room:', response.message);
          toast({
            title: 'Error',
            description: response.message || 'Failed to join room.',
            variant: 'destructive',
          });
        }

        connectedSocket.off('joinRoomResponse', handleJoinRoomResponse);
        setCreatingRoom(false);
      };

      // Remove old listeners to prevent duplicates
      connectedSocket.off('joinRoomResponse');

      // Add the new listener
      connectedSocket.on('joinRoomResponse', handleJoinRoomResponse);

      // 4. Emit "joinRoom"
      connectedSocket.emit('joinRoom', { userId: userData.id, code });

      // (Optional) Timeout handling
      setTimeout(() => {
        // If still "creatingRoom", maybe we never got a response
        if (creatingRoom) {
          console.log('❌ Timed out joining the room');
          connectedSocket.off('joinRoomResponse', handleJoinRoomResponse);
          toast({
            title: 'Error',
            description: 'Timed out joining the room. Please try again.',
            variant: 'destructive',
          });
          setCreatingRoom(false);
        }
      }, 5000);
    } catch (error: any) {
      console.error('❌ Error in handleCreateNewGame:', error);
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
