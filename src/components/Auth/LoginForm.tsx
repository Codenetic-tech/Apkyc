import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import LoadingScreen from '@/components/LoadingScreen';

interface LoginError {
  message?: string;
}

const LoginForm = () => {
  const [userCode, setUserCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();

  // Track mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(userCode, password);
      toast({
        title: "✨ Welcome Back!",
        description: "Successfully authenticated. Redirecting to dashboard...",
      });
    } catch (err: unknown) {
      console.error('Login error:', err);

      let errorMessage = 'Authentication failed. Please verify your credentials.';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Authenticating your credentials..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden flex items-center justify-center sm:px-4 px-4 py-4">
      {/* Background effects - only show on desktop */}
      <div className="hidden sm:block absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x / window.innerWidth * 100}% ${mousePosition.y / window.innerHeight * 100}%, 
            rgba(59, 130, 246, 0.15) 0%, 
            rgba(139, 92, 246, 0.1) 25%, 
            rgba(16, 185, 129, 0.05) 50%, 
            transparent 100%)`
        }}
      />

      <div className="hidden sm:block absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_40%,transparent_100%)]" />

      <div className="hidden sm:block absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-3xl animate-pulse" />
      <div className="hidden sm:block absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-r from-purple-200/25 to-pink-200/25 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="hidden sm:block absolute top-1/2 left-16 w-48 h-48 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse delay-2000" />

      {/* Main Card Container - Simplified for mobile */}
      <div className="relative z-10 w-full max-w-lg mx-2 sm:mx-4">
        <Card
          className="bg-white border-0 shadow-lg sm:shadow-2xl sm:bg-white/80 sm:backdrop-blur-2xl transition-all duration-500 hover:shadow-3xl hover:shadow-purple-500/15 hover:bg-white/90"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Border Glow - only on desktop */}
          <div className={`hidden sm:block absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 p-[1px] transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <div className="w-full h-full rounded-2xl bg-white/90" />
          </div>

          <CardHeader className="text-center relative z-10 pt-4 pb-2">
            {/* Logo */}
            <div className="mx-auto flex items-center justify-center relative group">
              <img
                src="/lovable-uploads/e80701e6-7295-455c-a88c-e3c4a1baad9b.png"
                alt="GoPocket Logo"
                className="w-24 h-24 sm:w-40 sm:h-40 object-contain relative z-10 filter"
              />
            </div>

            <CardTitle className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">
              <span className="text-gray-900">
                Welcome Back
              </span>
            </CardTitle>

            <CardDescription className="text-gray-600 text-sm sm:text-lg pb-4 sm:pb-8 font-medium">
              Sign in to your <span className="text-blue-600 font-semibold">GoPocket AP Kyc Portal</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-8 pb-6 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee ID Field */}
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-gray-700 text-sm font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-600" />
                  User Code
                </Label>
                <div className="relative group">
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="Enter your User Code"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-12 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-sm sm:placeholder:text-base placeholder:text-gray-500 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-base font-medium"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 text-sm font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-600" />
                  Password
                </Label>
                <div className="relative group">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    className="h-12 bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-sm sm:placeholder:text-base placeholder:text-gray-500 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-base font-medium pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-4"
                disabled={isLoading || !userCode || !password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Footer - only show on desktop */}
      <div className="hidden sm:block absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-sm text-gray-500 font-medium">
          © 2025 GoPocket HRMS • <span className="text-blue-600">Powering Modern Workplaces</span>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;