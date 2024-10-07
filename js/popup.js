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
  