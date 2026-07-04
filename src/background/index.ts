/**
 * InternFill Background Service Worker
 * Handles extension lifecycle events, message routing, and context menus.
 */

// ── Extension Lifecycle ──
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[InternFill] Extension installed');

    // Create context menu
    chrome.contextMenus.create({
      id: 'internfill-autofill',
      title: 'Autofill with InternFill',
      contexts: ['page', 'editable'],
    });

    // Set default settings
    chrome.storage.local.set({
      'internfill-settings': JSON.stringify({
        autoDetect: true,
        showNotifications: true,
        theme: 'system',
      }),
    });
  }

  if (details.reason === 'update') {
    console.log('[InternFill] Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// ── Context Menu Handler ──
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'internfill-autofill' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'AUTOFILL_PAGE',
      profileId: 'default',
    });
  }
});

// ── Message Router ──
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((err) => {
      console.error('[InternFill] Message handler error:', err);
      sendResponse({ error: String(err) });
    });

  // Return true to indicate async response
  return true;
});

async function handleMessage(
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender
): Promise<unknown> {
  switch (message.type) {
    case 'DETECT_FIELDS':
      // Forward to content script of active tab
      return forwardToActiveTab(message);

    case 'FIELDS_DETECTED':
      // Content script detected fields — store or forward to popup
      return { received: true };

    case 'AUTOFILL_PAGE':
      // Forward autofill command to content script
      return forwardToActiveTab(message);

    default:
      return { error: 'Unknown message type' };
  }
}

async function forwardToActiveTab(message: ExtensionMessage): Promise<unknown> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    return chrome.tabs.sendMessage(tab.id, message);
  }
  return { error: 'No active tab found' };
}

// ── Keep service worker alive during operations ──
// (Manifest V3 service workers can be terminated after 30s of inactivity)
export {};
