# IndexedDB as Local Source of Truth

Leafnote is local-first, so the app must create, edit, search, tag, and delete notes without waiting for network access or sign-in. We will use IndexedDB as the source of truth on each device, with backend sync treated as backup and cross-device replication. This avoids blocking the UI on network calls and gives us room for autosave, sync outbox, delete markers, and future conflict handling without forcing all note data into string-only localStorage.
