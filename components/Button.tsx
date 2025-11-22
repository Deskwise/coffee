import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  loading = false,
  disabled,
  ...props
}) => {
  // Base: Sharp corners, uppercase, tracking, slanted
  const baseStyles = 'relative inline-flex items-center justify-center px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transform skew-x-[-10deg] active:scale-95 border-2';
  
  // Un-skew text wrapper
  const contentClass = 'transform skew-x-[10deg] flex items-center gap-2';

  let variantStyles = '';

  switch (variant) {
    case 'primary':
      // Red gradient, glowing
      variantStyles = 'bg-primary border-primary text-white hover:bg-primary-light hover:border-primary-light hover:shadow-[0_0_15px_rgba(214,24,31,0.6)]';
      break;
    case 'secondary':
      // Gunmetal, metallic border
      variantStyles = 'bg-surfaceHighlight border-slate-600 text-text-secondary hover:text-white hover:border-white hover:bg-slate-700';
      break;
    case 'danger':
      // Dark red outline or solid
      variantStyles = 'bg-transparent border-danger text-danger hover:bg-danger hover:text-white';
      break;
    default:
      break;
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <span className={contentClass}>
        {loading ? (
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </span>
    </button>
  );
};

export default Button;