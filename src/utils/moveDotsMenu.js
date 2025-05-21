// Script to move the three dots menu to the tab row
document.addEventListener('DOMContentLoaded', () => {
  // Function to move the dots menu
  const moveDotsMenu = () => {
    // Find the three dots menu button in the header
    const dotsMenu = document.querySelector('.header-actions .more-menu-button');
    
    // Find the tab row where we want to move it
    const tabRow = document.querySelector('.tab-menu-container');
    
    // If both elements exist, move the dots menu
    if (dotsMenu && tabRow) {
      // Create a container for the dots menu in the tab row
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'tab-row-dots-menu';
      dotsContainer.style.marginLeft = 'auto'; // Push to the right
      
      // Clone the dots menu and add it to the new container
      dotsContainer.appendChild(dotsMenu.cloneNode(true));
      
      // Add the container to the tab row
      tabRow.appendChild(dotsContainer);
      
      // Hide the original dots menu
      dotsMenu.style.display = 'none';
      
      console.log('Three dots menu moved successfully');
    } else {
      console.log('Could not find dots menu or tab row');
    }
  };
  
  // Run the function when the page loads
  moveDotsMenu();
  
  // Also run it when the route changes (for single page apps)
  window.addEventListener('popstate', moveDotsMenu);
});
