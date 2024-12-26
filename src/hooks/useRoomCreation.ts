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
    console.log('🔄 Starting waitForSocketConnection');
    console.log('Current connection status:', isConnected);
    
    return new Promise((resolve, reject) => {
      const maxAttempts = 5;
      let attempts = 0;
      console.log('Setting up connection check interval');
      
      const interval = setInterval(() => {
        console.log(`Connection attempt ${attempts + 1}/${maxAttempts}`);
        console.log('isConnected status:', isConnected);
        
        if (isConnected) {
          console.log('✅ Socket connected successfully');
          clearInterval(interval);
          resolve();
        } else if (attempts >= maxAttempts) {
          console.log('❌ Max connection attempts reached');
          clearInterval(interval);
          reject(new Error('Failed to connect to WebSocket server.'));
        }
        attempts++;
      }, 1000);
    });
  };

  const handleCreateNewGame = async () => {
    console.log('🎮 Starting handleCreateNewGame');
    console.log('Current userData:', userData);
    console.log('Current socket status:', { 
      socketExists: !!socket, 
      isConnected, 
      creatingRoom 
    });

    if (!userData) {
      console.log('❌ No user data found');
      toast({
        title: 'Error',
        description: 'User data is missing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('🔄 Setting creatingRoom to true');
      setCreatingRoom(true);

      console.log('📡 Calling createRoom API');
      const { code } = await createRoom(userData.id);
      console.log('📝 Room created with code:', code);
      setRoomCode(code);

      console.log('🔌 Initiating socket connection');
      connectSocket();

      console.log('⏳ Waiting for socket connection');
      await waitForSocketConnection();

      const setupRoomJoin = () => {
        console.log('🎯 Setting up room join handlers');
        if (!socket) {
          console.log('❌ No socket available for room join');
          return;
        }

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

          console.log('🧹 Cleaning up joinRoomResponse listener');
          socket.off('joinRoomResponse', handleJoinRoomResponse);
          setCreatingRoom(false);
        };

        // Remove any existing listeners before adding new one
        socket.off('joinRoomResponse');
        console.log('👂 Adding joinRoomResponse listener');
        socket.on('joinRoomResponse', handleJoinRoomResponse);

        console.log('📣 Emitting joinRoom event', { userId: userData.id, code });
        socket.emit('joinRoom', { userId: userData.id, code });

        console.log('⏲️ Setting up timeout handler');
        setTimeout(() => {
          console.log('⌛ Checking timeout condition');
          socket.off('joinRoomResponse', handleJoinRoomResponse);
          if (!roomCode) {
            console.log('❌ Join room timed out');
            return;
          }
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
      console.error('❌ Error in handleCreateNewGame:', error);
      console.log('Error details:', {
        message: error.message,
        stack: error.stack,
        socketStatus: socket?.connected
      });
      
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