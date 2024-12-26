import { useState } from 'react';
import { UserNameForm } from '@/components/UserNameForm';
import { GameOptions } from '@/components/GameOptions';
import { useUserCreation } from '@/hooks/useUserCreation';
import { useRoomCreation } from '@/hooks/useRoomCreation';
import { useRoomJoin } from '@/hooks/useRoomJoin'; // you'll create this

const Start = () => {
  const [step, setStep] = useState(1);

  const {
    userFormData,
    setUserFormData,
    stepOneLoading,
    userData,
    handleStartClick,
  } = useUserCreation();

  const {
    creatingRoom,
    handleCreateNewGame,
  } = useRoomCreation(userData);

  const { joining, handleJoinRoom } = useRoomJoin(userData);

  // Step 1: Name submission
  const handleSubmitName = async () => {
    const user = await handleStartClick();
    if (user) setStep(2);
  };

  // Step 2: Joining a room
  const handleJoinGame = (roomCode: string) => {
    if (!roomCode.trim()) {
      // Provide user feedback if code is empty
      alert('Please enter a valid room code.');
      return;
    }
    handleJoinRoom(roomCode);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      {step === 1 && (
        <UserNameForm
          userFormData={userFormData}
          setUserFormData={setUserFormData}
          stepOneLoading={stepOneLoading}
          onSubmit={handleSubmitName}
        />
      )}

      {step === 2 && (
        <GameOptions
          userData={userData}
          onBack={() => setStep(1)}
          onJoinGame={handleJoinGame}
          onCreateGame={handleCreateNewGame}
          creatingRoom={creatingRoom || joining} // disables UI if either action is in progress
        />
      )}
    </div>
  );
};

export default Start;
