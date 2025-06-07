import React, { useState } from 'react';
import RecommendedScholarships from './recommended';
import ScholarshipList from './alldetails';

const TwoTabs = () => {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', borderBottom: '2px solid #ccc' }}>
        <button
          onClick={() => setActiveTab('tab1')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'tab1' ? '3px solid #3b82f6' : 'none',
            fontWeight: activeTab === 'tab1' ? 'bold' : 'normal',
            cursor: 'pointer',
            color: activeTab === 'tab1' ? '#3b82f6' : '#4b5563'
          }}
        >
          ALL SCHOLARSHIPS
        </button>
        <button
          onClick={() => setActiveTab('tab2')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderBottom: activeTab === 'tab2' ? '3px solid #3b82f6' : 'none',
            backgroundColor: 'transparent',
            fontWeight: activeTab === 'tab2' ? 'bold' : 'normal',
            cursor: 'pointer',
            color: activeTab === 'tab2' ? '#3b82f6' : '#4b5563'
          }}
        >
          RECOMMENDED
        </button>
      </div>

      <div style={{ padding: '20px', border: '1px solid #ccc' }}>
        {activeTab === 'tab1' && (
          <ScholarshipList />
        )}
        {activeTab === 'tab2' && (
          <RecommendedScholarships />
        )}
      </div>
    </div>
  );
};

export default TwoTabs;