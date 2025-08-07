import React from 'react';
import { Github, Twitter, MessageCircle, Shield } from 'lucide-react';
import { Logo } from '../ui/Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-red-900/30 bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Brand Section */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg">
              <Logo size="sm" variant="white" />
            </div>
            <div>
              <h3 className="text-lg brand-text text-white">ANONPAY</h3>
              <p className="brand-subtitle text-red-400">PRIVACY-FIRST PAYMENTS</p>
            </div>
          </div>

          {/* Links */}
          {/* <div className="flex items-center space-x-6 text-sm text-neutral-400">
            <a href="#" className="hover:text-white transition-colors font-medium">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors font-medium">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors font-medium">Compliance</a>
            <a href="#" className="hover:text-white transition-colors font-medium">Support</a>
          </div> */}

          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-9 h-9 bg-neutral-900 border border-red-900/30 hover:bg-red-900/20 hover:border-red-700 rounded-lg transition-all duration-200 hover:scale-105"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
            </a>
            
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-9 h-9 bg-neutral-900 border border-red-900/30 hover:bg-red-900/20 hover:border-red-700 rounded-lg transition-all duration-200 hover:scale-105"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
            </a>

            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center w-9 h-9 bg-neutral-900 border border-red-900/30 hover:bg-red-900/20 hover:border-red-700 rounded-lg transition-all duration-200 hover:scale-105"
              aria-label="Discord"
            >
              <MessageCircle className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
            </a>
          </div>

          {/* Copyright */}
          <div className="text-xs text-neutral-500 text-center md:text-right">
            <p className="font-semibold">© 2025 ANONPAY</p>
            <div className="flex items-center justify-center md:justify-end space-x-2 mt-1">
              <Shield className="w-3 h-3 text-red-500" />
              <span className="font-semibold tracking-wide">PRIVACY-PRESERVING PAYMENTS</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};