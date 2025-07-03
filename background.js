let activeTabId = null;
let activeDomain = null;
let startTime = null;

const timeSpent = {}; // domain: seconds

function getDomain(url) {
  try {
    // Lowercase the hostname and remove 'www.'
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

function startTracking(tabId, url) {
  if (activeTabId !== null) stopTracking();

  activeTabId = tabId;
  activeDomain = getDomain(url);
  startTime = Date.now();
}

function stopTracking() {
  if (!activeDomain || !startTime) return;

  const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

  if (!timeSpent[activeDomain]) timeSpent[activeDomain] = 0;
  timeSpent[activeDomain] += elapsedSeconds;

  activeTabId = null;
  activeDomain = null;
  startTime = null;
}

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url && !tab.url.startsWith('chrome://')) {
    startTracking(tab.id, tab.url);
  }
});

// Track URL changes in active tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    startTracking(tabId, changeInfo.url);
  }
});

// Stop tracking when window loses focus
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    stopTracking();
  }
});

// Send timeSpent to popup on request
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTimeSpent') {
    sendResponse(timeSpent);
  }
});
