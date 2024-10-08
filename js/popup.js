document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('searchTabs');
    const tabsList = document.getElementById('tabsList');
    const closeDuplicatesBtn = document.getElementById('closeDuplicates');

    // Function to get all open tabs and display them
    function getTabs() {
        chrome.tabs.query({}, function (tabs) {
            displayTabs(tabs);  // Initial display of all tabs

            // Close duplicates
            closeDuplicatesBtn.addEventListener('click', () => closeDuplicateTabs(tabs));

            // Filter tabs based on search input
            searchInput.addEventListener('input', () => {
                const searchText = searchInput.value.toLowerCase();
                const filteredTabs = tabs.filter(tab =>
                    tab.title.toLowerCase().includes(searchText) ||
                    tab.url.toLowerCase().includes(searchText)
                );
                displayTabs(filteredTabs);
            });
        });
    }

    // Function to display tabs
    function displayTabs(tabs) {
        tabsList.innerHTML = '';  // Clear previous list
        tabs.forEach(tab => {
            const li = document.createElement('li');
            li.className = 'tab-item';
            li.innerHTML = `
                <span>${tab.title.length > 25 ? tab.title.substring(0, 25) + '...' : tab.title}</span>
                <div>
                    <button class="navigate-btn">Go</button>
                    <button class="close-btn">Close</button>
                </div>
            `;

            // Navigate button focuses the tab
            li.querySelector('.navigate-btn').addEventListener('click', () => {
                chrome.tabs.update(tab.id, { active: true });
            });

            // Close button removes the tab
            li.querySelector('.close-btn').addEventListener('click', () => {
                chrome.tabs.remove(tab.id);
                li.remove();  // Remove the tab from the list after closing it
            });

            tabsList.appendChild(li);
        });
    }

    // Function to close duplicate tabs
    function closeDuplicateTabs(tabs) {
        const seenUrls = new Set();
        tabs.forEach(tab => {
            if (seenUrls.has(tab.url)) {
                chrome.tabs.remove(tab.id);
            } else {
                seenUrls.add(tab.url);
            }
        });
        // Refresh the tab list after closing duplicates
        getTabs();
    }

    // Initialize tabs on load
    getTabs();
});
