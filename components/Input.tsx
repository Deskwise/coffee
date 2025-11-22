import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className = '', ...props }) => {
  return (
    <div className="mb-5 group">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest transition-colors group-focus-within:text-primary">
          {label}
        </label>
      )}
      <div className="relative">
        <input
            id={id}
            className={`w-full p-3 bg-surfaceHighlight border-l-2 border-b border-t-0 border-r-0 border-gray-700 text-white placeholder-gray-600 focus:border-l-primary focus:border-b-primary focus:ring-0 outline-none transition-all duration-200 font-sans ${className} ${error ? 'border-danger text-danger' : ''}`}
            style={{ borderRadius: 0 }}
            {...props}
        />
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gray-600 pointer-events-none group-focus-within:border-primary transition-colors"></div>
      </div>
      
      {error && <p className="mt-1.5 text-xs font-bold text-danger uppercase flex items-center">
        <span className="mr-1">■</span> {error}
      </p>}
    </div>
  );
};

export default Input;