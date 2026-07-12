import React, { useState } from 'react';
import { FileText, Download, Play, Pause, ExternalLink } from 'lucide-react';

const MessageBubble = ({ msg, isOwn, formatTime }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(null);

  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const renderContent = () => {
    switch (msg.messageType) {
      case 'image':
        return (
          <div className="relative group cursor-pointer" onClick={() => window.open(msg.mediaUrl, '_blank')}>
            <img 
              src={msg.mediaUrl} 
              alt="shared" 
              className="max-w-[200px] rounded-lg shadow-sm group-hover:opacity-90 transition-opacity"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/50 p-2 rounded-full text-white">
                <ExternalLink size={16} />
              </div>
            </div>
          </div>
        );
      case 'file':
        return (
          <a 
            href={msg.mediaUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-2 rounded-lg border ${
              isOwn ? 'bg-primary-700/50 border-primary-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
            }`}
          >
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-lg">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{msg.fileName}</p>
              <p className="text-[10px] opacity-70">{(msg.fileSize / 1024).toFixed(1)} KB</p>
            </div>
            <Download size={16} className="shrink-0" />
          </a>
        );
      case 'voice':
        return (
          <div className="flex items-center gap-3 min-w-[180px]">
            <button 
              onClick={toggleAudio}
              className={`p-2 rounded-full ${isOwn ? 'bg-white text-primary-600' : 'bg-primary-600 text-white'}`}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className="flex-1">
              <div className={`h-1 w-full rounded-full ${isOwn ? 'bg-primary-400' : 'bg-slate-300 dark:bg-slate-600'}`}>
                <div className={`h-full rounded-full ${isOwn ? 'bg-white' : 'bg-primary-600'}`} style={{ width: '0%' }} />
              </div>
              <div className="flex justify-between mt-1 text-[10px] opacity-70">
                <span>{formatTime(msg.duration || 0)}</span>
              </div>
            </div>
            <audio 
              ref={audioRef} 
              src={msg.mediaUrl} 
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </div>
        );
      default:
        return <p>{msg.message}</p>;
    }
  };

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-1 mb-1 px-1">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {isOwn ? 'You' : msg.senderName}
        </span>
        <span className="text-[10px] text-slate-400">
          • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div 
        className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
          isOwn 
            ? 'bg-primary-600 text-white rounded-tr-none' 
            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-none'
        }`}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default MessageBubble;
