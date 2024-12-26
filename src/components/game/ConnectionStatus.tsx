import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isReconnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  participantCount: number;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isReconnecting,
  error,
  reconnectAttempts,
  maxReconnectAttempts,
  participantCount,
}) => (
  <div className="bg-gray-100 rounded-lg p-4 flex flex-col items-center justify-center">
    <p className="text-sm font-medium">Connection Status:</p>
    <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
      {isReconnecting ? 'Reconnecting...' : (isConnected ? 'Connected' : 'Disconnected')}
    </p>
    {isConnected && (
      <p className="text-sm text-blue-600 mt-2">
        {participantCount} player{participantCount !== 1 ? 's' : ''} connected
      </p>
    )}
    {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    {reconnectAttempts >= maxReconnectAttempts && !isConnected && (
      <p className="text-sm text-red-600 mt-2">
        Maximum reconnection attempts reached. Please refresh the page.
      </p>
    )}
  </div>
);