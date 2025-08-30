
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/context/app-context';
import { login, verifyOtp, resendSignUpOtp } from '@/lib/auth';
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
  DialogFooter,
} from '@/components/ui/dialog';

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits.'),
})

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { setLoggedInUser, loggedInUser } = useApp();
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
        timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if(loggedInUser) {
        router.push('/');
    }
  }, [loggedInUser, router]);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    setLoginEmail(data.email);
    const { success, message, user, requiresVerification } = await login(data.email, data.password);
    
    if (success && user) {
        setLoggedInUser(user);
        if(typeof window !== 'undefined'){
            localStorage.setItem('loggedInUser', JSON.stringify(user));
        }
        toast({ title: 'Success!', description: 'You are now logged in.' });
        router.push('/');
    } else {
        setIsLoading(false);
        toast({ variant: 'destructive', title: 'Login Failed', description: message });
        if(requiresVerification) {
            setShowOtpDialog(true);
        }
    }
  }
  
  async function onOtpSubmit(data: z.infer<typeof otpSchema>) {
      setIsLoading(true);
      const { success, message } = await verifyOtp(loginEmail, data.otp);
      if(success) {
        toast({ title: 'Success!', description: message });
        setShowOtpDialog(false);
        // Try logging in again now that verification is done
        const loginData = form.getValues();
        await onSubmit(loginData);
      } else {
        toast({ variant: 'destructive', title: 'Verification Failed', description: message });
      }
      setIsLoading(false);
  }

  async function handleResendOtp() {
      setResendCooldown(30);
      const { success, message } = await resendSignUpOtp(loginEmail);
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
    
    {/* OTP Dialog */}
    <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Verify Your Email</DialogTitle>
                <DialogDescription>
                    Your account is not verified. Please enter the 6-digit code sent to {loginEmail}.
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
                            {isLoading && <GearsLoader size="sm" className="mr-2" />}
                            Verify & Login
                        </Button>
                    </DialogFooter>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
    </>
  );
}
