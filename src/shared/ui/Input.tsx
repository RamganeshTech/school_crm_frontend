// import React, { InputHTMLAttributes, forwardRef, useId } from 'react';

// export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
//   isRequired?: boolean;
// }

// export const Label: React.FC<LabelProps> = ({ children, className = '', isRequired, ...props }) => (
//   <label className={`block text-sm font-medium text-content mb-1.5 ${className}`} {...props}>
//     {children}
//     {isRequired && <span className="text-red-500 ml-1">*</span>}
//   </label>
// );

// export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
//   label?: string;
//   error?: string;
//   leftIcon?: string;
//   rightIcon?: string;
//   wrapperClassName?: string;
// }

// export const Input = forwardRef<HTMLInputElement, InputProps>(({
//   label,
//   error,
//   leftIcon,
//   rightIcon,
//   className = '',
//   wrapperClassName = '',
//   required,
//   id,
//   ...props
// }, ref) => {
//   const generatedId = useId();
//   const inputId = id || generatedId;

//   return (
//     <div className={`w-full ${wrapperClassName}`}>
//       {label && <Label htmlFor={inputId} isRequired={required}>{label}</Label>}
      
//       <div className="relative">
//         {leftIcon && (
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-content-muted">
//             <i className={leftIcon}></i>
//           </div>
//         )}
        
//         <input
//           ref={ref}
//           id={inputId}
//           required={required}
//           className={`
//             w-full bg-surface border rounded-lg text-sm text-content placeholder-content-muted 
//             transition-colors duration-200 outline-none
//             focus:border-primary focus:ring-1 focus:ring-primary
//             disabled:bg-background disabled:opacity-70
//             ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-divider'}
//             ${leftIcon ? 'pl-10' : 'pl-3'}
//             ${rightIcon ? 'pr-10' : 'pr-3'}
//             py-2 ${className}
//           `}
//           {...props}
//         />
        
//         {rightIcon && (
//           <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-content-muted">
//             <i className={rightIcon}></i>
//           </div>
//         )}
//       </div>
      
//       {error && <p className="mt-1.5 text-xs text-red-500 font-medium"><i className="fa-solid fa-circle-exclamation mr-1"></i>{error}</p>}
//     </div>
//   );
// });

// Input.displayName = 'Input';



import React, { type InputHTMLAttributes, forwardRef, useId } from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  isRequired?: boolean;
}

export const Label: React.FC<LabelProps> = ({ children, className = '', isRequired, ...props }) => (
  <label className={`block text-sm font-medium text-foreground mb-1.5 ${className}`} {...props}>
    {children}
    {isRequired && <span className="text-danger ml-1">*</span>}
  </label>
);

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: string;
  rightIcon?: string;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, leftIcon, rightIcon,
  className = '', wrapperClassName = '', required, id, ...props
}, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`w-full text-left ${wrapperClassName}`}>
      {label && <Label htmlFor={inputId} isRequired={required}>{label}</Label>}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
            <i className={leftIcon}></i>
          </div>
        )}
        <input
          ref={ref} id={inputId} required={required}
          className={`
            w-full bg-surface border rounded-lg text-sm text-foreground placeholder:text-muted
            transition-colors duration-200 outline-none
            focus:border-primary focus:ring-1 focus:ring-primary
            disabled:bg-background disabled:opacity-70
            ${error ? 'border-danger focus:border-danger focus:ring-danger' : 'border-border'}
            ${leftIcon ? 'pl-10' : 'pl-3'}
            ${rightIcon ? 'pr-10' : 'pr-3'}
            py-2 ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-muted">
            <i className={rightIcon}></i>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-danger font-medium">
          <i className="fa-solid fa-circle-exclamation mr-1"></i>{error}
        </p>
      )}
    </div>
  );
});
Input.displayName = 'Input';