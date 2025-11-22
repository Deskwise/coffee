import React, { useState } from 'react';
import { supabase } from '../src/lib/supabaseClient';
import Button from './Button';
import Input from './Input';

interface AuthProps {
    onAuthSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onAuthSuccess();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0806] p-4 font-sans">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }}></div>

            <div className="w-full max-w-md relative z-10">
                {/* Industrial Card Container */}
                <div className="bg-[#1a0f0a] border-4 border-[#3E2723] rounded-xl shadow-2xl overflow-hidden relative">
                    {/* Wood Grain Header */}
                    <div className="bg-[#3E2723] p-6 border-b-4 border-[#5D4037] relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #3E2723 0px, #1a0f0a 2px, #3E2723 4px)' }}></div>
                        <h1 className="text-4xl font-black text-[#E7E5E4] mb-1 text-center uppercase tracking-tight drop-shadow-md relative z-10">TIMBERCREEK</h1>
                        <h2 className="text-sm text-[#D97706] font-bold text-center uppercase tracking-[0.3em] relative z-10 border-t border-[#7C2D12] pt-2 mt-1">Men's Connect</h2>
                    </div>

                    <div className="p-8 space-y-6">
                        <h3 className="text-xl font-bold text-[#A8A29E] text-center uppercase tracking-widest border-b border-[#3E2723] pb-4">
                            {isSignUp ? 'New Member Access' : 'Member Login'}
                        </h3>

                        {error && (
                            <div className="bg-red-900/20 border border-red-800 text-red-400 p-3 rounded text-sm font-bold text-center">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-900/20 border border-green-800 text-green-400 p-3 rounded text-sm font-bold text-center">
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-5">
                            <Input
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />

                            <Input
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 text-lg"
                            >
                                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Access Portal')}
                            </Button>
                        </form>

                        <div className="text-center pt-4 border-t border-[#3E2723]">
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-[#78716C] hover:text-[#D97706] text-xs font-bold uppercase tracking-wider transition-colors"
                            >
                                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[#3E2723]"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="px-2 bg-[#1a0f0a] text-[#57534E] font-bold">Or continue with</span>
                            </div>
                        </div>

                        <div>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={async () => {
                                    setLoading(true);
                                    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
                                    if (error) setError(error.message);
                                    setLoading(false);
                                }}
                                className="w-full bg-[#E7E5E4] hover:bg-white text-[#1a0f0a] font-bold py-3 px-4 rounded border-2 border-[#A8A29E] transition-all hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-wide text-sm"
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                                    <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z" fill="#34A853" />
                                    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                                    <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.426 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z" fill="#EA4335" />
                                </svg>
                                {loading ? 'Loading...' : 'Sign in with Google'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center mt-8 text-[#57534E] text-xs font-bold uppercase tracking-widest">
                    &copy; 2024 Timbercreek Men's Connect
                </div>
            </div>
        </div>
    );
};
