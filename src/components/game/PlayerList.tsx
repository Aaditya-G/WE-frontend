import { Users, Crown, Gift, CheckCircle, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Participant {
  name: string;
  id: number;
  isCheckedIn: boolean;
  giftId: number | null;
  receivedGift: any | null;
}

interface PlayerListProps {
  users: Participant[];
  ownerId?: number;
}

export function PlayerList({ users, ownerId }: PlayerListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Players
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {users.map((user) => {
          const isOwner = user.id === ownerId;

          return (
            <div
              key={user.id}
              className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {isOwner ? (
                  <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                ) : (
                  <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
                )}
                <span className="font-medium">
                  {user.name}
                  {isOwner && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Owner
                    </Badge>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Gift className="h-4 w-4" />
                  {user.giftId ? (
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800 hover:bg-green-100"
                    >
                      Added
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-gray-500">
                      Pending
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {user.isCheckedIn ? (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Checked In</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        Not Checked In
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default PlayerList;
