import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);
  
    return (
      <div className="relative inline-block">
        <div
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
        >
          {children}
        </div>
        {isVisible && (
          <div className="absolute z-10 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-sm dark:bg-gray-700 -top-10 left-1/2 transform -translate-x-1/2">
            {content}
            <div className="absolute w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45 -bottom-1 left-1/2 transform -translate-x-1/2"></div>
          </div>
        )}
      </div>
    );
  };