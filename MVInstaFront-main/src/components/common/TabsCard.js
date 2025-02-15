import React from 'react';
import { Tabs } from 'antd';

// const { TabPane } = Tabs;

function TabsCard({ tabLabelIcons, activeKey, handleTabKey, tabBarExtraContent }) {


  const allItems = tabLabelIcons.map((item) => ({
    key: item.id,
    label: (
      <span>
        {item.icon} {item.name}
      </span>
    ),
    children: item.component
  }));

  return (
    <Tabs
      defaultActiveKey='1'
      activeKey={activeKey}
      items={allItems}
      onChange={(key) => handleTabKey(key)}
      type='card'
      // size="large" // Size of tabs (small, default, large)
      tabBarGutter={9} // Space between tabs
      tabBarStyle={{
        fontFamily: 'Montserrat, sans-serif',
        // fontWeight: 'bold',
        // backgroundColor: '#f0f0f0', // Tab bar background color
      }}
      tabBarExtraContent={tabBarExtraContent}
      centered // Center the tabs
    // animated={{ tabPane: true }} // Animation for tabPane
    // hideAdd // Hide add tab button for editable card type
    // destroyInactiveTabPane // Destroy inactive tab panes to save memory
    // renderTabBar={(props, DefaultTabBar) => (
    //   <DefaultTabBar {...props} style={{ background: '#f0f0f0' }} />
    // )} // Custom rendering of tab bar
    >
      {/* <TabPane tab="Tab 1" key="1" >
        Tab1
      </TabPane>
      <TabPane tab="Tab 2" key="2">
        Content of Tab 2
      </TabPane>
      <TabPane tab="Tab 3" key="3">
        Content of Tab 3
      </TabPane> */}
    </Tabs>
  )
}

export default TabsCard;