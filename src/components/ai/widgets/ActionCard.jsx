import React from 'react';
import { ArrowRight, FileText, CreditCard } from 'lucide-react';

const ActionCard = ({ title, description, actionText, actionType }) => {
  const getIcon = () => {
    switch(actionType) {
      case 'pay': return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'view': return <FileText className="w-5 h-5 text-blue-500" />;
      default: return <ArrowRight className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm my-3 flex items-center justify-between hover:border-blue-300 transition-colors cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-gray-50 rounded-lg">
          {getIcon()}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <button className="px-4 py-2 bg-blue-50 text-blue-700 font-medium text-sm rounded-lg hover:bg-blue-100 transition-colors">
        {actionText}
      </button>
    </div>
  );
};
export default ActionCard;