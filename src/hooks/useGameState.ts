import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/hooks/use-toast';

interface UserEntity {
  id: number;
  name: string;
}

interface Participant {
  id: number;        // user ID
  isCheckedIn: boolean;
  giftId: number | null;       // or undefined
  receivedGiftId: number | null; // or undefined
}

interface GameState {
  status: string; // e.g. 'NOT_STARTED', 'CHECKING', etc.
  owner: UserEntity;
  users: Participant[];
  gifts: any[];  // your gift structure here
  currentTurn: number | null; 
}

export const useGameState = (userId: string | null) => {
  const { socket } = useSocket();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Listen for real-time gameStateUpdate
  useEffect(() => {
    if (!socket) return;

    const handleGameStateUpdate = (response: { success: boolean; gameState: GameState; message?: string }) => {
      if (!response.success) {
        // Optionally handle error
        console.error('Failed to retrieve game state:', response.message);
        return;
      }
      setGameState(response.gameState);
    };

    socket.on('gameStateUpdate', handleGameStateUpdate);

    // Cleanup
    return () => {
      socket.off('gameStateUpdate', handleGameStateUpdate);
    };
  }, [socket]);

  // Helper to retrieve the game state on demand
  const getGameState = useCallback(() => {
    if (!socket || !userId) return;
    socket.emit('getGameState', { userId: Number(userId) });
  }, [socket, userId]);

  // ----- Socket emit actions -----
  const addGift = useCallback(
    (giftName: string) => {
      if (!socket || !userId) return;
      socket.emit('addGift', { userId: Number(userId), giftName }, (response: any) => {
        console.log("addGift response", response)
        if (response?.success === false) {
          toast({
            title: 'Add Gift Error',
            description: response?.message || 'Unable to add gift',
            variant: 'destructive',
          });
        }
      });
    },
    [socket, userId, toast]
  );

  const checkIn = useCallback(() => {
    if (!socket || !userId) return;
    socket.emit('checkIn', { userId: Number(userId) }, (response: any) => {
      if (response?.success === false) {
        toast({
          title: 'Check-in Error',
          description: response?.message || 'Unable to check in',
          variant: 'destructive',
        });
      }
    });
  }, [socket, userId, toast]);

  const startChecking = useCallback(() => {
    console.log("I was clicked")
    if (!socket || !userId) return;
    socket.emit('startChecking', { userId: Number(userId) }, (response: any) => {
        console.log("startChecking response", response)
      if (response?.success === false) {
        toast({
          title: 'Start Checking Error',
          description: response?.message || 'Unable to start checking',
          variant: 'destructive',
        });
      }
    });
  }, [socket, userId, toast]);

  // ----- Derived booleans for UI -----
  const userHasNextTurn = useMemo(() => {
    if (!gameState || !userId) return false;
    return gameState.currentTurn === Number(userId);
  }, [gameState, userId]);

  const canAddGift = useMemo(() => {
    if (!gameState || !userId) return false;
    // Example condition: game not started + user hasn't added a gift yet
    if (gameState.status !== 'NOT_STARTED') return false;
    const currentUser = gameState.users.find(u => u.id === Number(userId));
    // Suppose we consider "has no gift" as giftId = null
    return !!currentUser && currentUser.giftId == null;
  }, [gameState, userId]);

  const canCheckIn = useMemo(() => {
    if (!gameState || !userId) return false;
    // Example condition: user has added a gift, but not checked in
    const currentUser = gameState.users.find(u => u.id === Number(userId));
    if (!currentUser) return false;
    return currentUser.giftId != null && !currentUser.isCheckedIn;
  }, [gameState, userId]);

  const canStartChecking = useMemo(() => {
    if (!gameState || !userId) return false;
    // Example condition: user is the owner + game status is NOT_STARTED
    const isOwner = gameState.owner?.id === Number(userId);
    return isOwner && gameState.status === 'NOT_STARTED';
  }, [gameState, userId]);

  return {
    gameState,
    getGameState,
    addGift,
    checkIn,
    startChecking,
    userHasNextTurn,
    canAddGift,
    canCheckIn,
    canStartChecking,
  };
};
