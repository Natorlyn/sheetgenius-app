'use client';
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Brain, Copy, Mail, Lock, Moon, Sun, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getStripe } from '../lib/stripe';
import type { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  plan: string;
  usage_count: number;
}

interface FormulaResult {
  formula: string;
  explanation: string;
}

// Replace these with your actual Stripe price IDs from your Stripe dashboard
const PRICE_IDS = {
  STARTER: 'price_1S1nFPAapFDJirqA7iDcWR0r', // Replace with your actual starter price ID
  PRO: 'price_1S1nGnAapFDJirqALvwsI4ns' // Replace with your actual pro price ID
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isDark, setIsDark] = useState(false);

  // Theme management
  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('sheetgenius-theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
    } else if (savedTheme === 'light') {
      setIsDark(false);
    } else {
      // Check system preference
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(systemPrefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('sheetgenius-theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    // Handle email confirmation on page load
    const handleEmailConfirmation = async () => {
      // Check if we have confirmation parameters in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const tokenHash = urlParams.get('token_hash');
      const type = urlParams.get('type');

      if (tokenHash && type === 'signup') {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'signup',
        });

        if (error) {
          console.error('Confirmation error:', error.message);
        } else {
          // Clear the URL parameters after successful confirmation
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleEmailConfirmation();

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
          isDark ? 'border-indigo-400' : 'border-indigo-600'
        }`}></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage authMode={authMode} setAuthMode={setAuthMode} isDark={isDark} toggleTheme={toggleTheme} />;
  }

  return <Dashboard user={user} profile={profile} setProfile={setProfile} onSignOut={signOut} isDark={isDark} toggleTheme={toggleTheme} />;
}

interface AuthPageProps {
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ authMode, setAuthMode, isDark, toggleTheme }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
        },
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Check your email for the confirmation link!');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen transition-colors ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b transition-colors ${
        isDark 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
              <span className={`text-xl font-bold transition-colors ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>SheetGenius</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => setAuthMode('signin')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  authMode === 'signin'
                    ? 'bg-indigo-600 text-white'
                    : isDark 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  authMode === 'signup'
                    ? 'bg-indigo-600 text-white'
                    : isDark 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero + Auth Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div>
            <div className="mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                isDark 
                  ? 'bg-indigo-900/50 text-indigo-300 border border-indigo-600' 
                  : 'bg-indigo-100 text-indigo-800'
              }`}>
                Powered by GPT-4 AI
              </span>
            </div>
            <h1 className={`text-5xl font-bold mb-6 transition-colors ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Stop Googling<br />
              <span className="text-indigo-600">Excel Formulas</span>
            </h1>
            <p className={`text-xl mb-8 transition-colors ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              AI that turns &quot;calculate growth %&quot; into =(B2-A2)/A2*100 instantly. 
              Save 4+ hours per week on spreadsheet work.
            </p>
            
            <div className={`flex items-center space-x-8 text-sm transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <div className="flex items-center space-x-1">
                <span className="text-2xl">⚡</span>
                <span>5-second formulas</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-2xl">🎯</span>
                <span>95% accuracy rate</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-2xl">💼</span>
                <span>Trusted by professionals</span>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className={`rounded-xl shadow-xl p-8 transition-colors ${
            isDark 
              ? 'bg-gray-800 border border-gray-700' 
              : 'bg-white'
          }`}>
            <h2 className={`text-2xl font-bold mb-6 text-center transition-colors ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {authMode === 'signin' ? 'Welcome Back' : 'Get Started Free'}
            </h2>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 transition-colors ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${
                      isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('Check your email') 
                    ? isDark 
                      ? 'bg-green-900/50 text-green-300 border border-green-700' 
                      : 'bg-green-50 text-green-800'
                    : isDark 
                      ? 'bg-red-900/50 text-red-300 border border-red-700'
                      : 'bg-red-50 text-red-800'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div className={`mt-6 text-center text-sm transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {authMode === 'signin' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => setAuthMode('signup')}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setAuthMode('signin')}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            {authMode === 'signup' && (
              <div className={`mt-4 text-xs text-center transition-colors ${
                isDark ? 'text-gray-500' : 'text-gray-500'
              }`}>
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface DashboardProps {
  user: User;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  onSignOut: () => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, profile, setProfile, onSignOut, isDark, toggleTheme }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleCheckout = async (priceId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      });

      const { sessionId } = await response.json();
      
      const stripe = await getStripe();
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  const updateUsageCount = async () => {
    if (!profile) return;
    
    const newUsageCount = profile.usage_count + 1;
    
    const { error } = await supabase
      .from('profiles')
      .update({ usage_count: newUsageCount })
      .eq('id', profile.id);

    if (!error) {
      // Update the profile state locally instead of reloading
      setProfile({
        ...profile,
        usage_count: newUsageCount
      });
    }
  };

  const generateFormula = async () => {
    if (!prompt.trim() || !profile) return;
    
    // Get the correct usage limit based on plan
    const usageLimit = profile.plan === 'free' ? 3 : profile.plan === 'starter' ? 25 : 999;
    
    // Check usage limit
    if (profile.usage_count >= usageLimit) {
      setResult({
        formula: 'Usage Limit Reached',
        explanation: `You have used all ${usageLimit} queries for your ${profile.plan} plan. Upgrade for more access.`
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/generate-formula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult({
          formula: data.formula,
          explanation: data.explanation
        });
        
        // Update usage count in database
        await updateUsageCount();
      } else {
        setResult({
          formula: 'Error generating formula',
          explanation: 'Please try again or rephrase your request.'
        });
      }
    } catch {
      setResult({
        formula: 'Network error',
        explanation: 'Please check your connection and try again.'
      });
    }
    
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const usageCount = profile?.usage_count || 0;
  const usageLimit = profile?.plan === 'free' ? 3 : profile?.plan === 'starter' ? 25 : 999;

  return (
    <div className={`min-h-screen transition-colors ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50'
    }`}>
      {/* Premium Header */}
      <header className={`backdrop-blur-sm border-b shadow-sm transition-colors ${
        isDark 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
                <div>
                  <span className={`text-xl font-bold transition-colors ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>SheetGenius</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm transition-colors ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>Powered by GPT-4</span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">AI Active</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`text-sm px-3 py-1 rounded-full transition-colors ${
                isDark ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Usage: </span>
                <span className="font-semibold text-indigo-600">{usageCount}/{usageLimit === 999 ? '∞' : usageLimit}</span>
                <span className={isDark ? 'text-gray-500' : 'text-gray-500'}> queries</span>
              </div>
              <div className={`text-sm transition-colors ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {user.email}
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button 
                onClick={onSignOut}
                className={`text-sm transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Premium Stats Bar */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className={`rounded-lg p-4 shadow-sm border transition-colors ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Formulas Generated</p>
                <p className={`text-2xl font-bold transition-colors ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>{usageCount}</p>
              </div>
              <Brain className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          
          <div className={`rounded-lg p-4 shadow-sm border transition-colors ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Time Saved</p>
                <p className="text-2xl font-bold text-green-600">{usageCount * 6}min</p>
              </div>
              <div className="text-2xl">⚡</div>
            </div>
          </div>
          
          <div className={`rounded-lg p-4 shadow-sm border transition-colors ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Accuracy Rate</p>
                <p className="text-2xl font-bold text-blue-600">95%</p>
              </div>
              <div className="text-2xl">🎯</div>
            </div>
          </div>
          
          <div className={`rounded-lg p-4 shadow-sm border transition-colors ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm transition-colors ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>Money Saved</p>
                <p className="text-2xl font-bold text-green-600">${usageCount * 15}</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Formula Generator - Premium */}
          <div className="lg:col-span-2">
            <div className={`rounded-xl shadow-lg border overflow-hidden transition-colors ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">🧠 AI Formula Generator</h1>
                <p className="opacity-90">Describe your calculation in plain English, get perfect Excel formulas instantly</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-3 transition-colors ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      What do you want to calculate?
                    </label>
                    <textarea
                      value={prompt}
                      onChange={handleInputChange}
                      placeholder="Try: 'calculate the compound interest on a $10,000 investment at 5% for 3 years' or 'find the percentage change between two numbers'"
                      className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      rows={4}
                    />
                  </div>

                  <button
                    onClick={generateFormula}
                    disabled={loading || !prompt.trim() || (usageCount >= usageLimit)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-3 font-semibold text-lg shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>AI is thinking...</span>
                      </>
                    ) : usageCount >= usageLimit ? (
                      <span>Upgrade for More Queries</span>
                    ) : (
                      <>
                        <Brain className="h-6 w-6" />
                        <span>Generate Formula with AI</span>
                        <span className="bg-white/20 px-2 py-1 rounded-full text-sm">GPT-4</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Premium Result Display */}
            {result && (
              <div className={`mt-6 rounded-xl shadow-lg border overflow-hidden transition-colors ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className={`p-4 text-white ${
                  result.formula.includes('Usage Limit') || result.formula.includes('Error') || result.formula.includes('Network')
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : 'bg-gradient-to-r from-green-500 to-blue-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center space-x-2">
                      <span>{result.formula.includes('Usage Limit') ? '⚠️' : result.formula.includes('Error') || result.formula.includes('Network') ? '❌' : '✨'}</span>
                      <span>
                        {result.formula.includes('Usage Limit') ? 'Upgrade Required' :
                         result.formula.includes('Error') || result.formula.includes('Network') ? 'Generation Failed' :
                         'Formula Generated Successfully!'}
                      </span>
                    </h3>
                    <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      Query {usageCount}/{usageLimit === 999 ? '∞' : usageLimit} • GPT-4 Powered
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Formula Display */}
                  <div className={`rounded-xl p-6 border-2 transition-colors ${
                    isDark 
                      ? 'bg-gradient-to-r from-gray-700 to-blue-800 border-blue-600' 
                      : 'bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200'
                  }`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-sm font-semibold uppercase tracking-wide transition-colors ${
                        isDark ? 'text-blue-300' : 'text-blue-800'
                      }`}>
                        {result.formula.includes('Usage Limit') ? 'Upgrade Message:' :
                         result.formula.includes('Error') || result.formula.includes('Network') ? 'Error Message:' :
                         'Excel/Google Sheets Formula:'}
                      </span>
                      {!result.formula.includes('Usage Limit') && !result.formula.includes('Error') && !result.formula.includes('Network') && (
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium">
                          <Copy className="h-4 w-4" />
                          <span>Copy Formula</span>
                        </button>
                      )}
                    </div>
                    <div className={`p-4 rounded-lg border-2 transition-colors ${
                      isDark 
                        ? 'bg-gray-800 border-gray-600' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <code className={`text-xl font-mono font-bold transition-colors ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>{result.formula}</code>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className={`rounded-xl p-6 border-2 transition-colors ${
                    isDark 
                      ? 'bg-gradient-to-r from-gray-700 to-purple-800 border-indigo-600' 
                      : 'bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className="bg-indigo-600 text-white p-2 rounded-lg">
                        <span className="text-lg">💡</span>
                      </div>
                      <div>
                        <span className={`text-sm font-semibold uppercase tracking-wide transition-colors ${
                          isDark ? 'text-indigo-300' : 'text-indigo-800'
                        }`}>AI Explanation:</span>
                        <p className={`mt-2 text-lg leading-relaxed transition-colors ${
                          isDark ? 'text-gray-300' : 'text-indigo-700'
                        }`}>{result.explanation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className={`flex items-center justify-between pt-4 border-t-2 transition-colors ${
                    isDark ? 'border-gray-700' : 'border-gray-100'
                  }`}>
                    <div className={`flex items-center space-x-2 transition-colors ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      <span className="text-2xl">🚀</span>
                      <span className="font-medium">Generated with 95% accuracy!</span>
                    </div>
                    <div className="flex space-x-3">
                      {!result.formula.includes('Usage Limit') && !result.formula.includes('Error') && !result.formula.includes('Network') && (
                        <button 
                          onClick={() => {setResult(null); setPrompt('');}}
                          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Generate Another Formula
                        </button>
                      )}
                      {(profile?.plan !== 'pro') && (
                        <button 
                          onClick={() => handleCheckout(PRICE_IDS.PRO)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium"
                        >
                          Get Unlimited Access
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Premium Sidebar */}
          <div className="space-y-6">
            {/* Quick Examples */}
            <div className={`rounded-xl shadow-lg border p-6 transition-colors ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center space-x-2 transition-colors ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                <span>🎯</span>
                <span>Try These Examples</span>
              </h3>
              <div className="space-y-3">
                {[
                  "Calculate compound interest",
                  "Find percentage change",  
                  "Sum values with conditions",
                  "Create VLOOKUP formula",
                  "Calculate loan payments"
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(example)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isDark 
                        ? 'bg-gradient-to-r from-gray-700 to-indigo-800 hover:from-indigo-700 hover:to-purple-700 border-gray-600 hover:border-indigo-500 text-gray-300 hover:text-white' 
                        : 'bg-gradient-to-r from-gray-50 to-indigo-50 hover:from-indigo-50 hover:to-purple-50 border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-700'
                    }`}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Upgrade Prompt */}
            {profile?.plan === 'free' && (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-3">Choose Your Plan</h3>
                
                {/* Starter Plan */}
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Starter</h4>
                    <span className="text-lg font-bold">$9.99/mo</span>
                  </div>
                  <ul className="text-sm opacity-90 space-y-1 mb-3">
                    <li>• 25 formulas per month</li>
                    <li>• Email support</li>
                    <li>• Perfect for light users</li>
                  </ul>
                  <button 
                    onClick={() => handleCheckout(PRICE_IDS.STARTER)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Start with Starter
                  </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">Pro</h4>
                    <span className="text-lg font-bold">$19.99/mo</span>
                  </div>
                  <ul className="text-sm opacity-90 space-y-1 mb-3">
                    <li>• Unlimited formulas</li>
                    <li>• Priority support</li>
                    <li>• Chrome extension</li>
                  </ul>
                  <button 
                    onClick={() => handleCheckout(PRICE_IDS.PRO)}
                    className="w-full bg-white text-indigo-600 font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                </div>
                
                <p className="text-xs text-center mt-3 opacity-75">vs $75/hour for Excel consultants</p>
              </div>
            )}

            {/* Upgrade prompt for starter users */}
            {profile?.plan === 'starter' && (
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <h3 className="text-lg font-bold mb-3">⚡ Unlock Unlimited</h3>
                <div className="space-y-2 text-sm opacity-90 mb-4">
                  <div className="flex items-center space-x-2">
                    <span>✓</span>
                    <span>Unlimited formulas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✓</span>
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>✓</span>
                    <span>Chrome extension</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleCheckout(PRICE_IDS.PRO)}
                  className="w-full bg-white text-indigo-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Upgrade to Pro - $19.99/mo
                </button>
                <p className="text-xs text-center mt-2 opacity-75">No more monthly limits</p>
              </div>
            )}

            {/* Social Proof */}
            <div className={`rounded-xl shadow-lg border p-6 transition-colors ${
              isDark 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <h3 className={`text-lg font-bold mb-4 transition-colors ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>💬 What Users Say</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <p className={`text-sm italic transition-colors ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>&quot;Saved me 4 hours this week alone!&quot;</p>
                  <p className={`text-xs mt-1 transition-colors ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>- Sarah, Finance Manager</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className={`text-sm italic transition-colors ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>&quot;Like having an Excel expert on speed dial&quot;</p>
                  <p className={`text-xs mt-1 transition-colors ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}>- Mike, Operations Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};