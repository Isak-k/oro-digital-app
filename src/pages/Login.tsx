import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Monitor, AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError('');
    } catch (err: any) {
      console.error('Reset password error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password');
      } else if (err.message.includes('not authorized')) {
        setError('Access denied. Only administrators can access this system.');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Back to Home Button - Fixed Position */}
      <div className="fixed top-4 left-4 z-50">
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-2 bg-background/80 backdrop-blur-sm hover:bg-background">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <Home className="w-4 h-4 sm:hidden" />
          </Button>
        </Link>
      </div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-info blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                <Monitor className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-sidebar-foreground">ORO DIGITAL</h1>
                <p className="text-sm text-sidebar-muted">Computer Training Institution</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl font-bold text-sidebar-foreground leading-tight">
                Empowering Digital
                <span className="gradient-text block">Excellence</span>
              </h2>
              <p className="mt-4 text-sidebar-muted text-lg max-w-md">
                Manage students, courses, and registrations with our comprehensive training management system.
              </p>
            </motion.div>

            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-sidebar-primary">500+</div>
                <div className="text-sm text-sidebar-muted">Students Trained</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sidebar-primary">20+</div>
                <div className="text-sm text-sidebar-muted">Courses Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sidebar-primary">98%</div>
                <div className="text-sm text-sidebar-muted">Success Rate</div>
              </div>
            </div>
          </div>

          <div className="text-sm text-sidebar-muted">
            © 2024 ORO DIGITAL. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Monitor className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">ORO DIGITAL</h1>
              <p className="text-sm text-muted-foreground">Computer Training</p>
            </div>
          </div>

          <Card className="border-border/50 shadow-card">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Admin Access Only</span>
                </div>
                <Link to="/">
                  <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Home</span>
                  </Button>
                </Link>
              </div>
              <CardTitle className="text-2xl font-bold">
                {isResetMode ? 'Reset Password' : 'Welcome back'}
              </CardTitle>
              <CardDescription>
                {isResetMode 
                  ? 'Enter your email to receive a password reset link' 
                  : 'Sign in to access the admin dashboard'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resetSent ? (
                <div className="space-y-4">
                  <Alert className="bg-green-500/10 text-green-600 border-green-500/20">
                    <AlertDescription>
                      Password reset link sent to <strong>{email}</strong>. Please check your email inbox.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setIsResetMode(false);
                      setResetSent(false);
                      setError('');
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={isResetMode ? handleResetPassword : handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive" className="py-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@orodigital.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-focus"
                      required
                    />
                  </div>
                  
                  {!isResetMode && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <button
                          type="button"
                          onClick={() => setIsResetMode(true)}
                          className="text-sm text-primary hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-focus"
                        required
                      />
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full gradient-primary btn-glow h-11"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isResetMode ? 'Sending Link...' : 'Signing in...'}
                      </>
                    ) : (
                      isResetMode ? 'Send Reset Link' : 'Sign in'
                    )}
                  </Button>
                  
                  {isResetMode && (
                    <Button 
                      type="button"
                      variant="ghost" 
                      className="w-full"
                      onClick={() => {
                        setIsResetMode(false);
                        setError('');
                      }}
                    >
                      Back to Sign In
                    </Button>
                  )}
                </form>
              )}
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Protected system. Unauthorized access is prohibited.
          </p>
          
          <div className="mt-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Return to ORO DIGITAL Home Page
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
