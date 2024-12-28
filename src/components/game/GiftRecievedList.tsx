import { Gift, Users, CheckCircle2, Package } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Participant {
  name: string;
  id: number;
  isCheckedIn: boolean;
  giftId: number | null;
  receivedGift: any | null;
}

interface ReceivedGiftListProps {
  users: Participant[];
}

const ReceivedGiftList = ({ users }: ReceivedGiftListProps) => {
  const giftGivers = users.reduce(
    (acc, user) => {
      if (user.giftId !== null) {
        acc[user.giftId] = user.name;
      }
      return acc;
    },
    {} as Record<number, string>,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Gift Exchange Results
          </CardTitle>
          <CardDescription>Final summary of all gift exchanges</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="bg-primary/5 border-none">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Total Participants</h3>
                </div>
                <p className="text-2xl font-bold mt-2">{users.length}</p>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-none">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-sm">Gifts Exchanged</h3>
                </div>
                <p className="text-2xl font-bold mt-2">{users.length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Gift Assignments List */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Gift Distribution
            </h3>
            <div className="divide-y">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{user.name}</span>
                    <div className="flex items-center gap-2 text-gray-500">
                      <Gift className="h-4 w-4" />
                      <span>received</span>
                      <Badge
                        variant="secondary"
                        className="font-medium text-primary"
                      >
                        {user.receivedGift.name}
                      </Badge>
                      <span>from</span>
                    </div>
                    <span className="font-medium">
                      {giftGivers[user.receivedGift.id!]}
                    </span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Received
                    </span>
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceivedGiftList;
