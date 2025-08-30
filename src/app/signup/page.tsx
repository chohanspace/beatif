
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/context/app-context';
import { signUp, verifyOtp } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { GearsLoader } from '@/components/ui/gears-loader';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const signupSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 characters.'),
});

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loggedInUser } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [emailToVerify, setEmailToVerify] = useState('');

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
  });
  
  useEffect(() => {
    const email = searchParams.get('email');
    if (email) {
        setEmailToVerify(decodeURIComponent(email));
        setShowOtpDialog(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if(loggedInUser) {
        router.push('/');
    }
  }, [loggedInUser, router]);

  async function onSignupSubmit(data: z.infer<typeof signupSchema>) {
    setIsLoading(true);
    const { success, message } = await signUp(data.email, data.password);
    if (success) {
      setEmailToVerify(data.email);
      setShowOtpDialog(true);
      toast({ title: 'OTP Sent', description: message });
    } else {
      toast({ variant: 'destructive', title: 'Sign Up Failed', description: message });
    }
    setIsLoading(false);
  }

  async function onOtpSubmit(data: z.infer<typeof otpSchema>) {
    setIsLoading(true);
    const { success, message } = await verifyOtp(emailToVerify, data.otp);
    if (success) {
      setShowOtpDialog(false);
      toast({ title: 'Account Verified!', description: 'You can now log in.' });
      router.push('/login');
    } else {
      toast({ variant: 'destructive', title: 'Verification Failed', description: message });
    }
    setIsLoading(false);
  }


  return (
    <>
      <div className="flex justify-center items-center h-screen bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Create an Account</CardTitle>
            <CardDescription>Sign up with your email and password.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...signupForm}>
              <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6">
                <FormField
                  control={signupForm.control}
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
                  control={signupForm.control}
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <GearsLoader className="mr-2" size="sm" />}
                  Sign Up
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="text-sm text-center block">
            Already have an account? <Link href="/login" className="underline">Log in</Link>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Verify your email</DialogTitle>
                <DialogDescription>
                    An OTP has been sent to {emailToVerify}. Please enter it below to verify your account.
                </DialogDescription>
            </DialogHeader>
             <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6 pt-4">
                    <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>One-Time Password</FormLabel>
                        <FormControl>
                            <Input placeholder="123456" {...field} autoFocus/>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <DialogFooter>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <GearsLoader className="mr-2" size="sm" />}
                            Verify Account
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
