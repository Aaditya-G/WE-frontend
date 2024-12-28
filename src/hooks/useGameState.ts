import { useCallback, useEffect, useMemo, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/hooks/use-toast";

interface UserEntity {
  id: number;
  name: string;
}

interface Participant {
  name: string;
  id: number;
  isCheckedIn: boolean;
  giftId: number | null;
  receivedGiftId: number | null;
  stealsSoFar: number;
}

interface GameState {
  status: string;
  owner: UserEntity;
  users: Participant[];
  gifts: any[];
  currentTurn: number | null;
  totalStealsSoFar: number;
  maxStealPerUser: number;
  maxStealPerGame: number;
  maxStealPerGift: number;
  turnOrder: number[];
  logs: any[];
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
        return;
      }
      setGameState(response.gameState);
    };

    socket.on("gameStateUpdate", handleGameStateUpdate);

    return () => {
      socket.off("gameStateUpdate", handleGameStateUpdate);
    };
  }, [socket]);

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
          if (response?.success === false) {
            toast({
              title: "Add Gift Error",
              description: response?.message || "Unable to add gift",
              variant: "destructive",
            });
          }
        },
      );
    },
    [socket, userId, toast],
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
    if (!socket || !userId) return;
    socket.emit(
      "startChecking",
      { userId: Number(userId) },
      (response: any) => {
        if (response?.success === false) {
          toast({
            title: "Start Checking Error",
            description: response?.message || "Unable to start checking",
            variant: "destructive",
          });
        }
      },
    );
  }, [socket, userId, toast]);

  const startGame = useCallback(() => {
    if (!socket || !userId) return;
    socket.emit("startGame", { userId: Number(userId) }, (response: any) => {
      if (response?.success === false) {
        toast({
          title: "Start Game Error",
          description: response?.message || "Unable to start game",
          variant: "destructive",
        });
      }
    });
  }, [socket, userId, toast]);

  const pickGift = useCallback(
    (giftId: number) => {
      if (!socket || !userId) return;
      socket.emit(
        "pickGift",
        { userId: Number(userId), giftId },
        (response: any) => {
          if (response?.success === false) {
            toast({
              title: "Pick Gift Error",
              description: response?.message || "Unable to pick gift",
              variant: "destructive",
            });
          }
        },
      );
    },
    [socket, userId, toast],
  );

  const stealGift = useCallback(
    (giftId: number) => {
      if (!socket || !userId) return;
      socket.emit(
        "stealGift",
        { userId: Number(userId), giftId },
        (response: any) => {
          if (response?.success === false) {
            toast({
              title: "Steal Gift Error",
              description: response?.message || "Unable to steal gift",
              variant: "destructive",
            });
          }
        },
      );
    },
    [socket, userId, toast],
  );

  // ----- Derived booleans for UI -----
  const userHasNextTurn = useMemo(() => {
    if (!gameState || !userId) return false;
    return gameState.currentTurn === Number(userId);
  }, [gameState, userId]);

  const canPickGift = useMemo(() => {
    if (!gameState || !userId) return false;
    return gameState.status === "ONGOING" && userHasNextTurn;
  }, [gameState, userId, userHasNextTurn]);

  const canStealGift = useMemo(() => {
    if (!gameState || !userId) return false;
    const currentUser = gameState.users.find((u) => u.id === Number(userId));

    return (
      gameState.status === "ONGOING" &&
      userHasNextTurn &&
      currentUser &&
      currentUser.stealsSoFar < gameState.maxStealPerUser &&
      gameState.totalStealsSoFar < gameState.maxStealPerGame
    );
  }, [gameState, userId, userHasNextTurn]);

  const canAddGift = useMemo(() => {
    if (!gameState || !userId) return false;
    if (gameState.status === "NOT_STARTED") return false;
    const currentUser = gameState.users.find((u) => u.id === Number(userId));
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
    const currentUser = gameState.users.find((u) => u.id === Number(userId));
    if (!currentUser) return false;
    return currentUser.giftId != null && !currentUser.isCheckedIn;
  }, [gameState, userId]);

  const showMinimumParticipants = useMemo(() => {
    if (!gameState || !userId) return false;
    const isOwner = gameState.owner?.id === Number(userId);
    return isOwner && gameState.users.length < 3;
  }, [gameState, userId]);

  const canStartChecking = useMemo(() => {
    if (showMinimumParticipants) return false;
    if (!gameState || !userId) return false;
    const isOwner = gameState.owner?.id === Number(userId);
    return isOwner && gameState.status === "NOT_STARTED";
  }, [gameState, userId]);

  const canShowStartButton = useMemo(() => {
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
