# S.P.A.C.E. NET v0.3 Additive Progression Patch

Commit:
feat: add v0.3 additive progression layer with blueprint unlock and NEXUS level display

Changed files in this package:
- game/js/data/blueprints.js
- game/js/systems/progressionSystem.js

Important:
This is the safe additive foundation package only.
It does NOT overwrite v0.2 FINAL FREEZE core/UI/system files.

Manual additive hook points:
1. gameState.js
   - Add progression object only if missing:
     progression: {
       unlockedBlueprintIds: [],
       nexusLevel: 1
     }

2. saveLoadSystem.js
   - Import normalizeProgressionState.
   - Call normalizeProgressionState() after load/replaceGameState.
   - Do not change SAVE_KEY.

3. missionSystem.js
   - On stabilizeNexus completion only:
     unlockBlueprint("smallStorage")
   - Do not let E.V.A. mutate mission state.

4. buildMenu.js
   - Read getBlueprintLockInfo(buildingId).
   - UI displays locked state only.
   - Existing exports must remain:
     initBuildMenu
     setActiveBuildButton
     setRemoveModeActive

5. selectionPanel.js
   - Read getNexusLevel() for NEXUS display only.
   - Existing exports must remain:
     updateSelectionPanel
     refreshSelectionPanel

6. evaNotificationSystem.js
   - Passive observer only.
   - Existing exports must remain:
     initEVANotificationSystem
     updateEVANotifications
     emitEVAEvent
     getLatestEVANotification

Compatibility Gate:
- Static import/export check before browser test.
- Browser cold-load must show zero red console errors.
- Existing v0.2 public API must remain unchanged.
