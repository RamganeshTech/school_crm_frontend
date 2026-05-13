import React from 'react';
import { Link } from 'react-router-dom'; // Assuming react-router

interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-content-muted">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <div key={item.label} className="flex items-center">
            {item.path && !isLast ? (
              <Link to={item.path} className="hover:text-primary transition-colors flex items-center gap-1.5 font-medium">
                {item.icon && <i className={item.icon}></i>}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 text-content font-semibold">
                {item.icon && <i className={item.icon}></i>}
                {item.label}
              </span>
            )}
            
            {!isLast && <i className="fa-solid fa-chevron-right text-[10px] mx-3 opacity-60"></i>}
          </div>
        );
      })}
    </nav>
  );
};