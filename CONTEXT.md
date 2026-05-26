# Leafnote

Leafnote is a personal, local-first mobile web note-taking app for individuals who want a calm writing space with optional sync.

## Language

**Note**:
A private text entry owned by one personal user, created with a stable client-generated ID after its title or body has content.
_Avoid_: Document, post, page

**Local-first**:
The product treats local device storage as the source of truth before any account or network connection exists.
_Avoid_: Offline mode, cache-only

**Outbox**:
A local queue of Note changes waiting to be synced after they are safely saved on the device and ordered by local write time.
_Avoid_: Pending requests, cache queue

**Last-write-wins**:
A sync conflict rule where the Note with the newest update time replaces older versions.
_Avoid_: Merge, conflict resolution

**Saved**:
A Note state written to local device storage after a short typing pause or editor exit.
_Avoid_: Synced, uploaded

**Sync**:
Optional backup and cross-device transfer for notes after sign-in, shown as Local only, Syncing, or Synced.
_Avoid_: Collaboration, sharing, offline-as-error

**Sign-in**:
An optional OAuth step that enables Sync for the Personal user without promising end-to-end encryption; sign-out disables Sync but keeps local Notes.
_Avoid_: Login gate, email/password auth, encryption claim

**Delete**:
A permanent removal of a Note after user confirmation, with a short undo window and a synced tombstone.
_Avoid_: Archive, trash

**Tombstone**:
A local delete record used to sync Note removal across devices without resurrecting old notes.
_Avoid_: Trash item, archived note

**Tag**:
A lightweight label used to group and filter Notes.
_Avoid_: Folder, notebook, category

**Editor**:
The plain-text writing surface where a Personal user writes a Note title and body.
_Avoid_: Rich text editor, document composer

**Search**:
A title-and-body lookup for Notes on the current device.
_Avoid_: Advanced search, global filter

**Settings**:
A minimal place to view account, sync status, app version, and privacy copy.
_Avoid_: Preferences, admin, profile

**Welcome**:
The first-run entry screen that explains local-first use and optional Sync.
_Avoid_: Landing page, marketing page

**Personal user**:
The single human who owns and reads their own notes, identified for Sync by account email and provider.
_Avoid_: Team, workspace, organization, profile

## Relationships

- A **Personal user** owns zero or more **Notes**
- A **Note** can exist without **Sync**
- **Notes** are listed by newest update first
- **Sync** must not block local creation, editing, search, tagging, or deletion of **Notes**

## Example dialogue

> **Dev:** "Does a **Personal user** need to sign in before creating a **Note**?"
> **Domain expert:** "No. Leafnote is **Local-first**. Sign-in only enables **Sync**."

## Flagged ambiguities

- "Offline-first" and "local-first" both appeared in planning. Resolved: use **Local-first** because the product works fully before account or network setup.
