import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (username: string, password_unused: string) => boolean;
  onSwitchToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError('User does not exist. Please check the username or sign up.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-950 p-4">
      <div className="w-full max-w-sm mx-auto text-center">
        <div className="flex justify-center items-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-3xl">S</div>
        </div>
        <h1 className="text-4xl font-bold mb-2 text-white">SmartSave Login</h1>
        <p className="text-slate-400 mb-8">Sign in to access your financial dashboard.</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <input 
              type="text" 
              name="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 text-center bg-slate-800 border-slate-700 rounded-lg text-white text-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" 
              placeholder="Username" 
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
              placeholder="Password" 
              required 
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg">
            Login
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-400">
            <p>Don't have an account?{' '}
                <button onClick={onSwitchToSignup} className="font-semibold text-indigo-400 hover:text-indigo-300">
                    Sign Up
                </button>
            </p>
        </div>

        <div className="mt-6 text-xs text-slate-500 bg-slate-800/50 p-3 rounded-lg">
            <p className="font-bold mb-1">Pre-loaded Demo Accounts:</p>
            <p>Username: <span className="font-mono text-slate-300">user1</span></p>
            <p>Username: <span className="font-mono text-slate-300">user2</span></p>
             <p>(Any password will work for demo accounts)</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;