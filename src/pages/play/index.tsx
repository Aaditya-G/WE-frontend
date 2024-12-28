import { useLocation, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionStatus } from "@/components/game/ConnectionStatus";
import { useGameConnection } from "@/hooks/useGameConnection";
import { useGameState } from "@/hooks/useGameState";
import { PlayerList } from "@/components/game/PlayerList";
import { GiftList } from "@/components/game/GiftList";
import { AddGiftForm } from "@/components/game/AddGiftForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PickGiftList } from "@/components/game/PickGift";
import Logger from "@/components/game/Logger";
import { StealGiftList } from "@/components/game/StealGiftList";

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

  const [showPickGiftList, setShowPickGiftList] = useState(false);
  const [showStealGiftList, setShowStealGiftList] = useState(false);

  const {
    gameState,
    // getGameState,
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
  } = useGameState(userId);

  const handlePickGift = (giftId: number) => {
    pickGift(giftId);

    setShowPickGiftList(false);
  };

  const handleStealGift = (giftId: number) => {
    stealGift(giftId);
    setShowStealGiftList(false);
  };

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
              {gameState?.turnOrder &&
                gameState?.turnOrder?.length > 0 &&
                gameState?.currentTurn !== null && (
                  <p className="text-center">
                    Next Turn:{" "}
                    {gameState.users.find(
                      (user) => user.id === gameState.currentTurn,
                    )?.name || "Unknown Player"}
                  </p>
                )}

              {userHasNextTurn && (
                <div className="flex items-center justify-center gap-4 mt-4">
                  {/* Show "Pick" only if canPickGift */}
                  {canPickGift && (
                    <Button
                      onClick={() => setShowPickGiftList((prev) => !prev)}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {showPickGiftList ? "Cancel" : "Pick a Gift"}
                    </Button>
                  )}

                  {/* Show "Steal" only if canStealGift */}
                  {canStealGift && (
                    <Button
                      variant="destructive"
                      onClick={() => setShowStealGiftList((prev) => !prev)}
                    >
                      {showStealGiftList ? "Cancel" : "Steal a Gift"}
                    </Button>
                  )}
                </div>
              )}

              {/* RENDER PICK GIFT LIST */}
              {showPickGiftList && (
                <PickGiftList
                  gifts={gameState?.gifts || []}
                  onPickGift={handlePickGift}
                  userId={parseInt(userId as string)}
                />
              )}

              {showStealGiftList && gameState && (
                <StealGiftList
                  gifts={gameState.gifts}
                  onStealGift={handleStealGift}
                  userId={parseInt(userId as string)}
                  maxStealPerGift={gameState.maxStealPerGift}
                  maxStealPerUser={gameState.maxStealPerUser}
                  currentUserSteals={
                    gameState.users.find(
                      (u) => u.id === parseInt(userId as string),
                    )?.stealsSoFar || 0
                  }
                  totalGameSteals={gameState.totalStealsSoFar}
                  maxGameSteals={gameState.maxStealPerGame}
                />
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

              <Logger logs={gameState?.logs || []} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Play;
