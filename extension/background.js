chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
    if (request.action === "analyzeColor") {
      
      setTimeout(() => {
        const mockResult = Math.random() > 0.5; 
        sendResponse({ 
          isMatch: mockResult, 
          message: mockResult ? "Perfect Match for Winter Profile!" : "Might wash out your skin tone."
        });
      }, 1000);
  
      return true; 
    }
  });