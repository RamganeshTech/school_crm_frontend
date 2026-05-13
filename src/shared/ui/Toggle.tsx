import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ 
  checked, 
  onChange, 
  label, 
  description, 
  disabled = false 
}) => {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      {/* Switch Body */}
      <div className="relative inline-flex items-center mt-0.5">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className="w-10 h-5.5 bg-background border border-divider rounded-full peer peer-checked:bg-primary transition-colors duration-200"></div>
        {/* Switch Thumb */}
        <div className={`absolute left-0.5 top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transform transition-transform duration-200 ${checked ? 'translate-x-4.5' : 'translate-x-0'}`}></div>
      </div>

      {/* Label & Description */}
      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium text-content">{label}</span>}
          {description && <span className="text-xs text-content-muted mt-0.5">{description}</span>}
        </div>
      )}
    </label>
  );
};