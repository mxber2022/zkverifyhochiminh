import React from 'react';
import { Home, Send, History, User, Shield } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useWallet } from '../../hooks/useWallet';

interface HeaderProps {
  currentPage: 'home' | 'send' | 'transactions' | 'profile';
  onNavigate: (page: 'home' | 'send' | 'transactions' | 'profile') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const { isConnected, address, isConnecting, connectWallet, disconnectWallet, formatAddress } = useWallet();

  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-red-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl">
                <Logo size="md" variant="white" />
              </div>
              <div>
                <h1 className="text-xl brand-text text-white">ANONPAY</h1>
                <p className="brand-subtitle text-red-400">PRIVACY-FIRST PAYMENTS</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-1 bg-neutral-950 border border-red-900/30 rounded-xl p-1 overflow-x-auto">
              <button
                onClick={() => onNavigate('home')}
                className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 ease-out ${
                  currentPage === 'home'
                    ? 'bg-red-900/50 text-white shadow-lg transform scale-[1.02]'
                    : 'text-neutral-400 hover:text-white hover:bg-red-900/20 hover:scale-[1.01]'
                }`}
              >
                <Home className={`w-4 h-4 transition-all duration-300 ${
                  currentPage === 'home' ? 'text-white' : 'text-neutral-400'
                }`} />
                <span className="transition-all duration-300">HOME</span>
                {currentPage === 'home' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-xl animate-pulse" />
                )}
              </button>
              
              <button
                onClick={() => onNavigate('send')}
                className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 ease-out ${
                  currentPage === 'send'
                    ? 'bg-red-900/50 text-white shadow-lg transform scale-[1.02]'
                    : 'text-neutral-400 hover:text-white hover:bg-red-900/20 hover:scale-[1.01]'
                }`}
              >
                <Send className={`w-4 h-4 transition-all duration-300 ${
                  currentPage === 'send' ? 'text-white' : 'text-neutral-400'
                }`} />
                <span className="transition-all duration-300">SEND</span>
                {currentPage === 'send' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-xl animate-pulse" />
                )}
              </button>
              
              <button
                onClick={() => onNavigate('transactions')}
                className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 ease-out ${
                  currentPage === 'transactions'
                    ? 'bg-red-900/50 text-white shadow-lg transform scale-[1.02]'
                    : 'text-neutral-400 hover:text-white hover:bg-red-900/20 hover:scale-[1.01]'
                }`}
              >
                <History className={`w-4 h-4 transition-all duration-300 ${
                  currentPage === 'transactions' ? 'text-white' : 'text-neutral-400'
                }`} />
                <span className="transition-all duration-300">HISTORY</span>
                {currentPage === 'transactions' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-xl animate-pulse" />
                )}
              </button>
              
              <button
                onClick={() => onNavigate('profile')}
                className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 ease-out ${
                  currentPage === 'profile'
                    ? 'bg-red-900/50 text-white shadow-lg transform scale-[1.02]'
                    : 'text-neutral-400 hover:text-white hover:bg-red-900/20 hover:scale-[1.01]'
                }`}
              >
                <User className={`w-4 h-4 transition-all duration-300 ${
                  currentPage === 'profile' ? 'text-white' : 'text-neutral-400'
                }`} />
                <span className="transition-all duration-300">PROFILE</span>
                {currentPage === 'profile' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 rounded-xl animate-pulse" />
                )}
              </button>
            </nav>
          </div>

          {/* Connect Wallet Button */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="relative group">
                <div className="flex items-center space-x-3 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 hover:bg-neutral-900 hover:border-red-700 transition-all duration-300 cursor-pointer group-hover:border-red-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse group-hover:bg-red-400 transition-colors duration-300"></div>
                  <span className="text-white font-semibold text-sm tracking-wide group-hover:text-red-300 transition-colors duration-300">
                    {address ? formatAddress(address) : 'Connected'}
                  </span>
                </div>
                
                {/* Hover Tooltip */}
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-50">
                  <div className="bg-neutral-950 border border-red-800 rounded-xl p-3 shadow-2xl animate-scale-in">
                    <div className="text-center mb-3">
                      <div className="text-red-400 font-semibold text-sm mb-1">Disconnect Wallet?</div>
                      <div className="text-neutral-400 text-xs">
                        {address ? formatAddress(address) : 'Connected wallet'}
                      </div>
                    </div>
                    <button
                      onClick={disconnectWallet}
                      className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm"
                    >
                      Disconnect
                    </button>
                  </div>
                  
                  {/* Arrow pointer */}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-neutral-950 border-l border-t border-red-800 rotate-45"></div>
                </div>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="relative inline-flex items-center space-x-2 bg-neutral-950 hover:bg-neutral-900 border border-red-900/30 hover:border-red-700 disabled:border-neutral-800 text-white font-semibold py-2.5 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 disabled:opacity-60 text-sm tracking-wide overflow-hidden group"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neutral-400 border-t-white rounded-full animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span>Connect Wallet</span>
                  </>
                )}
                
                {/* Subtle hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 to-red-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};