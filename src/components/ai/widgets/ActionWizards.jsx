import React from 'react';
import CreateGroupWizard from './CreateGroupWizard';
import AddExpenseWizard from './AddExpenseWizard';
import SettlementWizard from './SettlementWizard';
import ReportPreviewCard from './ReportPreviewCard';
import RecentExpensesWidget from './RecentExpensesWidget';
import NetBalanceCard from './NetBalanceCard';
import FeatureCatalog from './FeatureCatalog';

const ActionWizards = ({ actionTrigger }) => {
  console.log("ActionWizards received:", actionTrigger);
  const normalizedTrigger = actionTrigger?.trim();
  switch (normalizedTrigger) {
    case 'ACTION_CREATE_GROUP':
      return <CreateGroupWizard />;
    case 'ACTION_ADD_EXPENSE':
      return <AddExpenseWizard />;
    case 'ACTION_SETTLEMENT':
      return <SettlementWizard />;
    case 'ACTION_REPORTS':
      return <ReportPreviewCard />;
    case 'ACTION_RECENT_EXPENSES':
      return <RecentExpensesWidget />;
    case 'ACTION_NET_BALANCE':
      return <NetBalanceCard />;
    case 'ACTION_WHAT_CAN_YOU_DO':
      return <FeatureCatalog />;
    default:
      return <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">Unknown Action: {actionTrigger}</div>;
  }
};

export default ActionWizards;
