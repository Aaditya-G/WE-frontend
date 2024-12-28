// useRoomJoin.ts
import { useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { _USER } from "@/types";

export const useRoomJoin = (userData: _USER | null) => {
  const [joining, setJoining] = useState(false);
  const { connectSocket } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleJoinRoom = async (roomCode: string) => {
    if (!userData) {
      toast({
        title: "Error",
        description: "No user data found. Please enter your name first.",
        variant: "destructive",
      });
      return;
    }

    try {
      setJoining(true);

      // 1. Ensure the socket is connected
      const connectedSocket = await connectSocket();

      // 2. Listen for joinRoomResponse
      const responseListener = (response: {
        success: boolean;
        message?: string;
      }) => {
        connectedSocket.off("joinRoomResponse", responseListener);
        if (response.success) {
          sessionStorage.setItem("roomCode", roomCode);
          sessionStorage.setItem("userId", userData.id.toString());
          navigate(`/play/${roomCode}`);
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to join room.",
            variant: "destructive",
          });
        }
        setJoining(false);
      };

      connectedSocket.off("joinRoomResponse"); // Clear any stale listeners
      connectedSocket.on("joinRoomResponse", responseListener);

      // 3. Emit the joinRoom event
      connectedSocket.emit("joinRoom", { userId: userData.id, code: roomCode });

      // 4. Optional: Set a timeout
      setTimeout(() => {
        if (joining) {
          connectedSocket.off("joinRoomResponse", responseListener);
          toast({
            title: "Error",
            description: "Timed out joining the room. Please try again.",
            variant: "destructive",
          });
          setJoining(false);
        }
      }, 5000);
    } catch (err: any) {
      console.error("Error joining room:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to join room.",
        variant: "destructive",
      });
      setJoining(false);
    }
  };

  return {
    joining,
    handleJoinRoom,
  };
};
