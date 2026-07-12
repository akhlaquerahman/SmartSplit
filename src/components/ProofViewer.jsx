import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';

const ProofViewer = ({ imageUrl, onClose, altText = "Proof" }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageUrl) return null;

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setScale(s => Math.min(s + 0.25, 3));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setScale(s => Math.max(s - 0.25, 0.5));
  };

  const handleRotate = (e) => {
    e.stopPropagation();
    setRotation(r => r + 90);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `proof-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" 
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Toolbar */}
        <div 
          className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 bg-slate-900/80 p-2 rounded-2xl border border-white/10 z-10"
          onClick={e => e.stopPropagation()}
        >
          <button onClick={handleZoomOut} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors" title="Zoom Out">
            <ZoomOut size={20} />
          </button>
          <span className="text-white text-xs font-semibold px-1 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors" title="Zoom In">
            <ZoomIn size={20} />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <button onClick={handleRotate} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors" title="Rotate">
            <RotateCw size={20} />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <button onClick={handleDownload} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors" title="Download">
            <Download size={20} />
          </button>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <button onClick={onClose} className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-colors" title="Close">
            <X size={20} />
          </button>
        </div>

        {/* Image Container */}
        <div className="relative w-full h-full max-w-5xl max-h-[85vh] flex items-center justify-center overflow-hidden rounded-3xl" onClick={e => e.stopPropagation()}>
          <motion.img 
            src={imageUrl} 
            alt={altText}
            className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
            style={{ 
              scale, 
              rotate: rotation 
            }}
            drag
            dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale, opacity: 1, rotate: rotation }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>
    </AnimatePresence>
  );
};

export default ProofViewer;
