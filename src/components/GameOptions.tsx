import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { _USER } from '@/types';

interface GameOptionsProps {
  userData: _USER | null;
  onBack: () => void;
  onJoinGame: () => void;
  onCreateGame: () => void;
  creatingRoom: boolean;
}

export const GameOptions: React.FC<GameOptionsProps> = ({
  userData,
  onBack,
  onJoinGame,
  onCreateGame,
  creatingRoom,
}) => (
  <Card className="w-full max-w-md flex flex-col">
    <CardContent className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="p-2" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <label className="text-gray-700 font-medium">Let's Play, {userData?.name}</label>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          type="text"
          placeholder="Input the code"
          className="w-full"
        />
        <Button onClick={onJoinGame} className="w-full">
          Join Game
        </Button>
      </div>
      <div className="text-center text-gray-500">OR</div>
      <Button onClick={onCreateGame} className="w-full" disabled={creatingRoom}>
        {creatingRoom ? 'Creating...' : 'Create New Game'}
      </Button>
    </CardContent>
  </Card>
);