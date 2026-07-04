/**
 * InternFill Background Service Worker
 * Handles extension lifecycle events, message routing, and context menus.
 */

import { db } from '@/shared/db';
import { decryptProfile } from '@/features/profile/store';
import { getAIService } from '@/features/ai/services/groq';

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

    case 'GET_PROFILE_DATA': {
      const id = message.profileId && message.profileId !== 'default' ? Number(message.profileId) : null;
      let record;
      if (id) {
        record = await db.profiles.get(id);
      } else {
        const records = await db.profiles.toArray();
        record = records.find((p) => p.isActive) || records[0];
      }
      if (!record) return null;
      return decryptProfile(record);
    }

    case 'GENERATE_AI_ANSWER': {
      const { profile, questionType, questionText } = message;
      const ai = await getAIService();
      let question = questionText || '';

      if (!question) {
        if (questionType === 'whyHire') {
          question = 'Why should we hire you?';
        } else if (questionType === 'projectsDetail') {
          question = 'Tell us about your projects and share links.';
        } else {
          question = 'Tell us about your qualifications and background.';
        }
      }

      const response = await ai.answerCustomQuestion({
        profile,
        jobDescription: `Target Role: ${profile.type || 'Software Developer'}. General Internship/Job Application.`,
        question,
      });
      return response.text;
    }

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
