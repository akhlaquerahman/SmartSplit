import React from 'react';
import { Code } from 'lucide-react';

const PromptInspector = () => {
  const mockSystemPrompt = `You are SmartSplit AI...
Context:
- User owes Alice $40
- Upcoming trip to Bali`;

  return (
    <div className="border border-slate-700 rounded bg-slate-950 p-4">
      <h3 className="text-xs font-mono font-bold text-slate-400 mb-4 flex items-center gap-2 uppercase">
        <Code className="w-4 h-4" /> Final Constructed Prompt
      </h3>
      <pre className="bg-slate-900 p-3 rounded text-xs font-mono text-green-300 overflow-x-auto whitespace-pre-wrap leading-relaxed border border-slate-800">
        {mockSystemPrompt}
      </pre>
      <div className="mt-4 flex gap-4 text-xs font-mono text-slate-500">
        <span>Prompt Tokens: <span className="text-blue-400">142</span></span>
        <span>Completion Tokens: <span className="text-blue-400">89</span></span>
        <span>Temp: <span className="text-blue-400">0.2</span></span>
      </div>
    </div>
  );
};
export default PromptInspector;