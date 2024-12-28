import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { addUser } from "@/services/api/start";
import { _USER } from "@/types";

export const useUserCreation = () => {
  const [userFormData, setUserFormData] = useState<Partial<_USER>>({
    name: "",
  });
  const [stepOneLoading, setStepOneLoading] = useState(false);
  const [userData, setUserData] = useState<_USER | null>(null);
  const { toast } = useToast();

  const handleStartClick = async () => {
    if (userFormData.name?.trim() === "") return;

    try {
      setStepOneLoading(true);
      const user = await addUser(userFormData);
      setUserData(user);
      return user;
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "An error occurred. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setStepOneLoading(false);
    }
  };

  return {
    userFormData,
    setUserFormData,
    stepOneLoading,
    userData,
    handleStartClick,
  };
};
