document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchTabs');
    const tabsList = document.getElementById('tabsList');
    const closeDuplicatesBtn = document.getElementById('closeDuplicates');
  
    // Load and display tabs
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
  
    // Display tabs in the list
    function displayTabs(tabs) {
      tabsList.innerHTML = ''; // Clear previous list
      tabs.forEach(tab => {
        const li = document.createElement('li');
        li.className = 'tab-item';
        li.innerHTML = `
          <span class="tab-title">${tab.title.length > 25 ? tab.title.substring(0, 25) + '...' : tab.title}</span>
          <div class="tab-actions">
            <button class="navigate-btn" data-tab-id="${tab.id}">Go</button>
            <button class="close-btn" data-tab-id="${tab.id}">Close</button>
          </div>
        `;
        
        // Event listener for navigating to the tab
        li.querySelector('.navigate-btn').addEventListener('click', () => {
          chrome.tabs.update(tab.id, { active: true });
        });
  
        // Event listener for closing the tab
        li.querySelector('.close-btn').addEventListener('click', () => {
          chrome.tabs.remove(tab.id);
          li.remove(); // Remove tab from list
        });
  
        tabsList.appendChild(li);
      });
    }
  
    // Close duplicate tabs
    closeDuplicatesBtn.addEventListener('click', function() {
      chrome.tabs.query({}, function(tabs) {
        const seenUrls = new Set();
        tabs.forEach(tab => {
          if (seenUrls.has(tab.url)) {
            chrome.tabs.remove(tab.id); // Close duplicate
          } else {
            seenUrls.add(tab.url); // Mark URL as seen
          }
        });
      });
    });
  });
  