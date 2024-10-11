document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchTabs');
    const domainTabsList = document.getElementById('domainTabsList');
    const closeDuplicatesBtn = document.getElementById('closeDuplicates');

    let allTabs = []; // Store all tabs globally

    // Get all open tabs and display them
    chrome.tabs.query({}, function (tabs) {
        allTabs = tabs; // Store all tabs in the global variable
        displayGroupedTabs(groupByDomain(tabs));  // Group tabs by domain

        // Filter tabs based on search input
        searchInput.addEventListener('input', function () {
            const searchText = searchInput.value.toLowerCase();
            console.log('Search Input:', searchText); // Log the current input

            // Early return if the search input is empty
            if (!searchText) {
                displayGroupedTabs(groupByDomain(allTabs)); // Use allTabs to reset the display
                return;
            }

            const filteredTabs = allTabs.filter(tab =>
                tab.title.toLowerCase().includes(searchText) ||
                tab.url.toLowerCase().includes(searchText)
            );

            console.log('Filtered Tabs:', filteredTabs); // Log the filtered tabs

            // Update the displayed tabs
            displayGroupedTabs(groupByDomain(filteredTabs));
        });
    });

    // Function to close duplicate tabs
    closeDuplicatesBtn.addEventListener('click', closeDuplicateTabs);

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
});
