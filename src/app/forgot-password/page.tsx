
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { requestPasswordReset, resetPasswordWithOtp } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { MusicalNotesLoader } from '@/components/ui/gears-loader';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

const emailSchema = z.object({
  email: z.string().email('Invalid email address.'),
});

const resetSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits.'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters.'),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [emailSent, setEmailSent] = useState(false);
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: '', newPassword: '' },
  });

  async function onEmailSubmit(data: z.infer<typeof emailSchema>) {
    setIsLoading(true);
    const { success, message } = await requestPasswordReset(data.email);
    if (success) {
      toast({ title: 'Check your email', description: message });
      setEmail(data.email);
      setEmailSent(true);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
    setIsLoading(false);
  }

  async function onResetSubmit(data: z.infer<typeof resetSchema>) {
    setIsLoading(true);
    const { success, message } = await resetPasswordWithOtp(email, data.otp, data.newPassword);
    if (success) {
      toast({ title: 'Success!', description: message });
      router.push('/');
    } else {
      toast({ variant: 'destructive', title: 'Password Reset Failed', description: message });
    }
    setIsLoading(false);
  }

  return (
    <div className="flex justify-center items-center h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            {emailSent 
              ? `An OTP has been sent to ${email}.`
              : 'Enter your email to receive a password reset code.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!emailSent ? (
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
                  {isLoading && <MusicalNotesLoader className="mr-2" size="sm" />}
                  Send Reset Code
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...resetForm}>
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-6">
                <FormField
                  control={resetForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password (OTP)</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={resetForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
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
                  Reset Password
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
         <CardFooter className="text-sm text-center block">
          Remember your password? <Link href="/" className="underline">Log in</Link>
        </CardFooter>
      </Card>
    </div>
  );
}
