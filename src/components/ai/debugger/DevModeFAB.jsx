import React, { useEffect } from 'react';
import useDebuggerStore from '../../../store/useDebuggerStore';

const DevModeFAB = () => {
  const { toggleDrawer } = useDebuggerStore();

  // Keyboard Shortcut: Ctrl + Shift + D
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        toggleDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDrawer]);

  // UI moved to AIChatHeader
  return null;
};
export default DevModeFAB;