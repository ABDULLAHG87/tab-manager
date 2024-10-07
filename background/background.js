chrome.runtime.onInstalled.addListener(function() {
    console.log("Tab Manager Extension installed!");
});

const inactiveTimeLimit = 600000;  // 10 minutes (in milliseconds)
let lastActiveTabs = {};

// Track the active tab for each window
chrome.tabs.onActivated.addListener(activeInfo => {
    const tabId = activeInfo.tabId;
    const windowId = activeInfo.windowId;
    lastActiveTabs[windowId] = Date.now();  // Track last active time for the tab
});

// Function to suspend inactive tabs
function autoSuspendTabs() {
    chrome.windows.getAll({populate: true}, function(windows) {
        windows.forEach(window => {
            window.tabs.forEach(tab => {
                const now = Date.now();
                const lastActiveTime = lastActiveTabs[window.id] || now;

                // If the tab has been inactive for more than 10 minutes and is not playing media
                if (now - lastActiveTime >= inactiveTimeLimit && !tab.audible) {
                    chrome.tabs.discard(tab.id);
                }
            });
        });
    });
}

// Check every minute to suspend inactive tabs
setInterval(autoSuspendTabs, 60000);
