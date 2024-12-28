import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Plus } from "lucide-react";
import { _USER } from "@/types";

interface GameOptionsProps {
  userData: _USER | null;
  onBack: () => void;
  onJoinGame: (code: string) => void; // Accept the code
  onCreateGame: () => void;
  creatingRoom: boolean;
}

export const GameOptions: React.FC<GameOptionsProps> = ({
  userData,
  onBack,
  onJoinGame,
  onCreateGame,
  creatingRoom,
}) => {
  const [roomCodeInput, setRoomCodeInput] = useState("");

  return (
    <div className="bg-gray-50 w-full flex items-center justify-center">
      <div className="flex min-h-screen items-center justify-center p-4 w-[33%]">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={onBack}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold">
                  Welcome, {userData?.name}!
                </h2>
              </div>

              <div className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter room code"
                      className="h-12 text-lg pl-12"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value)}
                    />
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  </div>
                  <Button
                    onClick={() => onJoinGame(roomCodeInput)}
                    variant="outline"
                    className="w-full h-12 text-lg font-semibold"
                  >
                    Join Existing Game
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-4 text-sm text-muted-foreground">
                      or create a new game
                    </span>
                  </div>
                </div>

                <Button
                  onClick={onCreateGame}
                  className="w-full h-12 text-lg font-semibold relative"
                  disabled={creatingRoom}
                >
                  {creatingRoom ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                      Creating Room...
                    </div>
                  ) : (
                    <>
                      <Plus className="w-5 h-5 mr-2" />
                      Create New Game
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
