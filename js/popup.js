document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchTabs');
    const domainTabsList = document.getElementById('domainTabsList');
    const closeDuplicatesBtn = document.getElementById('closeDuplicates');
    const suspendTabsBtn = document.getElementById('suspendHeavyTabs');
    const restoreSessionBtn = document.getElementById('restoreSession');

    let allTabs = []; // Store all tabs globally
    let suspendedTabs = []; // Store suspended tabs
    let autoSuspendTimeout = 60000 * 2; // 2 minutes timeout for auto-suspension

    // Get all open tabs and display them
    chrome.tabs.query({}, function (tabs) {
        allTabs = tabs; // Store all tabs in the global variable
        displayGroupedTabs(groupByWindowAndDomain(tabs));  // Group tabs by window and domain

        // Start auto-suspension timer for inactive tabs
        startAutoSuspension();

        // Filter tabs based on search input
        searchInput.addEventListener('input', function () {
            const searchText = searchInput.value.toLowerCase();
            console.log('Search Input:', searchText);

            if (!searchText) {
                displayGroupedTabs(groupByWindowAndDomain(allTabs)); // Reset the display
                return;
            }

            const filteredTabs = allTabs.filter(tab =>
                tab.title.toLowerCase().includes(searchText) ||
                tab.url.toLowerCase().includes(searchText)
            );

            displayGroupedTabs(groupByWindowAndDomain(filteredTabs));
        });
    });

    // Function to close duplicate tabs
    closeDuplicatesBtn.addEventListener('click', closeDuplicateTabs);

    // Function to suspend heavy tabs
    suspendTabsBtn.addEventListener('click', suspendHeavyTabs);

    // Function to restore session
    restoreSessionBtn.addEventListener('click', restoreSession);

    // Function to group tabs by window and domain
    function groupByWindowAndDomain(tabs) {
        const groups = {};
        tabs.forEach(tab => {
            const windowId = tab.windowId;
            const url = new URL(tab.url);
            const domain = url.hostname;

            // Initialize the window group if it doesn't exist
            if (!groups[windowId]) {
                groups[windowId] = {};
            }

            // Initialize the domain group within the window if it doesn't exist
            if (!groups[windowId][domain]) {
                groups[windowId][domain] = [];
            }

            // Add the tab to the domain group within the window
            groups[windowId][domain].push(tab);
        });

        return groups;
    }

    // Display the grouped tabs in the UI
    function displayGroupedTabs(groups) {
        domainTabsList.innerHTML = '';  // Clear previous list

        Object.keys(groups).forEach(windowId => {
            const windowGroup = document.createElement('div');
            windowGroup.innerHTML = `<h3>Window ID: ${windowId}</h3>`;
            windowGroup.classList.add('window-group');

            // Now group by domain within this window
            Object.keys(groups[windowId]).forEach(domain => {
                const domainGroup = document.createElement('div');
                domainGroup.innerHTML = `<strong>${domain}</strong>`;
                domainGroup.classList.add('domain-group');

                groups[windowId][domain].forEach(tab => {
                    const tabItem = document.createElement('li');
                    tabItem.className = 'tab-item';
                    tabItem.innerHTML = `
                        <span class="tab-title">${tab.title.length > 25 ? tab.title.substring(0, 25) + '...' : tab.title}</span>
                        <div class="tab-actions">
                            <button class="navigate-btn">Go</button>
                            <button class="close-btn">Close</button>
                        </div>
                    `;

                    // Navigate button now focuses the tab and its window
                    tabItem.querySelector('.navigate-btn').addEventListener('click', () => {
                        chrome.tabs.update(tab.id, { active: true }, () => {
                            chrome.windows.update(tab.windowId, { focused: true });
                        });
                    });

                    // Close button to remove the tab
                    tabItem.querySelector('.close-btn').addEventListener('click', () => {
                        chrome.tabs.remove(tab.id, () => {
                            tabItem.remove();  // Remove the tab from the list after closing it
                        });
                    });

                    domainGroup.appendChild(tabItem);
                });

                windowGroup.appendChild(domainGroup);
            });

            domainTabsList.appendChild(windowGroup);
        });
    }

    // Function to close duplicate tabs
    function closeDuplicateTabs() {
        chrome.tabs.query({}, function (tabs) {
            const seenUrls = new Set();
            tabs.forEach(tab => {
                if (seenUrls.has(tab.url)) {
                    chrome.tabs.remove(tab.id);
                } else {
                    seenUrls.add(tab.url);
                }
            });
            // Refresh the tabs after closing duplicates
            allTabs = tabs.filter(tab => !seenUrls.has(tab.url)); // Update allTabs with remaining tabs
            displayGroupedTabs(groupByWindowAndDomain(allTabs));
        });
    }

    // Auto-suspend inactive tabs using setInterval for periodic checks
    function startAutoSuspension() {
        setInterval(() => {
            chrome.tabs.query({}, function (tabs) {
                const now = Date.now();
                tabs.forEach(tab => {
                    if (!tab.active && now - tab.lastAccessed > autoSuspendTimeout) {
                        suspendTab(tab);
                    }
                });
            });
        }, autoSuspendTimeout);
    }

    // Suspend resource-heavy tabs
    function suspendHeavyTabs() {
        chrome.processes.getProcessInfo([], true, function (processes) {
            processes.forEach(process => {
                if (process.privateMemory > 200 * 1024 * 1024) {  // Memory threshold: 200MB
                    if (process.tabs) {
                        process.tabs.forEach(tabId => {
                            chrome.tabs.get(tabId, function (tab) {
                                suspendTab(tab);
                            });
                        });
                    }
                }
            });
        });
    }

    // Suspend a single tab
    function suspendTab(tab) {
        if (!tab.active) {  // Ensure the tab is not active
            chrome.tabs.discard(tab.id, function () {
                if (chrome.runtime.lastError) {
                    console.log(`Failed to discard tab ${tab.id}: ${chrome.runtime.lastError.message}`);
                } else {
                    console.log(`Tab ${tab.id} suspended`);
                    suspendedTabs.push(tab);
                    // Remove the suspended tab from the display
                    displayGroupedTabs(groupByWindowAndDomain(allTabs.filter(t => t.id !== tab.id)));
                }
            });
        } else {
            console.log(`Cannot suspend active tab ${tab.id}`);
        }
    }

    // Restore suspended tabs
    function restoreSession() {
        suspendedTabs.forEach(tab => {
            chrome.tabs.create({ url: tab.url });
        });
        suspendedTabs = [];  // Clear the suspendedTabs list after restoring
    }
});
