import React, { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// The onLoginSuccess prop is no longer needed as AuthProvider now manages state.
// interface LoginFormProps {
//   onLoginSuccess: () => void;
// }

/**
 * LoginForm Component
 * แสดงฟอร์มสำหรับให้ผู้ใช้ป้อนข้อมูลเพื่อเข้าสู่ระบบ
 */
export const LoginForm: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      // Use the login function from the AuthProvider
      await login(email, password);
      // No need to call onLoginSuccess, as the context will update the app state
    } catch (err) {
      console.error(err);
      setError('Failed to log in. Please check your credentials.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">เข้าสู่ระบบ</CardTitle>
          <CardDescription>กรุณาเข้าสู่ระบบเพื่อใช้งาน RiceFlow</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="m@example.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <Button className="w-full" type="submit">เข้าสู่ระบบ</Button>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
