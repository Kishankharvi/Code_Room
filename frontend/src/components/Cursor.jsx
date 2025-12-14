import React from 'react';

const Cursor = ({ color, x, y, name }) => {
  return (
    <div
      className="absolute top-0 left-0"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={color}
        style={{ filter: `drop-shadow(0 0 2px ${color})` }}
      >
        <path d="M5.6,2.5l12.5,12.4l-3.3,1.6L2.6,4.4L5.6,2.5z" />
      </svg>
      <div
        className="absolute top-full left-1/2 px-2 py-1 text-sm text-white rounded-md"
        style={{
          backgroundColor: color,
          transform: 'translateX(-50%)',
        }}
      >
        {name}
      </div>
    </div>
  );
};

export default Cursor;