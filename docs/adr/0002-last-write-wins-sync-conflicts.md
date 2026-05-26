# Last-Write-Wins Sync Conflicts

Leafnote is a personal note app, not a collaborative editor, so MVP sync will resolve conflicting note edits with last-write-wins based on update time. This can overwrite edits made on another device, but it avoids conflict UI and field-level merge complexity while keeping the app simple. The local Outbox still preserves write order before sync so each device sends changes predictably.
