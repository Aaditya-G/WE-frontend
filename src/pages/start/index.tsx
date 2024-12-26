import React, { useState } from 'react';
import { UserNameForm } from '@/components/UserNameForm';
import { GameOptions } from '@/components/GameOptions';
import { useUserCreation } from '@/hooks/useUserCreation';
import { useRoomCreation } from '@/hooks/useRoomCreation';

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

  const handleJoinGame = () => {
    // Implement join game logic
  };

  const handleSubmitName = async () => {
    const user = await handleStartClick();
    if (user) setStep(2);
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
          creatingRoom={creatingRoom}
        />
      )}
    </div>
  );
};

export default Start;