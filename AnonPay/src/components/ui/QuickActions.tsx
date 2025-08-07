import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

interface QuickActionsProps {
  onCreateClick: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onCreateClick }) => {
  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 animate-slide-up">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg text-sharp text-white mb-2">QUICK ACTIONS</h3>
          <p className="text-sm text-neutral-400 font-medium">Create and manage your commitments</p>
        </div>
        
        <button
          onClick={onCreateClick}
          className="group w-full bg-gradient-to-r from-neutral-900 to-neutral-800 hover:from-neutral-800 hover:to-neutral-700 border border-neutral-700 hover:border-neutral-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3 shadow-lg hover:shadow-neutral-500/10 text-sharp-light tracking-wide"
        >
          <div className="p-2 bg-neutral-800 group-hover:bg-neutral-700 border border-neutral-700 group-hover:border-neutral-600 rounded-lg transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span>CREATE NEW COMMITMENT</span>
          <Sparkles className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
};