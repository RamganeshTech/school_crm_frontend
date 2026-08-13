import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

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
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  // Calculate exactly where the button is on the screen to place the portal
  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4, // 4px gap below the button
        left: rect.left,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = () => setIsOpen(false);
    
    // Close the dropdown if the user scrolls the table or window to prevent it floating away
    const handleScroll = () => setIsOpen(false);

    if (isOpen) {
      // Small timeout prevents immediate closing when clicking the trigger
      setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
      // document.addEventListener('click', handleClickOutside)
      window.addEventListener('scroll', handleScroll, true); // 'true' captures table scrolling
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  // The actual menu HTML that gets teleported to the <body>
  const menu = (
    <div 
      className="fixed z-[9999] w-48 rounded-xl shadow-lg bg-surface border border-border-default p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-200"
      style={{
        top: coords.top,
        // If align is right, shift the menu left by its width (192px = w-48) minus the button's width
        left: align === 'right' ? coords.left - (192 - coords.width) : coords.left,
      }}
      onClick={(e) => e.stopPropagation()} // Keep menu open if clicking dead space inside it
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick();
            setIsOpen(false);
          }}
          className={`w-full cursor-pointer text-left flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 group ${
            item.isDanger 
              ? 'text-danger hover:bg-danger/10' 
              : 'text-foreground hover:bg-primary-soft hover:text-primary'
          }`}
        >
          {item.icon && (
            <i 
              className={`${item.icon} text-base w-6 flex justify-center mr-2.5 transition-colors ${
                item.isDanger 
                  ? 'text-danger/70 group-hover:text-danger' 
                  : 'text-muted group-hover:text-primary'
              }`}
            ></i>
          )}
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* The Trigger stays in the normal flow of the table */}
      <div ref={triggerRef} onClick={handleOpen} className="cursor-pointer inline-block">
        {trigger}
      </div>

      {/* The Menu gets teleported out of the table entirely */}
      {isOpen && createPortal(menu, document.body)}
    </>
  );
};