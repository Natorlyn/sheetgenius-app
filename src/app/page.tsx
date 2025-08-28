'use client';
import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Brain, AlertCircle, TrendingUp, ChevronRight, Copy } from 'lucide-react';

interface User {
  email: string;
  plan: string;
  usage: number;
}

interface FormulaResult {
  formula: string;
  explanation: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setTimeout(() => {
      setUser({ email: 'demo@example.com', plan: 'free', usage: 2 });
      setLoading(false);
    }, 1000);
  }, []);

  const signIn = () => {
    setUser({ email: 'demo@example.com', plan: 'free', usage: 2 });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onSignIn={signIn} />;
  }

  return <Dashboard user={user} />;
}

interface LandingPageProps {
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn }) => {
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
            <button
              onClick={onSignIn}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Try Free Now
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="mb-6">
            <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
              🚀 Powered by GPT-4 AI
            </span>
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Stop Googling<br />
            <span className="text-indigo-600">Excel Formulas</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            AI that turns <span className="font-semibold">&quot;calculate growth %&quot;</span> into 
            <span className="font-mono bg-gray-100 px-2 py-1 rounded mx-1">=(B2-A2)/A2*100</span> 
            instantly. Save 4+ hours per week on spreadsheet work.
          </p>
          
          {/* Social Proof */}
          <div className="flex justify-center items-center space-x-8 mb-8 text-sm text-gray-500">
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

          <button
            onClick={onSignIn}
            className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto shadow-lg"
          >
            <span>Generate Your First Formula Free</span>
            <ChevronRight className="h-5 w-5" />
          </button>
          
          <p className="text-sm text-gray-500 mt-3">
            3 free formulas • No credit card required • 30-second setup
          </p>
        </div>

        {/* Before/After Comparison */}
        <div className="mt-20 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Before vs. After SheetGenius</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4 text-red-800">😤 The Old Way (Painful)</h3>
              <ul className="space-y-3 text-red-700">
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span>Google &quot;VLOOKUP syntax&quot; for the 100th time</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span>Spend 30+ minutes debugging #REF! errors</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span>Ask colleagues for help with &quot;simple&quot; formulas</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-500 mt-1">❌</span>
                  <span>Waste 4+ hours per week on formula work</span>
                </li>
              </ul>
            </div>

            {/* After */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-4 text-green-800">😎 The SheetGenius Way (Effortless)</h3>
              <ul className="space-y-3 text-green-700">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span>Type &quot;find customer email&quot; → get exact VLOOKUP</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span>AI explains what each formula does</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span>Works in Google Sheets via Chrome extension</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✅</span>
                  <span>Save 4+ hours per week, focus on insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <Brain className="h-12 w-12 text-indigo-600 mb-4" />
            <h3 className="text-xl font-semibold mb-4">AI Formula Generator</h3>
            <p className="text-gray-600">Powered by GPT-4. Understands context and generates perfect formulas from plain English descriptions.</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <AlertCircle className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Smart Debugger</h3>
            <p className="text-gray-600">Paste broken formulas and get instant fixes with clear explanations of what went wrong.</p>
          </div>
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <TrendingUp className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-4">Chrome Extension</h3>
            <p className="text-gray-600">Works directly inside Google Sheets. No switching tabs, no copy-paste hassle.</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-center text-gray-600 mb-12">Start free, upgrade when you see the value</p>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Free Trial</h3>
                <div className="text-3xl font-bold mb-4">$0</div>
                <ul className="text-left space-y-3 mb-6 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>3 AI formula generations</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>See how the AI works</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>No credit card required</span>
                  </li>
                </ul>
                <button 
                  onClick={onSignIn}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Try Free Now
                </button>
              </div>
            </div>

            {/* Starter */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Starter</h3>
                <div className="text-3xl font-bold mb-4">
                  $9.99<span className="text-lg text-gray-500">/month</span>
                </div>
                <ul className="text-left space-y-3 mb-6 text-gray-600">
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>25 formulas per month</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Perfect for freelancers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-green-500">✓</span>
                    <span>Email support</span>
                  </li>
                </ul>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Pro */}
            <div className="bg-indigo-600 text-white rounded-xl p-8 shadow-lg relative">
              <div className="absolute -top-3 -right-3 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Pro</h3>
                <div className="text-3xl font-bold mb-4">
                  $19.99<span className="text-lg opacity-80">/month</span>
                </div>
                <ul className="text-left space-y-3 mb-6">
                  <li className="flex items-center space-x-2">
                    <span className="text-white">✓</span>
                    <span>Unlimited formulas</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-white">✓</span>
                    <span>Chrome extension</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-white">✓</span>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="text-white">✓</span>
                    <span>Advanced features</span>
                  </li>
                </ul>
                <button className="w-full bg-white text-indigo-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  Start Pro Trial
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              💡 Compare: Excel consultants charge $75/hour. SheetGenius saves you money AND time.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-indigo-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Stop Wasting Time on Formulas?</h2>
          <p className="text-xl mb-8 opacity-90">Join professionals who save 4+ hours per week with AI-powered spreadsheets</p>
          <button
            onClick={onSignIn}
            className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Get Started Free - No Credit Card Required
          </button>
        </div>
      </div>
    </div>
  );
};

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const generateFormula = async () => {
    if (!prompt.trim()) return;
    
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
      } else {
        setResult({
          formula: 'Error generating formula',
          explanation: 'Please try again or rephrase your request.'
        });
      }
    } catch (error) {
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
                <span className="font-semibold text-indigo-600">{user.usage}/3</span>
                <span className="text-gray-500"> free queries</span>
              </div>
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md">
                ⚡ Upgrade to Pro - $19.99
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
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
              <Brain className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-green-600">12min</p>
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
                <p className="text-2xl font-bold text-green-600">$45</p>
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
                      ✨ What do you want to calculate?
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
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-3 font-semibold text-lg shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>AI is thinking...</span>
                      </>
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
                <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold flex items-center space-x-2">
                      <span>✨</span>
                      <span>Formula Generated Successfully!</span>
                    </h3>
                    <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      Query {user.usage}/3 • GPT-4 Powered
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Formula Display */}
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-sm font-semibold text-blue-800 uppercase tracking-wide">Excel/Google Sheets Formula:</span>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 font-medium">
                        <Copy className="h-4 w-4" />
                        <span>Copy Formula</span>
                      </button>
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
                      <span className="font-medium">Generated in under 3 seconds with 95% accuracy!</span>
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => {setResult(null); setPrompt('');}}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Generate Another Formula
                      </button>
                      <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium">
                        Get Unlimited Access
                      </button>
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
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-3">⚡ Unlock Full Power</h3>
              <div className="space-y-2 text-sm opacity-90 mb-4">
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Unlimited AI formulas</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Chrome extension</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Priority AI processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>✓</span>
                  <span>Advanced insights</span>
                </div>
              </div>
              <button className="w-full bg-white text-indigo-600 font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors">
                Upgrade to Pro - $19.99/mo
              </button>
              <p className="text-xs text-center mt-2 opacity-75">vs $75/hour for Excel consultants</p>
            </div>

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
