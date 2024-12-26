import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const Start = () => {
  const [name, setName] = useState("");
  const [step, setStep] = useState(1);

  const handleStartClick = () => {
    if (name.trim() === "") return; 
    //todo -> call api to see if name is available or not to avoid duplicacy
    setStep(2); 
  };

  const handleCreateNewGame = () => {
    // Pseudo function for create new game logic
  };

  const handleJoinGame = () => {
    // Pseudo function for join game logic
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {step === 1 && (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Enter Your Name</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
              <Button onClick={handleStartClick} className="w-full">
                Start
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="w-full max-w-md flex flex-col">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="p-2"
                onClick={() => setStep(1)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <label className="text-gray-700 font-medium">Let's Play, {name}</label>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Input the code"
                className="w-full"
              />
              <Button onClick={handleJoinGame} className="w-full">
                Join Game
              </Button>
            </div>
            <div className="text-center text-gray-500">OR</div>
            <Button onClick={handleCreateNewGame} className="w-full">
              Create New Game
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Start;
