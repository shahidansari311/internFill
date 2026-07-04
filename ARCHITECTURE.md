# InternFill Chrome Extension — System Architecture

This document describes the design, communication flows, data models, and encryption schemes used in the InternFill extension.

---

## 1. Core Architectural Layout

InternFill consists of four primary processes that communicate asynchronously:

```
                  +--------------------------------+
                  |         Extension Popup        |
                  |  - Profile select & quick fill |
                  +---------------+----------------+
                                  | sendMessage
                                  v
+------------------+     sendMessage     +------------------+
|  Content Script  |<--------------------+    Background    |
|  - scans forms   |                     |  Service Worker  |
|  - inputs values |                     |  - decrypts data |
+------------------+                     +--------+---------+
                                                  |
                                                  | Dexie / IndexedDB
                                                  v
                                         +------------------+
                                         |    IndexedDB     |
                                         |  - encrypted     |
                                         +------------------+
```

1. **Content Script** (`src/content/index.ts`): Scans the active browser window's DOM, maps inputs using proximity detection, and simulates native value setters to autofill form inputs.
2. **Background Worker** (`src/background/index.ts`): A lightweight, persistent service worker. It handles secure background events, intercepting runtime messages, fetching encrypted profile data from IndexedDB, decrypting it using the secure Crypto Key, and responding to the requesting page or popup.
3. **Dashboard Page / Options** (`src/options/`): A fully styled dashboard built with React. Handles profile management, resume files management (binary blobs), application tracking analytics, settings, and database utilities.
4. **Popup Page** (`src/popup/`): Accessible from the extension toolbar. Allows users to quickly toggle active profiles, check profile setup completeness, and run autofill on the current active tab.

---

## 2. Secure Local Encryption Flow (AES-GCM-256)

To protect candidate PII (Personally Identifiable Information), InternFill encrypts profile data locally before storing it.

```
[Profile Data JSON] 
       │
       ▼ (Serialized)
[Plaintext String] ────► [Crypto Key (AES-GCM)] ────► [Ciphertext Hex String] ────► [IndexedDB Table]
```

### Encryption Key Management
* On first load, the background service worker generates a secure cryptokey (256-bit symmetric key) using the standard Web Crypto API:
  `crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])`
* The key is serialized to a JSON Web Key (JWK) format and stored in the extension's secure isolated storage:
  `chrome.storage.local.set({ internfill_encryption_key: jwkKeyString })`
* Because this storage is isolated to the extension, it is inaccessible to host web pages or external programs.

---

## 3. Communication Sequences

### Autofill Execution Flow
When a user clicks **"Autofill This Page"** in the popup:

```
Popup UI              Background Worker             Content Script              Target Form
   │                          │                           │                          │
   │ 1. Trigger fill          │                           │                          │
   ├──────────────────────────┼──────────────────────────►│                          │
   │                          │                           │                          │
   │                          │ 2. GET_PROFILE_DATA       │                          │
   │                          │◄──────────────────────────┤                          │
   │                          │                           │                          │
   │                          │ 3. Fetch from DB &        │                          │
   │                          │    Decrypt profile        │                          │
   │                          ├──────────────┐            │                          │
   │                          │              │            │                          │
   │                          │◄─────────────┘            │                          │
   │                          │                           │                          │
   │                          │ 4. Return plaintext       │                          │
   │                          ├──────────────────────────►│                          │
   │                          │                           │                          │
   │                          │                           │ 5. Scan inputs &         │
   │                          │                           │    score matches         │
   │                          │                           ├─────────────┐            │
   │                          │                           │             │            │
   │                          │                           │◄────────────┘            │
   │                          │                           │                          │
   │                          │                           │ 6. Inject values         │
   │                          │                           ├─────────────────────────►│
```

1. **Triggering Event**: The Popup broadcasts an `AUTOFILL_PAGE` message to the content script of the active tab.
2. **Profile Fetching**: The content script requests decrypted data by posting a `GET_PROFILE_DATA` message to the background service worker.
3. **Decryption**: The background worker retrieves the encrypted record from the Dexie IndexedDB database, decrypts it using the local AES key, and returns the plaintext profile structure.
4. **Matching & Scoring**: The content script runs `detector.ts` to locate form fields, evaluates confidence scores (0.0 to 1.0) based on labels and attributes, and matches them to profile fields.
5. **State Injection**: The content script invokes `setElementValue` on each matched input, dispatching events to update virtual DOM states.

---

## 4. Virtual DOM Event Dispatching

Many modern UI frameworks (React, Vue, Angular) override DOM input values. A naive `.value = "Jane"` will not trigger component state updates. InternFill solves this by executing:

1. **Property Descriptor Bypass**:
   We retrieve the native prototype setter for the input element:
   ```typescript
   const nativeValueSetter = Object.getOwnPropertyDescriptor(
     window.HTMLInputElement.prototype,
     'value'
   )?.set;
   nativeValueSetter?.call(element, value);
   ```
2. **Standard Event Dispatches**:
   We trigger native input bubbles so framework state listeners respond:
   ```typescript
   element.dispatchEvent(new Event('input', { bubbles: true }));
   element.dispatchEvent(new Event('change', { bubbles: true }));
   ```
