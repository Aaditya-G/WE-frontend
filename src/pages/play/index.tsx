import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionStatus } from "@/components/game/ConnectionStatus";
import { useGameConnection } from "@/hooks/useGameConnection";
import { useGameState } from "@/hooks/useGameState";
import { PlayerList } from "@/components/game/PlayerList";
import { GiftList } from "@/components/game/GiftList";
import { AddGiftForm } from "@/components/game/AddGiftForm";

const Play = () => {
  const { roomCode } = useParams();
  const location = useLocation();
  /**temporarily disabled right now */
  const isNewRoom = location.state?.isNewRoom ?? false;

  const {
    hasJoinedRoom,
    isReconnecting,
    error,
    reconnectAttempts,
    MAX_RECONNECT_ATTEMPTS,
    userId,
    participantCount,
  } = useGameConnection({ roomCode, isNewRoom });

  const {
    gameState,
    getGameState,
    addGift,
    checkIn,
    startChecking,
    startGame,
    userHasNextTurn,
    canAddGift,
    canCheckIn,
    canStartChecking,
    canShowGiftList,
    showMinimumParticipants,
    canShowStartButton,
    canShowWaitingToStart,
  } = useGameState(userId);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">Game Room</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-lg font-medium">Room Code: {roomCode}</p>
              <p className="text-sm text-gray-500">
                Share this code with other players to join
              </p>
              <p className="text-sm font-medium mt-2">
                Players in Room:{" "}
                <span className="text-blue-600">{participantCount}</span>
              </p>
            </div>
            <ConnectionStatus
              isConnected={hasJoinedRoom.current}
              isReconnecting={isReconnecting}
              error={error}
              reconnectAttempts={reconnectAttempts}
              maxReconnectAttempts={MAX_RECONNECT_ATTEMPTS}
              participantCount={participantCount}
            />
          </div>

          {/* If the user is not yet "joined", we don't render game UI */}
          {hasJoinedRoom.current && (
            <div className="mt-6 space-y-4">
              {/* Status & Next Turn */}
              <p className="text-center font-semibold">
                Game Status: {gameState?.status || "Loading..."}
              </p>
              {userHasNextTurn && (
                <p className="text-center text-green-600">
                  You have the next turn!
                </p>
              )}

              {/* Player List */}
              <PlayerList
                users={gameState?.users || []}
                ownerId={gameState?.owner?.id}
              />

              {/* Minimum Participants  -> only shows to owner*/}
              {showMinimumParticipants && (
                <div>
                  <p className="text-center text-red-500">
                    You need at least 3 participants to start the game
                  </p>
                </div>
              )}

              {/* Gift List */}
              {canShowGiftList && <GiftList gifts={gameState?.gifts || []} />}

              {/* Add Gift Form (shown only if the user can add a gift) */}
              {canAddGift && <AddGiftForm onAddGift={addGift} />}

              {/* Check In Button */}
              {canCheckIn && (
                <button
                  onClick={checkIn}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md"
                >
                  Check In
                </button>
              )}

              {/* Start Checking Button (only if the user is owner and can start) */}
              {canStartChecking && (
                <button
                  onClick={startChecking}
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                >
                  Start Check-In
                </button>
              )}

              {canShowWaitingToStart && (
                <p className="text-center text-blue-600">
                  Waiting for the owner to start the game...
                </p>
              )}

              {canShowStartButton && (
                <button
                  onClick={startGame}
                  className="px-4 py-2 bg-green-500 text-white rounded-md"
                >
                  Start Game
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Play;
