
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useApp } from '@/context/app-context';
import { login, verifyOtp, resendSignUpOtp, signUp } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { MusicalNotesLoader } from '@/components/ui/gears-loader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { signIn, useSession } from 'next-auth/react';
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

const signupSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits.'),
})

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.011,35.39,44,30.134,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}

export default function AuthPage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const { setLoggedInUser } = useApp();
  const { toast } = useToast();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [actionEmail, setActionEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
        timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  
  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '' },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  })

  async function onLoginSubmit(data: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    setActionEmail(data.email);
    const { success, message, user, token, requiresVerification } = await login(data.email, data.password);
    
    if (success && user && token) {
        if(typeof window !== 'undefined'){
            localStorage.setItem('loggedInUser', JSON.stringify(user));
            localStorage.setItem('jwt', token);
        }
        setLoggedInUser(user);
        toast({ title: 'Success!', description: 'You are now logged in.' });
        router.push('/');
    } else {
        setIsLoading(false);
        if(requiresVerification) {
            toast({ variant: 'destructive', title: 'Verification Required', description: message });
            setShowOtpDialog(true);
        } else {
            toast({ variant: 'destructive', title: 'Login Failed', description: message });
        }
    }
  }

  async function onSignupSubmit(data: z.infer<typeof signupSchema>) {
    setIsLoading(true);
    setActionEmail(data.email);
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
      const { success, message } = await verifyOtp(actionEmail, data.otp);
      if(success) {
        toast({ title: 'Success!', description: message });
        setShowOtpDialog(false);
        // If they were signing up, switch to login view
        if(authMode === 'signup') {
            setAuthMode('login');
        } else {
            // If they were logging in, try logging in again
            const loginData = loginForm.getValues();
            await onLoginSubmit(loginData);
        }
      } else {
        toast({ variant: 'destructive', title: 'Verification Failed', description: message });
      }
      setIsLoading(false);
  }

  async function handleResendOtp() {
      if(resendCooldown > 0) return;
      setResendCooldown(30);
      const { success, message } = await resendSignUpOtp(actionEmail);
      if(success) {
          toast({ title: 'Code Sent', description: message });
      } else {
          toast({ variant: 'destructive', title: 'Error', description: message });
          setResendCooldown(0); // Reset cooldown on error
      }
  }

  const isLogin = authMode === 'login';

  return (
    <>
    <div className="flex justify-center items-center h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isLogin ? 'Login' : 'Create an Account'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Enter your details to access your account.' : 'Sign up to start your musical journey.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
           <Button variant="outline" className="w-full" onClick={() => signIn('google', { callbackUrl: '/' })}>
                <GoogleIcon className="mr-2 h-5 w-5" />
                {isLogin ? 'Sign in with Google' : 'Sign up with Google'}
            </Button>
            <div className="my-4 flex items-center">
                <Separator className="flex-1" />
                <span className="px-4 text-xs text-muted-foreground">OR</span>
                <Separator className="flex-1" />
            </div>
            
            {isLogin ? (
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6" key="login-form">
                        <FormField control={loginForm.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={loginForm.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input type={showPassword ? "text" : "password"} placeholder="********" {...field} />
                                        <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(p => !p)}>
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <div className="text-sm text-right">
                            <Link href="/forgot-password"className="underline">Forgot Password?</Link>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <MusicalNotesLoader className="mr-2" size="sm" />}
                            Login
                        </Button>
                    </form>
                </Form>
            ) : (
                <Form {...signupForm}>
                    <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-6" key="signup-form">
                        <FormField control={signupForm.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={signupForm.control} name="password" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input type={showPassword ? "text" : "password"} placeholder="At least 8 characters" {...field} />
                                        <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(p => !p)}>
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <MusicalNotesLoader className="mr-2" size="sm" />}
                            Create Account
                        </Button>
                    </form>
                </Form>
            )}
        </CardContent>
        <CardFooter className="text-sm text-center block">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <Button variant="link" className="p-0 h-auto" onClick={() => setAuthMode(isLogin ? 'signup' : 'login')}>
            {isLogin ? 'Sign up' : 'Log in'}
          </Button>
        </CardFooter>
      </Card>
    </div>
    
    <Dialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Verify Your Email</DialogTitle>
                <DialogDescription>
                    Please enter the 6-digit code sent to {actionEmail}.
                </DialogDescription>
            </DialogHeader>
            <Form {...otpForm}>
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                     <FormField control={otpForm.control} name="otp" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Verification Code</FormLabel>
                            <FormControl><Input placeholder="123456" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                     )}/>
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
