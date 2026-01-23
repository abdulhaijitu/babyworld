import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import babyWorldLogo from '@/assets/baby-world-logo.png';

// Auth states for clear UX
type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

// Timeout for auth operations
const AUTH_TIMEOUT = 15000;

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { signIn, user, isAdmin, initialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Redirect if already authenticated - only after auth is initialized
  useEffect(() => {
    if (initialized && user) {
      // Get the intended destination or default to /admin
      const from = (location.state as any)?.from?.pathname || '/admin';
      
      if (isAdmin) {
        navigate(from, { replace: true });
      } else {
        // User is logged in but not admin - redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [initialized, user, isAdmin, navigate, location]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrorMessage(null);
    setAuthStatus('loading');

    // Set timeout for slow responses
    timeoutRef.current = setTimeout(() => {
      if (mountedRef.current && authStatus === 'loading') {
        setAuthStatus('error');
        setErrorMessage(
          language === 'bn' 
            ? 'সংযোগ করতে সময় লাগছে। অনুগ্রহ করে আবার চেষ্টা করুন।' 
            : 'Connection is taking too long. Please try again.'
        );
      }
    }, AUTH_TIMEOUT);

    try {
      const { error } = await signIn(email, password);
      
      // Clear timeout on response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (!mountedRef.current) return;
      
      if (error) {
        setAuthStatus('error');
        
        // Map common error messages to user-friendly text
        let friendlyMessage = error.message;
        if (error.message?.includes('Invalid login credentials')) {
          friendlyMessage = language === 'bn' 
            ? 'ইমেইল বা পাসওয়ার্ড ভুল' 
            : 'Invalid email or password';
        } else if (error.message?.includes('Email not confirmed')) {
          friendlyMessage = language === 'bn' 
            ? 'ইমেইল যাচাই করা হয়নি' 
            : 'Email not confirmed';
        } else if (error.message?.includes('Too many requests')) {
          friendlyMessage = language === 'bn' 
            ? 'অনেক চেষ্টা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।' 
            : 'Too many attempts. Please try again later.';
        }
        
        setErrorMessage(friendlyMessage);
        console.error('[AdminLogin] Sign in error:', error.message);
      } else {
        setAuthStatus('success');
        toast.success(language === 'bn' ? 'সফলভাবে লগইন হয়েছে' : 'Logged in successfully');
        // Navigation will happen via the useEffect above
      }
    } catch (err: any) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (!mountedRef.current) return;
      
      setAuthStatus('error');
      setErrorMessage(
        language === 'bn' 
          ? 'একটি অপ্রত্যাশিত ত্রুটি হয়েছে' 
          : 'An unexpected error occurred'
      );
      console.error('[AdminLogin] Unexpected error:', err);
    }
  };

  const handleRetry = () => {
    setAuthStatus('idle');
    setErrorMessage(null);
  };

  const isSubmitting = authStatus === 'loading';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={babyWorldLogo} 
              alt="Baby World" 
              className="h-16 w-auto"
            />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              {language === 'bn' ? 'অ্যাডমিন লগইন' : 'Admin Login'}
            </CardTitle>
            <CardDescription>
              {language === 'bn' 
                ? 'আপনার অ্যাডমিন অ্যাকাউন্টে প্রবেশ করুন'
                : 'Sign in to your admin account'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Error Alert */}
          {authStatus === 'error' && errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{errorMessage}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRetry}
                  className="ml-2 h-auto p-1"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                {language === 'bn' ? 'ইমেইল' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@babyworld.com"
                required
                autoComplete="email"
                disabled={isSubmitting}
                aria-describedby={errorMessage ? 'error-message' : undefined}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">
                {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isSubmitting}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !email || !password}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'bn' ? 'লগইন হচ্ছে...' : 'Signing in...'}
                </>
              ) : authStatus === 'success' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === 'bn' ? 'রিডাইরেক্ট হচ্ছে...' : 'Redirecting...'}
                </>
              ) : (
                language === 'bn' ? 'লগইন করুন' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-muted-foreground"
              disabled={isSubmitting}
            >
              {language === 'bn' ? '← হোমপেজে ফিরে যান' : '← Back to Homepage'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
