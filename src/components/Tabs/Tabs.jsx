import React from 'react';
import './Tabs.css';

function Tabs({ openedTabs, activeTab, onTabChange, onTabClose }) {
  if (openedTabs.length === 0) {
    return null;
  }

  return (
    <div className="tabs-container">
      {openedTabs.map(tab => {
        const fileName = tab.path.split(/[\\/]/).pop();
        const isActive = tab.path === activeTab;

        return (
          <div
            key={tab.path}
            className={`tab ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange(tab.path)}
          >
            {tab.isModified && <span className="modified-indicator">• </span>}
            <span className="tab-name">{fileName}</span>
            <button
              className="close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.path);
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Tabs;
