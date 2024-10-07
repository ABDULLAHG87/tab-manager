chrome.runtime.onInstalled.addListener(function() {
    console.log("Tab Manager Extension installed!");
  });
  
  const inactiveTimeLimit = 600000; // 10 minutes (in milliseconds)
let lastActiveTabs = {};

chrome.tabs.onActivated.addListener(activeInfo => {
    const tabId = activeInfo.tabId;
    const windowId = activeInfo.windowId;
    lastActiveTabs[windowId] = tabId;
});

// Function to suspend inactive tabs
function autoSuspendTabs() {
    chrome.windows.getAll({populate: true}, function(windows) {
        windows.forEach(window => {
            window.tabs.forEach(tab => {
                const now = new Date().getTime();
                const lastActiveTime = lastActiveTabs[window.id] || now;

                // If tab has been inactive for more than 10 minutes
                if (now - lastActiveTime >= inactiveTimeLimit && !tab.audible) {
                    chrome.tabs.discard(tab.id);
                }
            });
        });
    });
}

// Check every minute to suspend inactive tabs
setInterval(autoSuspendTabs, 60000);
