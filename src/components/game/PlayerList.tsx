interface Participant {
  id: number;
  isCheckedIn: boolean;
  giftId: number | null;
  receivedGiftId: number | null;
}

interface PlayerListProps {
  users: Participant[];
  ownerId?: number;
}

export function PlayerList({ users, ownerId }: PlayerListProps) {
  return (
    <div className="p-2 border rounded-md">
      <p className="text-sm font-bold mb-2">Players:</p>
      {users.map((user) => {
        const isOwner = user.id === ownerId;
        return (
          <div
            key={user.id}
            className="flex items-center justify-between text-sm mb-1"
          >
            <div>
              {isOwner && <span className="text-red-500 mr-1">[Owner]</span>}
              <span>User #{user.id}</span>
            </div>
            <div>
              {user.giftId ? (
                <span className="mr-2 text-green-600">Gift added</span>
              ) : (
                <span className="mr-2 text-gray-400">No gift yet</span>
              )}
              {user.isCheckedIn ? (
                <span className="text-blue-600">Checked In</span>
              ) : (
                <span className="text-gray-400">Not Checked In</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
