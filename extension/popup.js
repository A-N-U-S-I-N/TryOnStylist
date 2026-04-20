document.getElementById('send-btn').addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    const myLiveWebsiteUrl = "https://tryonstylist.vercel.app/web-tryon";
  
    const encodedProductUrl = encodeURIComponent(tab.url);
  
    const finalUrl = `${myLiveWebsiteUrl}?url=${encodedProductUrl}`;
    
    chrome.tabs.create({ url: finalUrl });
  });