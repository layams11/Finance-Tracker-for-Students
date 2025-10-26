import React from 'react';
import type { Page } from '../types';
import { HomeIcon, TargetIcon, HistoryIcon, ChartBarIcon, CogIcon } from './Icons';

interface NavbarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  currentUser: string;
}

const navItems = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'goals', label: 'Goals', icon: TargetIcon },
  { id: 'transactions', label: 'Transactions', icon: HistoryIcon },
  { id: 'insights', label: 'Insights', icon: ChartBarIcon },
  { id: 'settings', label: 'Settings', icon: CogIcon },
] as const;


const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage, currentUser }) => {
  const NavButton: React.FC<{item: typeof navItems[number]}> = ({ item }) => {
    const isActive = currentPage === item.id;
    return (
      <button
        onClick={() => setCurrentPage(item.id)}
        className={`flex md:flex-row md:items-center md:w-full md:justify-start flex-col items-center justify-center space-y-1 md:space-y-0 md:space-x-3 p-3 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-purple-600/20 text-purple-300'
            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
        }`}
      >
        <item.icon className="w-6 h-6" />
        <span className="text-xs md:text-base font-medium">{item.label}</span>
      </button>
    );
  };
  
  return (
    <>
      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 p-2 flex justify-around z-20">
        {navItems.map(item => (
          <NavButton key={item.id} item={item} />
        ))}
      </nav>
      
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-slate-900 p-4 space-y-2 border-r border-slate-800">
        <div className="flex items-center space-x-3 p-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-xl">S</div>
            <div>
                <h1 className="text-2xl font-bold text-white">SmartSave</h1>
                <p className="text-xs text-slate-400">Logged in as: {currentUser}</p>
            </div>
        </div>
        {navItems.map(item => (
          <NavButton key={item.id} item={item} />
        ))}
      </nav>
    </>
  );
};

export default Navbar;