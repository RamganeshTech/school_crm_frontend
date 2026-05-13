import React, { useState, useRef, useEffect } from 'react';

export interface DropdownItem {
  label: string;
  icon?: string;
  onClick: () => void;
  isDanger?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={`absolute z-[50] mt-2 w-48 rounded-lg shadow-lg bg-surface border border-divider py-1 animate-fade-in-up ${
            align === 'right' ? 'origin-top-right right-0' : 'origin-top-left left-0'
          }`}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className={`w-full text-left flex items-center px-4 py-2 text-sm transition-colors ${
                item.isDanger 
                  ? 'text-red-600 hover:bg-red-50' 
                  : 'text-content hover:bg-background hover:text-primary'
              }`}
            >
              {item.icon && <i className={`${item.icon} w-5 text-center mr-2 ${item.isDanger ? 'text-red-500' : 'text-content-muted'}`}></i>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};