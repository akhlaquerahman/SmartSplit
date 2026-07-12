import React from 'react';
import { Outlet } from 'react-router-dom';
import AISidebar from './AISidebar';

const AIStudioLayout = () => {
  return (
    <div className="flex-1 w-full h-full bg-white dark:bg-[#111111] overflow-y-auto">
      <Outlet />
    </div>
  );
};

export default AIStudioLayout;