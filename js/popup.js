document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchTabs');
    const tabsList = document.getElementById('tabsList');

    // Get all open tabs and display them
    chrome.tabs.query({}, function(tabs) {
        displayTabs(tabs);

        // Filter tabs based on search input
        searchInput.addEventListener('input', function() {
            const searchText = searchInput.value.toLowerCase();
            const filteredTabs = tabs.filter(tab => 
                tab.title.toLowerCase().includes(searchText) || 
                tab.url.toLowerCase().includes(searchText)
            );
            displayTabs(filteredTabs);
        });
    });

    // Function to display tabs in the list
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
                    li.remove(); // Remove from UI
                });
            });

            tabsList.appendChild(li);
        });
    }

    // Close Duplicate Tabs
    document.getElementById('closeDuplicates').addEventListener('click', closeDuplicateTabs);

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
});
