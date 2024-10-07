chrome.runtime.onInstalled.addListener(() => {
    console.log("Tab Manager Extension installed!");
  });
  
  const inactiveTimeLimit = 600000; // 10 minutes in milliseconds
  let lastActiveTabs = {};
  
  chrome.tabs.onActivated.addListener(activeInfo => {
    const { tabId, windowId } = activeInfo;
    lastActiveTabs[windowId] = tabId;
  });
  
  // Auto-suspend inactive tabs
  function autoSuspendTabs() {
    chrome.windows.getAll({ populate: true }, function(windows) {
      windows.forEach(window => {
        const now = Date.now();
        const lastActiveTime = lastActiveTabs[window.id] || now;
  
        window.tabs.forEach(tab => {
          // Suspend if inactive for more than 10 minutes
          if (now - lastActiveTime >= inactiveTimeLimit && !tab.audible) {
            chrome.tabs.discard(tab.id);
          }
        });
      });
    });
  }
  
  // Check every minute to suspend inactive tabs
  setInterval(autoSuspendTabs, 60000);
  