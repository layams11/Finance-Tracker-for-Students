
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-700">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white">S</div>
            <h1 className="text-xl font-bold text-white">SmartSave</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
