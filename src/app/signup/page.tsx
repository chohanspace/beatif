
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/context/app-context';
import { signUp, verifyOtp, resendSignUpOtp } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
import { MusicalNotesLoader } from '@/components/ui/gears-loader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits.'),
})

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { loggedInUser } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
        timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '' },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })
  
  useEffect(() => {
    if(loggedInUser) {
        router.push('/');
    }
  }, [loggedInUser, router]);

  async function onSignupSubmit(data: z.infer<typeof signupSchema>) {
    setIsLoading(true);
    setSignupEmail(data.email);
    const { success, message, requiresVerification } = await signUp(data.email, data.password);
    if (success) {
      toast({ title: 'Check your email', description: message });
      if(requiresVerification) {
        setShowOtpDialog(true);
      }
    } else {
      toast({ variant: 'destructive', title: 'Sign Up Failed', description: message });
    }
    setIsLoading(false);
  }

  async function onOtpSubmit(data: z.infer<typeof otpSchema>) {
      setIsLoading(true);
      const { success, message } = await verifyOtp(signupEmail, data.otp);
      if(success) {
        toast({ title: 'Success!', description: message });
        setShowOtpDialog(false);
        router.push('/login');
      } else {
        toast({ variant: 'destructive', title: 'Verification Failed', description: message });
      }
      setIsLoading(false);
  }

  async function handleResendOtp() {
      setResendCooldown(30);
      const { success, message } = await resendSignUpOtp(signupEmail);
      if(success) {
          toast({ title: 'Code Sent', description: message });
      } else {
          toast({ variant: 'destructive', title: 'Error', description: message });
      }
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
                {isLoading && <MusicalNotesLoader className="mr-2" size="sm" />}
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

    {/* OTP Dialog */}
    <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Verify Your Email</DialogTitle>
                <DialogDescription>
                    We've sent a 6-digit code to {signupEmail}. Please enter it below.
                </DialogDescription>
            </DialogHeader>
            <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                     <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Verification Code</FormLabel>
                            <FormControl>
                                <Input placeholder="123456" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <DialogFooter className="sm:justify-between items-center gap-2">
                        <Button type="button" variant="link" size="sm" className="p-0" onClick={handleResendOtp} disabled={resendCooldown > 0}>
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <MusicalNotesLoader size="sm" className="mr-2" />}
                            Verify
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}
