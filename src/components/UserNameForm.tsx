import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { _USER } from '@/types';
import { UserCircle } from 'lucide-react';

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
  <div className="bg-gray-50 w-full flex items-center justify-center">
 <div className="flex min-h-screen items-center justify-center p-4 w-[33%]">
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-4">
        <div className="mx-auto rounded-full bg-primary/10 p-3 w-fit">
          <UserCircle className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-center text-2xl font-bold">Welcome to the Game</CardTitle>
        <p className="text-center text-sm text-gray-500">
          Enter your name to get started
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter your name"
              value={userFormData.name}
              onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              className="h-12 text-lg"
            />
          </div>
          <Button 
            onClick={onSubmit} 
            className="w-full h-12 text-lg font-semibold transition-all"
            disabled={stepOneLoading}
          >
            {stepOneLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-t-2 border-r-2 border-white rounded-full animate-spin" />
                Loading...
              </div>
            ) : (
              'Start Playing'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
 </div>
 
);