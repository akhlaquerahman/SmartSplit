import React from 'react';

const UserMessage = ({ content }) => {
  return (
    <div className="flex justify-end">
      <div className="bg-gray-900 text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm">
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};
export default UserMessage;