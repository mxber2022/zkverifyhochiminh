import React from 'react';
import { Check } from 'lucide-react';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  className = ""
}) => {
  return (
    <label className={`group flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-neutral-800/50 transition-all duration-200 select-none ${className}`}>
      <div className="relative flex-shrink-0">
        {/* Hidden native checkbox for accessibility */}
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
          tabIndex={-1}
        />
        
        {/* Custom checkbox visual */}
        <div 
          className={`w-5 h-5 border-2 rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer ${
            checked
              ? 'bg-gradient-to-br from-green-600 to-emerald-600 border-green-500 shadow-lg scale-110'
              : 'border-neutral-700 hover:border-neutral-600 group-hover:bg-neutral-800/30 hover:scale-105'
          }`}
          onClick={(e) => {
            e.preventDefault();
            onChange(!checked);
          }}
        >
          {checked && (
            <Check className="w-3 h-3 text-white animate-scale-in" strokeWidth={3} />
          )}
        </div>
      </div>
      
      <span 
        className={`font-medium transition-colors leading-relaxed cursor-pointer ${
          checked ? 'text-white' : 'text-neutral-300 group-hover:text-white'
        }`}
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
      >
        {label}
      </span>
    </label>
  );
};