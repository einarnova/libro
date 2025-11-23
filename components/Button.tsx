import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  loading = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center overflow-hidden rounded-lg h-12 px-5 font-bold leading-normal tracking-[0.015em] transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-hover text-white focus:ring-primary shadow-lg shadow-blue-500/30",
    secondary: "bg-blue-100 text-primary hover:bg-blue-200 focus:ring-blue-300",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800",
    outline: "border-2 border-primary text-primary hover:bg-blue-50",
  };

  const widthClass = fullWidth ? "w-full flex-1" : "min-w-[84px]";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
           <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           Procesando...
        </span>
      ) : children}
    </button>
  );
};