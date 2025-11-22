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
  // Base: Rugged, industrial, slightly rounded, uppercase
  const baseStyles = 'relative inline-flex items-center justify-center px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed rounded-md border shadow-sm active:translate-y-0.5';

  const contentClass = 'flex items-center gap-2';

  let variantStyles = '';

  switch (variant) {
    case 'primary':
      // Burnt Orange / Deep Red - Action
      variantStyles = 'bg-gradient-to-b from-[#B91C1C] to-[#991B1B] border-[#7F1D1D] text-white hover:from-[#DC2626] hover:to-[#B91C1C] hover:shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:border-[#991B1B]';
      break;
    case 'secondary':
      // Industrial Metal / Dark Leather
      variantStyles = 'bg-[#27272A] border-[#3F3F46] text-[#D4D4D8] hover:bg-[#3F3F46] hover:text-white hover:border-[#52525B]';
      break;
    case 'danger':
      // Warning Red
      variantStyles = 'bg-transparent border-[#7F1D1D] text-[#EF4444] hover:bg-[#7F1D1D]/20 hover:text-[#FCA5A5]';
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