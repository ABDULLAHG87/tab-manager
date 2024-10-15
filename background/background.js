chrome.runtime.onInstalled.addListener(function () {
    console.log("Tab Manager Extension installed!");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'navigate-to-tab') {
        chrome.tabs.update(request.tabId, { active: true }, (tab) => {
            chrome.windows.update(tab.windowId, { focused: true });
        });
    }
});

const inactiveTimeLimit = 600000; // 10 minutes (in milliseconds)
let lastActiveTabs = {};
let suspendedTabs = [];

// Track the active tab for each window
chrome.tabs.onActivated.addListener(activeInfo => {
    const windowId = activeInfo.windowId;
    lastActiveTabs[windowId] = Date.now();
});

// Suspend inactive tabs automatically
function autoSuspendTabs() {
    chrome.windows.getAll({ populate: true }, function (windows) {
        windows.forEach(window => {
            window.tabs.forEach(tab => {
                const now = Date.now();
                const lastActiveTime = lastActiveTabs[window.id] || now;

                // If the tab has been inactive for more than 10 minutes and is not playing media
                if (now - lastActiveTime >= inactiveTimeLimit && !tab.audible) {
                    suspendTab(tab);
                }
            });
        });
    });
}

// Helper to suspend tabs and save session data
function suspendTab(tab) {
    chrome.tabs.discard(tab.id, () => {
        console.log(`Tab ${tab.id} suspended!`);
        
        // Save suspended tab information for session restore
        suspendedTabs.push({
            id: tab.id,
            url: tab.url,
            title: tab.title,
            windowId: tab.windowId
        });

        chrome.storage.local.set({ suspendedTabs });
    });
}

// Check every minute to suspend inactive tabs
setInterval(autoSuspendTabs, 60000);

// Function to detect and suspend heavy tabs
function checkAndSuspendHeavyTabs() {
    chrome.processes.getProcessInfo([], true, (processes) => {
        processes.forEach(process => {
            if (process.privateMemory > 200 * 1024 * 1024) { // Threshold: 200 MB
                const tabId = process.tabs ? process.tabs[0] : null;
                if (tabId) {
                    chrome.tabs.get(tabId, (tab) => {
                        console.log(`Heavy tab detected: ${tab.title} using ${process.privateMemory / 1024 / 1024} MB`);
                        suspendTab(tab);
                    });
                }
            }
        });
    });
}

// Check every 5 minutes for heavy tabs
setInterval(checkAndSuspendHeavyTabs, 300000); // Every 5 minutes

// Session Restore
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'restore-session') {
        chrome.storage.local.get(['suspendedTabs'], (result) => {
            if (result.suspendedTabs) {
                result.suspendedTabs.forEach(tabData => {
                    chrome.tabs.create({ url: tabData.url, windowId: tabData.windowId }, (newTab) => {
                        console.log(`Restored tab: ${tabData.title}`);
                    });
                });

                // Clear suspended tabs after restore
                suspendedTabs = [];
                chrome.storage.local.set({ suspendedTabs });
            }
        });
    }
});
