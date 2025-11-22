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
        <label htmlFor={id} className="block text-xs font-bold text-[#9CA3AF] mb-1.5 uppercase tracking-widest transition-colors group-focus-within:text-[#D97706]">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          className={`w-full p-3 bg-[#0a0806] border border-[#3E2723] rounded-md text-white placeholder-[#52525B] focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] outline-none transition-all duration-200 font-sans shadow-inner ${className} ${error ? 'border-red-500 text-red-500' : ''}`}
          {...props}
        />
      </div>

      {error && <p className="mt-1.5 text-xs font-bold text-red-500 uppercase flex items-center">
        <span className="mr-1">■</span> {error}
      </p>}
    </div>
  );
};

export default Input;