// PickGiftList.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Minimal interface for your Gift
interface Gift {
  id: number;
  name: string;
  receivedById: number | null;
  addedById: number;
}

interface PickGiftListProps {
  gifts: Gift[];
  onPickGift: (giftId: number) => void;
  userId: number;
}

export const PickGiftList: React.FC<PickGiftListProps> = ({ gifts, onPickGift , userId}) => {
  const availableGifts = gifts.filter((gift) => gift.receivedById === null && gift.addedById !== userId);


  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Pick a Gift</CardTitle>
      </CardHeader>
      <CardContent>
        {availableGifts.length === 0 ? (
          <p className="text-sm text-gray-500">No available gifts left.</p>
        ) : (
          availableGifts.map((gift) => (
            <div
              key={gift.id}
              className="flex items-center justify-between py-2 border-b last:border-b-0"
            >
              <span className="text-sm">
                <strong>Gift #{gift.id}:</strong> {gift.name}
              </span>
              <Button
                size="sm"
                onClick={() => onPickGift(gift.id)}
                className="bg-blue-600 text-white"
              >
                Pick
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
