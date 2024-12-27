import React from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

export interface Log {
  index: number;
  action: string;
}

interface LoggerProps {
  logs: Log[];
}

const Logger: React.FC<LoggerProps> = ({ logs }) => {
  if (!logs || logs.length === 0) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center gap-2">
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-semibold">Game Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No logs available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center gap-2">
        <ClipboardList className="h-5 w-5 text-muted-foreground" />
        <CardTitle className="text-lg font-semibold">Game Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <ul className="space-y-2">
            {logs.map((log) => (
              <li
                key={log.index}
                className="rounded-lg bg-muted/50 px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                {log.action}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default Logger;