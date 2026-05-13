import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultActiveId?: string;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, defaultActiveId, className = '' }) => {
  const [activeId, setActiveId] = useState(defaultActiveId || tabs[0]?.id);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-divider hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveId(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeId === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-content-muted hover:text-content hover:border-divider'
            }`}
          >
            {tab.icon && <i className={tab.icon}></i>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-4 animate-fade-in">
        {tabs.find(tab => tab.id === activeId)?.content}
      </div>
    </div>
  );
};