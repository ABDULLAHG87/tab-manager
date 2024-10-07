// No need to import, as we are using the browser version of compromise from the popup.html

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchTabs');
    const tabsList = document.getElementById('tabsList');
    const closeDuplicatesBtn = document.getElementById('closeDuplicates');

    // Get all open tabs and display them
    chrome.tabs.query({}, function(tabs) {
        displayTabs(tabs);  // Initial display of all tabs

        let groupedTabs = groupByDomain(tabs);  // Group tabs by domain
        displayGroupedTabs(groupedTabs);  // Display grouped tabs by domain

        // Thematic Grouping Example
        let thematicGroups = groupByTheme(tabs);  // Group tabs based on themes using NLP
        displayThematicGroups(thematicGroups);  // Display tabs grouped thematically

        // Filter tabs based on search input
        searchInput.addEventListener('input', function() {
            const searchText = searchInput.value.toLowerCase();
            const filteredTabs = tabs.filter(tab => 
                tab.title.toLowerCase().includes(searchText) || 
                tab.url.toLowerCase().includes(searchText)
            );
            displayTabs(filteredTabs);  // Display filtered tabs based on search
        });
    });

    // Function to close duplicate tabs
    closeDuplicatesBtn.addEventListener('click', closeDuplicateTabs);

    // Function to display all tabs
    function displayTabs(tabs) {
        tabsList.innerHTML = '';  // Clear previous list
        tabs.forEach(tab => {
            const li = document.createElement('li');
            li.className = 'tab-item';
            li.innerHTML = `
                <span class="tab-title">${tab.title.length > 25 ? tab.title.substring(0, 25) + '...' : tab.title}</span>
                <div class="tab-actions">
                    <button class="navigate-btn">Go</button>
                    <button class="close-btn">Close</button>
                </div>
            `;

            // Navigate to the tab
            li.querySelector('.navigate-btn').addEventListener('click', () => {
                chrome.tabs.update(tab.id, {active: true});
            });

            // Close the tab
            li.querySelector('.close-btn').addEventListener('click', () => {
                chrome.tabs.remove(tab.id, () => {
                    li.remove();  // Remove from UI once closed
                });
            });

            tabsList.appendChild(li);  // Add tab to the list
        });
    }

    // Function to close duplicate tabs
    function closeDuplicateTabs() {
        chrome.tabs.query({}, function(tabs) {
            const seenUrls = new Set();
            tabs.forEach(tab => {
                if (seenUrls.has(tab.url)) {
                    chrome.tabs.remove(tab.id);  // Close duplicate tab
                } else {
                    seenUrls.add(tab.url);  // Mark URL as seen
                }
            });
        });
    }

    // Function to group tabs by domain
    function groupByDomain(tabs) {
        let groups = {};
        tabs.forEach(tab => {
            let url = new URL(tab.url);
            let domain = url.hostname;
            if (!groups[domain]) {
                groups[domain] = [];
            }
            groups[domain].push(tab);
        });
        return groups;
    }

    // Function to display tabs grouped by domain
    function displayGroupedTabs(groups) {
        tabsList.innerHTML = '';  // Clear current list

        Object.keys(groups).forEach(domain => {
            const domainGroup = document.createElement('div');
            domainGroup.innerHTML = `<strong>${domain}</strong>`;
            domainGroup.classList.add('domain-group');

            groups[domain].forEach(tab => {
                const tabItem = document.createElement('li');
                tabItem.className = 'tab-item';
                tabItem.innerHTML = `
                    <span>${tab.title}</span>
                    <button data-tab-id="${tab.id}">Close</button>
                `;
                tabItem.querySelector('button').addEventListener('click', () => closeTab(tab.id));
                domainGroup.appendChild(tabItem);
            });

            tabsList.appendChild(domainGroup);
        });
    }

    // Function to group tabs by theme using NLP (Compromise)
    function groupByTheme(tabs) {
        let researchTabs = [];
        let socialMediaTabs = [];
        let workTabs = [];

        tabs.forEach(tab => {
            let doc = nlp(tab.title);  // NLP analysis of the tab's title
            console.log(doc);  // For debugging purposes, checking NLP output
            if (doc.has('research')) {
                researchTabs.push(tab);
            } else if (doc.has('social media')) {
                socialMediaTabs.push(tab);
            } else {
                workTabs.push(tab);  // Default to work-related if no specific match
            }
        });

        return { researchTabs, socialMediaTabs, workTabs };
    }

    // Function to display tabs grouped thematically
    function displayThematicGroups(themes) {
        tabsList.innerHTML = '';  // Clear the current list

        Object.keys(themes).forEach(theme => {
            const themeGroup = document.createElement('div');
            themeGroup.innerHTML = `<strong>${theme}</strong>`;
            themeGroup.classList.add('theme-group');

            themes[theme].forEach(tab => {
                const tabItem = document.createElement('li');
                tabItem.className = 'tab-item';
                tabItem.innerHTML = `
                    <span>${tab.title}</span>
                    <button data-tab-id="${tab.id}">Close</button>
                `;
                tabItem.querySelector('button').addEventListener('click', () => closeTab(tab.id));
                themeGroup.appendChild(tabItem);
            });

            tabsList.appendChild(themeGroup);
        });
    }

    // Function to close a specific tab
    function closeTab(tabId) {
        chrome.tabs.remove(tabId);
    }
});
