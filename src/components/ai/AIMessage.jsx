import React from 'react';
import { Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import ActionCard from './widgets/ActionCard';
import ChartWidget from './widgets/ChartWidget';
import ActionWizards from './widgets/ActionWizards';

const AIMessage = ({ content, metadata }) => {
  
  const renderContent = () => {
    // Render rich Action Widgets natively inside the chat feed
    if (metadata && metadata.isWidget && metadata.actionTrigger) {
      return (
        <div className="mt-2 w-full max-w-sm">
          <ActionWizards actionTrigger={metadata.actionTrigger} />
        </div>
      );
    }

    // Legacy fallback parsing
    if (content.includes('{"type": "ActionCard"')) {
      return (
        <>
          <p>Here is your requested action:</p>
          <ActionCard title="Pending Settlement" description="You owe Alice ₹450" actionText="Pay Now" actionType="pay" />
        </>
      );
    }
    
    if (content.includes('{"type": "ChartWidget"')) {
      return (
        <>
          <p>Here is the analysis of your monthly spending:</p>
          <ChartWidget type="bar" title="Monthly Expenses (June)" data={[1,2,3]} />
        </>
      );
    }

    return <p>{content || <span className="animate-pulse">...</span>}</p>;
  };

  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-sm">
        <Bot className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-2">
        <div className="prose prose-sm prose-blue max-w-none text-gray-800 leading-relaxed">
          {renderContent()}
        </div>
        
        {content && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 mt-2">
            <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded text-xs"><Copy className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded text-xs"><ThumbsUp className="w-4 h-4" /></button>
            <button className="p-1.5 text-gray-400 hover:bg-gray-100 rounded text-xs"><ThumbsDown className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AIMessage;