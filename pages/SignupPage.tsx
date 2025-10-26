import React, { useState } from 'react';

interface SignupPageProps {
  onSignup: (username: string, password_unused: string) => boolean;
  onSwitchToLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    const success = onSignup(username, password);
    if (!success) {
      setError('Username already taken. Please choose another one.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-950 p-4">
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="flex justify-center items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-3xl">S</div>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-white">Create Your Account</h1>
        <p className="text-slate-400 mb-8">Join SmartSave to start managing your finances.</p>
        
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <input 
              type="text" 
              name="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 text-center bg-slate-800 border-slate-700 rounded-lg text-white text-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" 
              placeholder="Choose a Username" 
              required 
            />
          </div>
          <div>
            <input 
              type="password" 
              name="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 text-center bg-slate-800 border-slate-700 rounded-lg text-white text-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" 
              placeholder="Choose a Password" 
              required 
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg">
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-400">
            <p>Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="font-semibold text-indigo-400 hover:text-indigo-300">
                    Login
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;