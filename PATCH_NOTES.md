# S.P.A.C.E. NET — Developer Debug Reset Patch

Changed files:
- game/js/systems/saveLoadSystem.js

Scope:
- Adds console-only developer debug command:
  - window.spaceNetDebugResetProgress()
- Keeps existing window.spaceNetDebugClearSave()
- No public UI reset button.
- No save key change.
- No gameplay reset feature.
- Existing save/load flow preserved.

Integration:
Copy the included game/ folder over the existing project game/ folder.

Commit:
chore: add developer debug progress reset

Test:
1. Start local server.
2. Open browser console.
3. Type window.spaceNetDebugResetProgress()
4. Confirm console message appears.
5. Refresh page.
6. Confirm clean local state loads.
7. Confirm no reset button appears in UI.
8. Save/load still works after new save.
