
"use client";

import { useState, type Dispatch, type SetStateAction } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/context/app-context';
import type { View } from '@/lib/types';
import { requestLogin, verifyOtp } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

const otpSchema = z.object({
  otp: z.string().min(6, 'OTP must be 6 digits.').max(6, 'OTP must be 6 digits.'),
});

interface LoginViewProps {
    setView: Dispatch<SetStateAction<View>>;
}

export default function LoginView({ setView }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpDialogOpen, setIsOtpDialogOpen] = useState(false);
  const { setLoggedInUser } = useApp();
  const { toast } = useToast();

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  async function onEmailSubmit(data: z.infer<typeof emailSchema>) {
    setIsLoading(true);
    const { success, message } = await requestLogin(data.email);
    if (success) {
      setEmail(data.email);
      setIsOtpDialogOpen(true);
      toast({ title: 'Check your email', description: message });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
    setIsLoading(false);
  }

  async function onOtpSubmit(data: z.infer<typeof otpSchema>) {
    setIsLoading(true);
    const { success, message, user } = await verifyOtp(email, data.otp);
    if (success && user) {
        setLoggedInUser(user);
        if(typeof window !== 'undefined'){
            localStorage.setItem('loggedInUser', JSON.stringify(user));
        }
        setIsOtpDialogOpen(false);
        toast({ title: 'Success!', description: 'You are now logged in.' });
        setView({ type: 'discover' });
    } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: message });
    }
    setIsLoading(false);
  }

  return (
    <div className="flex justify-center items-center h-full">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login / Sign Up</CardTitle>
          <CardDescription>Enter your email to receive a login code.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
              <FormField
                control={emailForm.control}
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Code
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Dialog open={isOtpDialogOpen} onOpenChange={setIsOtpDialogOpen}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Enter Your Code</DialogTitle>
            <DialogDescription>We sent a 6-digit code to {email}.</DialogDescription>
          </DialogHeader>
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-6">
              <FormField
                control={otpForm.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>One-Time Password</FormLabel>
                    <FormControl>
                      <Input placeholder="123456" {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 sm:justify-end">
                 <Button type="button" variant="ghost" onClick={() => setIsOtpDialogOpen(false)} disabled={isLoading}>Back</Button>
                 <Button type="submit" className="flex-1" disabled={isLoading}>
                   {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                   Verify & Login
                 </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
