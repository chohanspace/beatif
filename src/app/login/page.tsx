
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/context/app-context';
import { login, resendVerificationOtp } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { GearsLoader } from '@/components/ui/gears-loader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { setLoggedInUser, loggedInUser } = useApp();
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState('');

  useEffect(() => {
    if(loggedInUser) {
        router.push('/');
    }
  }, [loggedInUser, router]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleResendVerification = async () => {
    setIsLoading(true);
    const { success, message } = await resendVerificationOtp(emailToVerify);
    if (success) {
      toast({ title: 'OTP Sent', description: 'A new verification code has been sent to your email.' });
      // Redirect to signup page with email to show OTP dialog
      router.push(`/signup?email=${encodeURIComponent(emailToVerify)}`);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
    setIsLoading(false);
    setShowVerifyDialog(false);
  }

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    const { success, message, user, requiresVerification } = await login(data.email, data.password);
    
    if (requiresVerification) {
      setEmailToVerify(data.email);
      setShowVerifyDialog(true);
      setIsLoading(false);
      return;
    }

    if (success && user) {
        setLoggedInUser(user);
        if(typeof window !== 'undefined'){
            localStorage.setItem('loggedInUser', JSON.stringify(user));
        }
        toast({ title: 'Success!', description: 'You are now logged in.' });
        router.push('/');
    } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: message });
    }
    setIsLoading(false);
  }

  return (
    <>
      <div className="flex justify-center items-center h-screen bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your email and password to access your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="********" 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute inset-y-0 right-0 h-full px-3"
                            onClick={() => setShowPassword(prev => !prev)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-sm text-right">
                    <Link href="/forgot-password" className="underline">
                        Forgot Password?
                    </Link>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <GearsLoader className="mr-2" size="sm" />}
                  Login
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="text-sm text-center block">
            Don't have an account? <Link href="/signup" className="underline">Sign up</Link>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Verify Your Email</DialogTitle>
                <DialogDescription>
                   Your account is not yet verified. Please check your email for the verification code or request a new one.
                </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-4 mt-4">
                 <Button variant="ghost" onClick={() => setShowVerifyDialog(false)}>Cancel</Button>
                 <Button onClick={handleResendVerification} disabled={isLoading}>
                    {isLoading && <GearsLoader className="mr-2" size="sm" />}
                    Resend Verification Email
                 </Button>
            </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
