chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Function to discard inactive tabs after 30 minutes of inactivity
chrome.alarms.create('discardInactiveTabs', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'discardInactiveTabs') {
    try {
      const tabs = await chrome.tabs.query({});
      const now = Date.now();

      for (const tab of tabs) {
        if (!tab.active && tab.lastAccessed && (now - tab.lastAccessed) > 30 * 60 * 1000) {
          await chrome.tabs.discard(tab.id);
          console.log(`Tab with ID ${tab.id} discarded due to inactivity.`);
        }
      }
    } catch (error) {
      console.error('Error discarding inactive tabs:', error);
    }
  }
});
