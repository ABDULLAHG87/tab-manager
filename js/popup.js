document.addEventListener('DOMContentLoaded', function() {
    // Query all open tabs
    chrome.tabs.query({}, function(tabs) {
      let tabList = document.getElementById('tab-list');
      
      // Loop through each tab
      tabs.forEach(function(tab) {
        let tabItem = document.createElement('div');
        tabItem.classList.add('tab-item');
        
        // Tab title
        let tabTitle = document.createElement('div');
        tabTitle.classList.add('tab-title');
        tabTitle.textContent = tab.title.length > 25 ? tab.title.substring(0, 25) + "..." : tab.title; // Shorten long titles
        
        // Action buttons
        let tabActions = document.createElement('div');
        tabActions.classList.add('tab-actions');
        
        // Navigate Button
        let navigateBtn = document.createElement('button');
        navigateBtn.classList.add('navigate-btn');
        navigateBtn.textContent = 'Go';
        navigateBtn.addEventListener('click', function() {
          chrome.tabs.update(tab.id, { active: true }); // Switch to the tab
        });
        
        // Close Button
        let closeBtn = document.createElement('button');
        closeBtn.classList.add('close-btn');
        closeBtn.textContent = 'Close';
        closeBtn.addEventListener('click', function() {
          chrome.tabs.remove(tab.id); // Close the tab
          tabItem.remove(); // Remove the tab element from the DOM
        });
        
        // Append buttons and tab title to the tab item
        tabActions.appendChild(navigateBtn);
        tabActions.appendChild(closeBtn);
        tabItem.appendChild(tabTitle);
        tabItem.appendChild(tabActions);
        tabList.appendChild(tabItem);
      });

    });
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchTabs');
    const tabsList = document.getElementById('tabsList');

    // Get all open tabs
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

    // Function to display tabs
    function displayTabs(tabs) {
        tabsList.innerHTML = '';
        tabs.forEach(tab => {
            const li = document.createElement('li');
            li.className = 'tab-item';
            li.innerHTML = `
                <span>${tab.title}</span>
                <button data-tab-id="${tab.id}">Close</button>
            `;
            li.querySelector('button').addEventListener('click', () => closeTab(tab.id));
            tabsList.appendChild(li);
        });
    }

    // Function to close tab
    function closeTab(tabId) {
        chrome.tabs.remove(tabId);
    }
});