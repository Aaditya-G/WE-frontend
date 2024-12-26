import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionStatus } from '@/components/game/ConnectionStatus';
import { useGameConnection } from '@/hooks/useGameConnection';

const Play = () => {
  const { roomCode } = useParams();
  const {
    isConnected,
    isReconnecting,
    error,
    reconnectAttempts,
    MAX_RECONNECT_ATTEMPTS,
    participantCount,
  } = useGameConnection({ roomCode });

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
              <p className="text-sm text-gray-500">Share this code with other players to join</p>
              <p className="text-sm font-medium mt-2">
                Players in Room: <span className="text-blue-600">{participantCount}</span>
              </p>
            </div>
            <ConnectionStatus
              isConnected={isConnected}
              isReconnecting={isReconnecting}
              error={error}
              reconnectAttempts={reconnectAttempts}
              maxReconnectAttempts={MAX_RECONNECT_ATTEMPTS}
              participantCount={participantCount}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Play;