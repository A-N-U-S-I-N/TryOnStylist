let activeBadge = null;

document.addEventListener('mouseover', (e) => {
  if (e.target.tagName === 'IMG' && e.target.width > 150) {
    const hoveredImage = e.target;
    
    chrome.runtime.sendMessage({ 
      action: "analyzeColor", 
      imageUrl: hoveredImage.src 
    }, (response) => {
      if (response) {
        showBadge(hoveredImage, response.isMatch, response.message);
      }
    });
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target.tagName === 'IMG' && activeBadge) {
    activeBadge.remove();
    activeBadge = null;
  }
});

function showBadge(imageElement, isMatch, text) {
  if (activeBadge) activeBadge.remove();

  activeBadge = document.createElement('div');
  activeBadge.innerText = isMatch ? `🌟 ${text}` : `⚠️ ${text}`;
  
  Object.assign(activeBadge.style, {
    position: 'absolute',
    backgroundColor: isMatch ? '#10b981' : '#f59e0b', 
    color: '#ffffff',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    zIndex: '999999',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    pointerEvents: 'none', 
    transition: 'all 0.3s ease'
  });

  const rect = imageElement.getBoundingClientRect();
  activeBadge.style.top = `${window.scrollY + rect.top + 10}px`;
  activeBadge.style.left = `${window.scrollX + rect.left + 10}px`;

  document.body.appendChild(activeBadge);
}