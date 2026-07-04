import { useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import './Tabs.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, defaultTab, onChange, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(
    defaultTab || tabs[0]?.id || ''
  );

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={`tabs ${className}`}>
      <div className="tabs-list" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            className={`tabs-trigger ${activeTab === tab.id ? 'active' : ''}`}
            disabled={tab.disabled}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.icon && <span className="tabs-icon">{tab.icon}</span>}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                className="tabs-indicator"
                layoutId="tab-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>
      <div
        className="tabs-content"
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
      >
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeContent}
        </motion.div>
      </div>
    </div>
  );
}
