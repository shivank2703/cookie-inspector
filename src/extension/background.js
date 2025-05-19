// background.js

// Fired when the extension is first installed or updated
chrome.runtime.onInstalled.addListener((details) => {
    console.log("Privacy Cookie Inspector installed or updated:", details);
    // You could initialize default settings here, if needed
  });
  
  // (Optional) Listen for cookie changes and cache them
  chrome.cookies.onChanged.addListener((changeInfo) => {
    console.log("Cookie changed:", changeInfo);
    // You might store or react to these events later
  });