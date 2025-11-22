import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface py-4 text-center text-text-secondary text-sm mt-8">
      <p>&copy; {new Date().getFullYear()} Timbercreek Men's Connect. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
