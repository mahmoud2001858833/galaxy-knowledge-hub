
import React from 'react';

const PuzzlePiece = ({ className }: { className?: string }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 9a4 4 0 0 1 4 4 4 4 0 0 0 4 4 4 4 0 0 1 4-4 4 4 0 0 0 4-4"></path>
      <path d="M5 9a4 4 0 0 0 4-4 4 4 0 0 1 4-4 4 4 0 0 0 4 4 4 4 0 0 1 4 4"></path>
    </svg>
  );
};

export default PuzzlePiece;
