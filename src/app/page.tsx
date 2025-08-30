'use client';
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Brain, Copy, Mail, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
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

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    // Handle email confirmation on page load
    const handleEmailConfirmation = async () => {
      // Check if we have confirmation parameters in the URL
      const urlParams = new URLSearchParams(window.location.search);
      const tokenHash = urlParams.get('token_hash');
      const type = urlParams.get('type');

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
  token_hash: tokenHash,
  type: type as 'signup' | 'recovery' | 'invite' | 'magiclink',
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage authMode={authMode} setAuthMode={setAuthMode} />;
  }

  return <Dashboard user={user} profile={profile} setProfile={setProfile} onSignOut={signOut} />;
}

interface AuthPageProps {
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ authMode, setAuthMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">SheetGenius</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setAuthMode('signin')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  authMode === 'signin'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setAuthMode('signup')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  authMode === 'signup'
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
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
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                Powered by GPT-4 AI
              </span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Stop Googling<br />
              <span className="text-indigo-600">Excel Formulas</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              AI that turns &quot;calculate growth %&quot; into =(B2-A2)/A2*100 instantly. 
              Save 4+ hours per week on spreadsheet work.
            </p>
            
            <div className="flex items-center space-x-8 text-sm text-gray-500">
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
          <div className="bg-white rounded-xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {authMode === 'signin' ? 'Welcome Back' : 'Get Started Free'}
            </h2>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('Check your email') 
                    ? 'bg-green-50 text-green-800' 
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

            <div className="mt-6 text-center text-sm text-gray-600">
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
              <div className="mt-4 text-xs text-gray-500 text-center">
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
}

const Dashboard: React.FC<DashboardProps> = ({ user, profile, setProfile, onSignOut }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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
    
    // Check usage limit
    if (profile.plan === 'free' && profile.usage_count >= 3) {
      setResult({
        formula: 'Usage Limit Reached',
        explanation: 'You have used all 3 free queries. Upgrade to Pro for unlimited access.'
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
  const usageLimit = profile?.plan === 'free' ? 3 : 999;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
                <div>
                  <span className="text-xl font-bold text-gray-900">SheetGenius</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Powered by GPT-4</span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">AI Active</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-gray-600">Usage: </span>
                <span className="font-semibold text-indigo-600">{usageCount}/{usageLimit}</span>
                <span className="text-gray-500"> queries</span>
              </div>
              <div className="text-sm text-gray-600">
                {user.email}
              </div>
              <button 
                onClick={onSignOut}
                className="text-gray-600 hover:text-gray-900 text-sm"
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
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Formulas Generated</p>
                <p className="text-2xl font-bold text-gray-900">{usageCount}</p>
              </div>
              <Brain className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-green-600">{usageCount * 6}min</p>
              </div>
              <div className="text-2xl">⚡</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accuracy Rate</p>
                <p className="text-2xl font-bold text-blue-600">95%</p>
              </div>
              <div className="text-2xl">🎯</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Money Saved</p>
                <p className="text-2xl font-bold text-green-600">${usageCount * 15}</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Formula Generator - Premium */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">🧠 AI Formula Generator</h1>
                <p className="opacity-90">Describe your calculation in plain English, get perfect Excel formulas instantly</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      What do you want to calculate?
                    </label>
                    <textarea
                      value={prompt}
                      onChange={handleInputChange}
                      placeholder="Try: 'calculate the compound interest on a $10,000 investment at 5% for 3 years' or 'find the percentage change between two numbers'"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                      rows={4}
                    />
                  </div>

                  <button
                    onClick={generateFormula}
                    disabled={loading || !prompt.trim() || (profile?.plan === 'free' && usageCount >= 3)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-3 font-semibold text-lg shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>AI is thinking...</span>
                      </>
                    ) : profile?.plan === 'free' && usageCount >= 3 ? (
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
              <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
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
                      Query {usageCount}/{usageLimit} • GPT-4 Powered
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Formula Display */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-semibold text-blue-800 uppercase tracking-wide">
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
                    <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                      <code className="text-xl font-mono text-gray-900 font-bold">{result.formula}</code>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                    <div className="flex items-start space-x-3">
                      <div className="bg-indigo-600 text-white p-2 rounded-lg">
                        <span className="text-lg">💡</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-indigo-800 uppercase tracking-wide">AI Explanation:</span>
                        <p className="text-indigo-700 mt-2 text-lg leading-relaxed">{result.explanation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
                    <div className="flex items-center space-x-2 text-gray-600">
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
                      {(profile?.plan === 'free') && (
                        <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium">
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
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
                    className="w-full text-left p-3 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg hover:from-indigo-50 hover:to-purple-50 transition-all border border-gray-200 hover:border-indigo-300 text-gray-700 hover:text-indigo-700"
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
                  <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
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
                  <button className="w-full bg-white text-indigo-600 font-bold py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    Upgrade to Pro
                  </button>
                </div>
                
                <p className="text-xs text-center mt-3 opacity-75">vs $75/hour for Excel consultants</p>
              </div>
            )}

            {/* Social Proof */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">💬 What Users Say</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm text-gray-700 italic">&quot;Saved me 4 hours this week alone!&quot;</p>
                  <p className="text-xs text-gray-500 mt-1">- Sarah, Finance Manager</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-700 italic">&quot;Like having an Excel expert on speed dial&quot;</p>
                  <p className="text-xs text-gray-500 mt-1">- Mike, Operations Director</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};