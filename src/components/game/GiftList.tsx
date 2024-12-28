import { Gift, PackageX } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Gift {
  name: string;
  id: number;
}

interface GiftListProps {
  gifts: Gift[];
}

export function GiftList({ gifts }: GiftListProps) {
  if (!gifts?.length) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-gray-500">
            <PackageX className="h-5 w-5" />
            <p className="text-sm">No gifts have been added yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Gift className="h-4 w-4 text-primary" />
          Gifts ({gifts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {gifts.map((gift, idx) => (
              <>
                <div
                  key={gift.id || idx}
                  className="group flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors border border-border/50 hover:border-border"
                >
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Gift className="h-3.5 w-3.5 text-primary/70" />
                  </div>
                  <span className="text-sm truncate">
                    {gift.name || `Gift #${idx + 1}`}
                  </span>
                </div>
              </>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default GiftList;
