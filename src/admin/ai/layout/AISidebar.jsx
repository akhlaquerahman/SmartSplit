import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, BookOpen, HelpCircle, Hand, Settings2, ShieldAlert, GitPullRequest, Workflow, Bot, BrainCircuit, Activity, LineChart, FileText, UserCog, History, Key } from 'lucide-react';

const navGroups = [
  {
    title: 'Core',
    items: [
      { name: 'Dashboard', path: '/admin/ai-studio', icon: LayoutDashboard },
      { name: 'Conversations', path: '/admin/ai-studio/conversations', icon: MessageSquare },
      { name: 'Human Handoff', path: '/admin/ai-studio/handoff', icon: UserCog },
    ]
  },
  {
    title: 'Knowledge Engine',
    items: [
      { name: 'Knowledge Base', path: '/admin/ai-studio/knowledge', icon: BookOpen },
      { name: 'Training Jobs', path: '/admin/ai-studio/training', icon: Activity },
    ]
  },
  {
    title: 'Deterministic Rules',
    items: [
      { name: 'FAQ Manager', path: '/admin/ai-studio/faq', icon: HelpCircle },
      { name: 'Greetings', path: '/admin/ai-studio/greetings', icon: Hand },
      { name: 'Aliases', path: '/admin/ai-studio/aliases', icon: GitPullRequest },
      { name: 'Regex Rules', path: '/admin/ai-studio/regex', icon: FileText },
      { name: 'Fallback', path: '/admin/ai-studio/fallback', icon: ShieldAlert },
      { name: 'Intent Manager', path: '/admin/ai-studio/intents', icon: Workflow },
    ]
  },
  {
    title: 'LLM & Tools',
    items: [
      { name: 'Prompt Templates', path: '/admin/ai-studio/prompts', icon: History },
      { name: 'Tool Manager', path: '/admin/ai-studio/tools', icon: Settings2 },
      { name: 'Model Settings', path: '/admin/ai-studio/models', icon: BrainCircuit },
    ]
  },
  {
    title: 'Monitoring',
    items: [
      { name: 'Analytics', path: '/admin/ai-studio/analytics', icon: LineChart },
      { name: 'Logs', path: '/admin/ai-studio/logs', icon: Key },
      { name: 'Feedback', path: '/admin/ai-studio/feedback', icon: Bot },
    ]
  }
];

const AISidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <BrainCircuit className="w-6 h-6" /> AI Studio
        </h2>
      </div>
      <nav className="p-4 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/admin/ai-studio'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default AISidebar;