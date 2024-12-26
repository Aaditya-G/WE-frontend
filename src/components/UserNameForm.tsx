import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { _USER } from '@/types';

interface UserNameFormProps {
  userFormData: Partial<_USER>;
  setUserFormData: (data: Partial<_USER>) => void;
  stepOneLoading: boolean;
  onSubmit: () => void;
}

export const UserNameForm: React.FC<UserNameFormProps> = ({
  userFormData,
  setUserFormData,
  stepOneLoading,
  onSubmit,
}) => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle className="text-center">Enter Your Name</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Enter your name"
          value={userFormData.name}
          onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
          className="w-full"
        />
        <Button onClick={onSubmit} className="w-full" disabled={stepOneLoading}>
          {stepOneLoading ? 'Loading...' : 'Start'}
        </Button>
      </div>
    </CardContent>
  </Card>
);