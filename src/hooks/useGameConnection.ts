import { useState, useCallback, useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface GameConnectionProps {
  roomCode: string | undefined;
  isNewRoom?: boolean;
}

export const useGameConnection = ({
  roomCode,
  isNewRoom = false,
}: GameConnectionProps) => {
  const navigate = useNavigate();
  const {
    socket,
    isConnected,
    reconnectToRoom,
    error: socketError,
  } = useSocket();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [error, setError] = useState<string | null>(socketError);
  const [participantCount, setParticipantCount] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const hasJoinedRoom = useRef(false);
  const isInitialConnection = useRef(true);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const handleJoinRoomResponse = useCallback(
    (response: { success: boolean; message?: string }) => {
      if (response.success) {
        hasJoinedRoom.current = true;
        isInitialConnection.current = false;
        setIsReconnecting(false);
        setReconnectAttempts(0);
        setError(null);
        sessionStorage.setItem("roomCode", roomCode as string);
        sessionStorage.setItem("userId", userId as string);
      } else {
        setError(response.message || "Failed to join room.");
        setIsReconnecting(false);

        // Don't show toast for initial connection attempts
        if (!isInitialConnection.current) {
          toast({
            title: "Error",
            description: response.message || "Failed to join room.",
            variant: "destructive",
          });
        }
      }
    },
    [roomCode, toast, userId]
  );

  const handleReconnection = useCallback(async () => {
    console.log("handleReconnection called", {
      userId,
      roomCode,
      isReconnecting,
      hasJoinedRoom: hasJoinedRoom.current,
      isInitialConnection: isInitialConnection.current,
      isNewRoom,
    });

    // Skip reconnection for new rooms or if already connected
    if (
      !userId ||
      !roomCode ||
      isReconnecting ||
      (hasJoinedRoom.current && isInitialConnection.current) ||
      (isNewRoom && isInitialConnection.current)
    ) {
      return;
    }

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      setError("Maximum reconnection attempts reached");
      setIsReconnecting(false);
      toast({
        title: "Connection Lost",
        description:
          "Unable to reconnect after multiple attempts. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsReconnecting(true);
      setReconnectAttempts((prev) => prev + 1);

      clearReconnectTimeout();

      if (socket) {
        socket.off("joinRoomResponse", handleJoinRoomResponse);
        socket.on("joinRoomResponse", handleJoinRoomResponse);
      }
      await reconnectToRoom(parseInt(userId, 10), roomCode);
    } catch (err: any) {
      console.error("Reconnection failed:", err);
      setIsReconnecting(false);
      setError(err instanceof Error ? err.message : "Failed to reconnect");

      if (
        !isInitialConnection.current &&
        reconnectAttempts + 1 >= MAX_RECONNECT_ATTEMPTS
      ) {
        toast({
          title: "Connection Lost",
          description:
            "Unable to reconnect after multiple attempts. Please refresh the page.",
          variant: "destructive",
        });
      } else {
        const backoffDelay = Math.min(
          1000 * Math.pow(2, reconnectAttempts),
          10000
        );
        reconnectTimeoutRef.current = setTimeout(
          handleReconnection,
          backoffDelay
        );
      }
    }
  }, [
    userId,
    roomCode,
    reconnectAttempts,
    reconnectToRoom,
    toast,
    socket,
    handleJoinRoomResponse,
    isReconnecting,
    isNewRoom,
  ]);

  useEffect(() => {
    if (isNewRoom) {
      setError(null);
      setIsReconnecting(false);
      setReconnectAttempts(0);
      hasJoinedRoom.current = true;
      setParticipantCount(1);
    }

    const storedRoomCode = sessionStorage.getItem("roomCode");
    const storedUserId = sessionStorage.getItem("userId");

    console.log("Main effect running", {
      storedRoomCode,
      storedUserId,
      roomCode,
      isConnected,
      isNewRoom,
      hasJoinedRoom: hasJoinedRoom.current,
    });

    if (!storedRoomCode || !storedUserId || storedRoomCode !== roomCode) {
      if (!isNewRoom) {
        // Only navigate away if it's not a new room
        navigate("/");
        return;
      }
    }

    setUserId(storedUserId);

    if (socket) {
      socket.off("joinRoomResponse", handleJoinRoomResponse);
      socket.on("joinRoomResponse", handleJoinRoomResponse);
      socket.on(
        "gameStateUpdate",
        (data: { success: boolean; gameState: string }) => {}
      );
    }

    // For new rooms, we don't need to rejoin as the creation process handles it
    if (!hasJoinedRoom.current && !isNewRoom) {
      if (isConnected && socket) {
        socket.emit("joinRoom", { userId: storedUserId, code: roomCode });
      } else {
        handleReconnection();
      }
    }

    if (socket) {
      const handleDisconnect = () => {
        if (!isInitialConnection.current) {
          // Only handle disconnects after initial connection
          hasJoinedRoom.current = false;
          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            toast({
              title: "Connection Lost",
              description: "Attempting to reconnect...",
            });
            handleReconnection();
          }
        }
      };

      socket.on("disconnect", handleDisconnect);
      socket.on("participantCount", (data: { count: number }) => {
        setParticipantCount(data.count);
      });

      return () => {
        socket.off("disconnect", handleDisconnect);
        socket.off("participantCount");
        socket.off("joinRoomResponse", handleJoinRoomResponse);
        clearReconnectTimeout();
      };
    }
  }, [
    roomCode,
    isConnected,
    navigate,
    handleReconnection,
    socket,
    reconnectAttempts,
    toast,
    handleJoinRoomResponse,
    isNewRoom,
  ]);

  useEffect(() => {
    return () => {
      clearReconnectTimeout();
      setIsReconnecting(false);
    };
  }, []);

  return {
    hasJoinedRoom,
    isReconnecting,
    error,
    reconnectAttempts,
    MAX_RECONNECT_ATTEMPTS,
    userId,
    participantCount,
  };
};
