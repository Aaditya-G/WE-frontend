import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface Gift {
  id: number;
  name: string;
  receivedById: number | null;
  addedById: number;
  stolenCount: number;
  isLocked: boolean;
}

interface StealGiftListProps {
  gifts: Gift[];
  onStealGift: (giftId: number) => void;
  userId: number;
  maxStealPerGift: number;
  maxStealPerUser: number;
  currentUserSteals: number;
  totalGameSteals: number;
  maxGameSteals: number;
}

export const StealGiftList: React.FC<StealGiftListProps> = ({
  gifts,
  onStealGift,
  userId,
  maxStealPerGift,
  maxStealPerUser,
  currentUserSteals,
  totalGameSteals,
  maxGameSteals,
}) => {
  const canStealAny =
    currentUserSteals < maxStealPerUser && totalGameSteals < maxGameSteals;

  const getStealableGifts = () => {
    return gifts.filter((gift) => {
      return (
        gift.receivedById !== null &&
        gift.receivedById !== userId &&
        gift.addedById !== userId &&
        gift.stolenCount < maxStealPerGift &&
        !gift.isLocked
      );
    });
  };

  const stealableGifts = getStealableGifts();

  console.log(stealableGifts);

  if (!canStealAny) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Steal a Gift</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">
            {currentUserSteals >= maxStealPerUser
              ? "You have used all your steals for this game"
              : "Maximum steals reached for this game"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Steal a Gift</CardTitle>
        <div className="text-sm text-gray-500">
          <p>
            Your steals: {currentUserSteals}/{maxStealPerUser}
          </p>
          <p>
            Total game steals: {totalGameSteals}/{maxGameSteals}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        {stealableGifts.length === 0 ? (
          <p className="text-sm text-gray-500">No gifts available to steal.</p>
        ) : (
          <div className="space-y-3">
            {stealableGifts.map((gift) => (
              <div
                key={gift.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    Gift #{gift.id}: {gift.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    Stolen {gift.stolenCount} of {maxStealPerGift} times
                    {gift.stolenCount === maxStealPerGift - 1 && (
                      <span className="text-red-500 ml-2">
                        (Last steal available!)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {gift.isLocked ? (
                    <Lock className="text-gray-400" size={16} />
                  ) : (
                    <Button
                      onClick={() => onStealGift(gift.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Steal
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
