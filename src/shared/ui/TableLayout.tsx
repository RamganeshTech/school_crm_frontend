import React from 'react';

// 1. Extend standard div attributes so it naturally supports onScroll, id, data-*, etc.
interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableContainer: React.FC<TableContainerProps> = ({ children, className = '', ...props }) => (
  <div className={`w-full overflow-x-auto rounded-xl border border-border bg-surface shadow-sm ${className}`} {...props}>
    <table className="w-full text-left border-collapse whitespace-nowrap">
      {children}
    </table>
  </div>
);

export const THead: React.FC<{ children: React.ReactNode ,  className?: string;}> = ({ children , className = '',}) => (
  <thead className={`bg-primary-soft text-content-muted text-xs uppercase tracking-wider font-normal border-b border-border ${className}`}>
    {children}
  </thead>
);

export const Th: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <th className={`px-6 py-4 ${className}`}>{children}</th>
);

export const TBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody 
  className="divide-y divide-border"
  >
    {children}
  </tbody>
);

export const Tr: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <tr 
    onClick={onClick}
    className={`transition-colors duration-150 ${onClick ? 'cursor-pointer hover:bg-background' : 'hover:bg-background/50'} ${className}`}
  >
    {children}
  </tr>
);

export const Td: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <td 
  className={`px-6 py-4 text-sm text-content ${className}`}
  >{children}</td>
);