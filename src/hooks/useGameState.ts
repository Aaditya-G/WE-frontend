import { useCallback, useEffect, useMemo, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/hooks/use-toast";

interface UserEntity {
  id: number;
  name: string;
}

interface Participant {
  name: string;
  id: number; // user ID
  isCheckedIn: boolean;
  giftId: number | null; // or undefined
  receivedGiftId: number | null; // or undefined
}

interface GameState {
  status: string; // e.g. 'NOT_STARTED', 'CHECKING', etc.
  owner: UserEntity;
  users: Participant[];
  gifts: any[]; // your gift structure here
  currentTurn: number | null;
  totalStealsSoFar: number;
  maxStealPerUser: number;
  maxStealPerGame: number;
  turnOrder: number[];
}

export const useGameState = (userId: string | null) => {
  const { socket } = useSocket();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Listen for real-time gameStateUpdate
  useEffect(() => {
    if (!socket) return;

    const handleGameStateUpdate = (response: {
      success: boolean;
      gameState: GameState;
      message?: string;
    }) => {
      if (!response.success) {
        // Optionally handle error
        console.error("Failed to retrieve game state:", response.message);
        return;
      }
      setGameState(response.gameState);
    };

    socket.on("gameStateUpdate", handleGameStateUpdate);

    // Cleanup
    return () => {
      socket.off("gameStateUpdate", handleGameStateUpdate);
    };
  }, [socket]);

  // Helper to retrieve the game state on demand
  const getGameState = useCallback(() => {
    if (!socket || !userId) return;
    socket.emit("getGameState", { userId: Number(userId) });
  }, [socket, userId]);

  // ----- Socket emit actions -----
  const addGift = useCallback(
    (giftName: string) => {
      if (!socket || !userId) return;
      socket.emit(
        "addGift",
        { userId: Number(userId), giftName },
        (response: any) => {
          console.log("addGift response", response);
          if (response?.success === false) {
            toast({
              title: "Add Gift Error",
              description: response?.message || "Unable to add gift",
              variant: "destructive",
            });
          }
        }
      );
    },
    [socket, userId, toast]
  );

  const checkIn = useCallback(() => {
    if (!socket || !userId) return;
    socket.emit("checkIn", { userId: Number(userId) }, (response: any) => {
      if (response?.success === false) {
        toast({
          title: "Check-in Error",
          description: response?.message || "Unable to check in",
          variant: "destructive",
        });
      }
    });
  }, [socket, userId, toast]);

  const startChecking = useCallback(() => {
    console.log("I was clicked");
    if (!socket || !userId) return;
    socket.emit(
      "startChecking",
      { userId: Number(userId) },
      (response: any) => {
        console.log("startChecking response", response);
        if (response?.success === false) {
          toast({
            title: "Start Checking Error",
            description: response?.message || "Unable to start checking",
            variant: "destructive",
          });
        }
      }
    );
  }, [socket, userId, toast]);

  const startGame = useCallback(() => {
    if (!socket || !userId) return;
    socket.emit("startGame", { userId: Number(userId) }, (response: any) => {
      console.log("startGame response", response);
      if (response?.success === false) {
        toast({
          title: "Start Game Error",
          description: response?.message || "Unable to start game",
          variant: "destructive",
        });
      }
    });
  }, [socket, userId, toast]);

  const pickGift = useCallback((giftId: number) => {
    if (!socket || !userId) return;
    socket.emit("pickGift", { userId: Number(userId), giftId }, (response: any) => {
      if (response?.success === false) {
        toast({
          title: "Pick Gift Error",
          description: response?.message || "Unable to pick gift",
          variant: "destructive",
        });
      }
    });
  }, [socket, userId, toast]);

  const stealGift = useCallback((giftId: number) => {
    if (!socket || !userId) return;
    socket.emit("stealGift", { userId: Number(userId), giftId }, (response: any) => {
      if (response?.success === false) {
        toast({
          title: "Steal Gift Error",
          description: response?.message || "Unable to steal gift",
          variant: "destructive",
        });
      }
    });
  }, [socket, userId, toast]);

  // ----- Derived booleans for UI -----
  const userHasNextTurn = useMemo(() => {
    if (!gameState || !userId) return false;
    return gameState.currentTurn === Number(userId);
  }, [gameState, userId]);

  const canPickGift = useMemo(() => {
    if (!gameState || !userId) return false;
    // must be ongoing, user must have the turn, maybe user shouldn't already own a gift, etc.
    return (
      gameState.status === "ONGOING" &&
      userHasNextTurn
      // plus any other condition, e.g. user doesn't already have a gift
    );
  }, [gameState, userId, userHasNextTurn]);

  const canStealGift = useMemo(() => {
    if (!gameState || !userId) return false;
    // must be ongoing, user must have the turn, user doesn't own the gift to be stolen, etc.
    return (
      gameState.status === "ONGOING" &&
      userHasNextTurn
      // plus any other condition from your rules
    );
  }, [gameState, userId, userHasNextTurn]);

  const canAddGift = useMemo(() => {
    if (!gameState || !userId) return false;
    // Example condition: game not started + user hasn't added a gift yet
    if (gameState.status === "NOT_STARTED") return false;
    const currentUser = gameState.users.find((u) => u.id === Number(userId));
    // Suppose we consider "has no gift" as giftId = null
    return (
      !!currentUser &&
      currentUser.giftId == null &&
      gameState.status === "CHECKIN"
    );
  }, [gameState, userId]);

  const canShowGiftList = useMemo(() => {
    if (!gameState || !userId) return false;
    if (gameState.status === "NOT_STARTED") return false;

    return true;
  }, [gameState, userId]);

  const canCheckIn = useMemo(() => {
    if (!gameState || !userId) return false;
    // Example condition: user has added a gift, but not checked in
    const currentUser = gameState.users.find((u) => u.id === Number(userId));
    if (!currentUser) return false;
    return currentUser.giftId != null && !currentUser.isCheckedIn;
  }, [gameState, userId]);

  const showMinimumParticipants = useMemo(() => {
    if (!gameState || !userId) return false;
    // Example condition: user is the owner + game status is NOT_STARTED
    const isOwner = gameState.owner?.id === Number(userId);
    return isOwner && gameState.users.length < 3;
  }, [gameState, userId]);

  const canStartChecking = useMemo(() => {
    if (showMinimumParticipants) return false;
    if (!gameState || !userId) return false;
    // Example condition: user is the owner + game status is NOT_STARTED
    const isOwner = gameState.owner?.id === Number(userId);
    return isOwner && gameState.status === "NOT_STARTED";
  }, [gameState, userId]);

  const canShowStartButton = useMemo(() => {
    //start button will be shown when all users have checked in and gift count = user count
    if (!gameState || !userId) return false;
    const isOwner = gameState.owner?.id === Number(userId);
    if (!isOwner) return false;
    if (gameState.status !== "CHECKIN") return false;
    if (gameState.users.length < 3) return false;
    let giftCount = 0;
    let checkedInCount = 0;
    gameState.users.forEach((user) => {
      if (user.giftId) giftCount++;
      if (user.isCheckedIn) checkedInCount++;
    });
    return (
      giftCount === gameState.users.length &&
      checkedInCount === gameState.users.length
    );
  }, [gameState, userId]);

  const canShowWaitingToStart = useMemo(() => {
    // this will be shown to non owners, when game is ready to be started, that is when everyone has checked in
    if (!gameState || !userId) return false;
    const isOwner = gameState.owner?.id === Number(userId);
    if (isOwner) return false;
    if (gameState.status !== "CHECKIN") return false;
    if (gameState.users.length < 3) return false;
    let checkedInCount = 0;
    gameState.users.forEach((user) => {
      if (user.isCheckedIn) checkedInCount++;
    });
    return checkedInCount === gameState.users.length;
  }, [gameState, userId]);

  return {
    gameState,
    getGameState,
    addGift,
    checkIn,
    startChecking,
    startGame,
    pickGift,
    stealGift,
    userHasNextTurn,
    canPickGift,
    canStealGift,
    canAddGift,
    canCheckIn,
    canStartChecking,
    canShowGiftList,
    showMinimumParticipants,
    canShowStartButton,
    canShowWaitingToStart,
  };
};
