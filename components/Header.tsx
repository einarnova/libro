import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = true, onBack }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center bg-white dark:bg-surface-dark p-4 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-20">
      <div className="flex size-10 shrink-0 items-center justify-start">
        {showBack && (
          <button 
            onClick={handleBack}
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-200"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              arrow_back
            </span>
          </button>
        )}
      </div>
      <h2 className="text-text-dark dark:text-white text-lg font-bold leading-tight flex-1 text-center truncate px-2">
        {title}
      </h2>
      <div className="size-10 shrink-0"></div>
    </div>
  );
};