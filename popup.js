const productiveSites = ['github.com', 'stackoverflow.com'];
const unproductiveSites = ['facebook.com', 'instagram.com'];

function classifySite(domain) {
  domain = domain.toLowerCase();

  if (productiveSites.some(site => domain.endsWith(site))) return 'productive';
  if (unproductiveSites.some(site => domain.endsWith(site))) return 'unproductive';
  return 'neutral';
}

function secondsToHMS(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

chrome.runtime.sendMessage({ action: 'getTimeSpent' }, (timeSpent) => {
  const list = document.getElementById('time-list');
  list.innerHTML = '';

  if (!timeSpent || Object.keys(timeSpent).length === 0) {
    list.textContent = 'No data tracked yet.';
    return;
  }

  for (const domain in timeSpent) {
    const li = document.createElement('li');
    const classification = classifySite(domain);
    li.textContent = `${domain}: ${secondsToHMS(timeSpent[domain])}`;
    li.className = classification;
    list.appendChild(li);
  }
});
