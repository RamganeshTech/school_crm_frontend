// import React, { useState, useRef, useEffect } from 'react';
// import { Input } from './Input';

// export interface SelectOption {
//   label: string;
//   value: string | number;
// }

// interface SearchSelectProps {
//   options: SelectOption[];
//   value?: string | number | null;
//   onChange: (value: SelectOption) => void;
//   onEnter?: (searchValue: string) => void;
//   placeholder?: string;
//   label?: string;
// }

// export const SearchSelect: React.FC<SearchSelectProps> = ({
//   options,
//   value,
//   onChange,
//   onEnter,
//   placeholder = "Search...",
//   label
// }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [search, setSearch] = useState('');
//   const [highlightedIndex, setHighlightedIndex] = useState(0);
//   const wrapperRef = useRef<HTMLDivElement>(null);

//   // Initialize search text with selected value if exists
//   useEffect(() => {
//     const selectedObj = options.find(opt => opt.value === value);
//     if (selectedObj && !isOpen) {
//       setSearch(selectedObj.label);
//     }
//   }, [value, options, isOpen]);

//   // Click outside to close
//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const filteredOptions = options.filter(opt => 
//     opt.label.toLowerCase().includes(search.toLowerCase())
//   );

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (!isOpen) {
//       if (e.key === 'Enter' || e.key === 'ArrowDown') setIsOpen(true);
//       return;
//     }

//     if (e.key === 'ArrowDown') {
//       e.preventDefault();
//       setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
//     } else if (e.key === 'ArrowUp') {
//       e.preventDefault();
//       setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
//     } else if (e.key === 'Enter') {
//       e.preventDefault();
//       if (filteredOptions[highlightedIndex]) {
//         handleSelect(filteredOptions[highlightedIndex]);
//       } else if (onEnter && search.trim()) {
//         onEnter(search); // Trigger custom enter event if no option matches
//         setIsOpen(false);
//       }
//     } else if (e.key === 'Escape') {
//       setIsOpen(false);
//     }
//   };

//   const handleSelect = (option: SelectOption) => {
//     setSearch(option.label);
//     onChange(option);
//     setIsOpen(false);
//   };

//   return (
//     <div className="relative w-full" ref={wrapperRef}>
//       <Input
//         label={label}
//         placeholder={placeholder}
//         value={search}
//         onChange={(e) => {
//           setSearch(e.target.value);
//           setIsOpen(true);
//           setHighlightedIndex(0);
//         }}
//         onFocus={() => setIsOpen(true)}
//         onKeyDown={handleKeyDown}
//         leftIcon="fa-solid fa-magnifying-glass"
//         rightIcon={isOpen ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"}
//       />

//       {isOpen && (
//         <div className="absolute z-50 w-full mt-1 bg-surface border border-divider rounded-lg shadow-lg max-h-60 overflow-y-auto">
//           {filteredOptions.length > 0 ? (
//             <ul className="py-1">
//               {filteredOptions.map((opt, index) => (
//                 <li
//                   key={opt.value}
//                   onClick={() => handleSelect(opt)}
//                   onMouseEnter={() => setHighlightedIndex(index)}
//                   className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
//                     index === highlightedIndex ? 'bg-primary-soft text-primary' : 'text-content hover:bg-background'
//                   }`}
//                 >
//                   {opt.label}
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <div className="px-4 py-3 text-sm text-content-muted text-center">
//               No results found for "{search}"
//               {onEnter && <span className="block mt-1 text-xs">Press Enter to search system-wide</span>}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };



import React, { useState, useRef, useEffect } from 'react';
import { Input } from './Input';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SearchSelectProps {
  options: SelectOption[];
  value?: string | number | null;
  onChange: (value: SelectOption) => void;
  onEnter?: (searchValue: string) => void;
  placeholder?: string;
  label?: string;
}

export const SearchSelect: React.FC<SearchSelectProps> = ({
  options,
  value,
  onChange,
  onEnter,
  placeholder = "Search...",
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Initialize search text with selected value if exists
  useEffect(() => {
    const selectedObj = options.find(opt => opt.value === value);
    if (selectedObj && !isOpen) {
      setSearch(selectedObj.label);
    }
  }, [value, options, isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🛑 THE FIX: Check if the search text is just the already-selected item
  const selectedObj = options.find(opt => opt.value === value);
  const isSearchJustSelectedValue = selectedObj && search === selectedObj.label;

  // 🛑 THE FIX: If they haven't typed a new search query yet, show ALL options
  const filteredOptions = isSearchJustSelectedValue
    ? options
    : options.filter(opt => opt.label.toLowerCase().includes(search.toLowerCase()));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else if (onEnter && search.trim()) {
        onEnter(search); // Trigger custom enter event if no option matches
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents the dropdown from opening when clicking X
    setSearch('');
    onChange({ label: '', value: '' }); // Clear the value
    setIsOpen(false);
  };

  const handleSelect = (option: SelectOption) => {
    setSearch(option.label);
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <Input
        label={label}
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(0);
        }}

        // Replace your existing rightIcon line with this logic:
        rightIcon={
          value
            ? "fa-solid fa-xmark cursor-pointer hover:text-red-500"
            : (isOpen ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down")
        }

        onRightIconClick={value ? handleClear : () => setIsOpen(!isOpen)}

        onFocus={(e) => {
          setIsOpen(true);
          // Optional UX Polish: Highlight the text when clicked so they can easily type over it
          e.target.select();
        }}
        onKeyDown={handleKeyDown}
        leftIcon="fa-solid fa-magnifying-glass"
        // rightIcon={isOpen ? "fa-solid fa-chevron-up" : "fa-solid fa-chevron-down"}
      />

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-divider rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <ul className="py-1">
              {filteredOptions.map((opt, index) => (
                <li
                  key={opt.value}
                  onClick={() => handleSelect(opt)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors ${index === highlightedIndex ? 'bg-primary-soft text-primary' : 'text-content hover:bg-background'
                    }`}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-content-muted text-center">
              No results found for "{search}"
              {onEnter && <span className="block mt-1 text-xs">Press Enter to search system-wide</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};