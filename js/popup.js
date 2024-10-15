document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchTabs');
    const domainTabsList = document.getElementById('domainTabsList');
    const closeDuplicatesBtn = document.getElementById('closeDuplicates');
    const suspendTabsBtn = document.getElementById('suspendHeavyTabs');
    const restoreSessionBtn = document.getElementById('restoreSession');

    let allTabs = []; // Store all tabs globally
    let suspendedTabs = []; // Store suspended tabs
    let autoSuspendTimeout = 60000 * 5; // 5 minutes timeout for auto-suspension

    // Get all open tabs and display them
    chrome.tabs.query({}, function (tabs) {
        allTabs = tabs; // Store all tabs in the global variable
        displayGroupedTabs(groupByDomain(tabs));  // Group tabs by domain

        // Start auto-suspension timer for inactive tabs
        startAutoSuspension();

        // Filter tabs based on search input
        searchInput.addEventListener('input', function () {
            const searchText = searchInput.value.toLowerCase();
            console.log('Search Input:', searchText);

            if (!searchText) {
                displayGroupedTabs(groupByDomain(allTabs)); // Reset the display
                return;
            }

            const filteredTabs = allTabs.filter(tab =>
                tab.title.toLowerCase().includes(searchText) ||
                tab.url.toLowerCase().includes(searchText)
            );

            displayGroupedTabs(groupByDomain(filteredTabs));
        });
    });

    // Function to close duplicate tabs
    closeDuplicatesBtn.addEventListener('click', closeDuplicateTabs);

    // Function to suspend heavy tabs
    suspendTabsBtn.addEventListener('click', suspendHeavyTabs);

    // Function to restore session
    restoreSessionBtn.addEventListener('click', restoreSession);

    function displayGroupedTabs(groups) {
        domainTabsList.innerHTML = '';  // Clear previous list
        Object.keys(groups).forEach(domain => {
            const domainGroup = document.createElement('div');
            domainGroup.innerHTML = `<strong>${domain}</strong>`;
            domainGroup.classList.add('domain-group');

            groups[domain].forEach(tab => {
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

            domainTabsList.appendChild(domainGroup);
        });
    }

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
            displayGroupedTabs(groupByDomain(allTabs));
        });
    }

    function groupByDomain(tabs) {
        const groups = {};
        tabs.forEach(tab => {
            const url = new URL(tab.url);
            const domain = url.hostname;
            if (!groups[domain]) {
                groups[domain] = [];
            }
            groups[domain].push(tab);
        });
        return groups;
    }

    // Auto-suspend inactive tabs
    function startAutoSuspension() {
        setTimeout(() => {
            chrome.tabs.query({}, function (tabs) {
                const now = Date.now();
                tabs.forEach(tab => {
                    if (now - tab.lastAccessed > autoSuspendTimeout) {
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
                    process.tabs.forEach(tabId => {
                        chrome.tabs.get(tabId, function (tab) {
                            suspendTab(tab);
                        });
                    });
                }
            });
        });
    }

    // Suspend a single tab
    function suspendTab(tab) {
        chrome.tabs.discard(tab.id, () => {
            suspendedTabs.push(tab);
            displayGroupedTabs(groupByDomain(allTabs.filter(t => t.id !== tab.id))); // Remove the suspended tab from display
        });
    }

    // Restore suspended tabs
    function restoreSession() {
        suspendedTabs.forEach(tab => {
            chrome.tabs.create({ url: tab.url });
        });
        suspendedTabs = [];  // Clear the suspendedTabs list after restoring
    }
});
