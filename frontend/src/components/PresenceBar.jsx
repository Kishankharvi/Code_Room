import React from 'react';

const PresenceBar = ({ participants }) => {
  if (!participants || participants.length === 0) {
    return <div className="text-sm text-gray-400">No other users in this room.</div>;
  }

  return (
    <div>
      <h4 className="font-bold mb-2 text-md">Participants ({participants.length})</h4>
      <div className="flex flex-wrap gap-2">
        {participants.map(p => (
          <div key={p._id} className="flex items-center gap-2 bg-gray-700 px-2 py-1 rounded-full text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${p.role === 'mentor' ? 'bg-green-400' : 'bg-blue-400'}`} title={p.role}></span>
            <span>{p.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresenceBar;
