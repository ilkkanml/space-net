# S.P.A.C.E. NET v0.2 Stabilization Guard Patch

Changed files:
- game/js/systems/productionSystem.js
- game/js/systems/saveLoadSystem.js
- game/js/systems/conveyorSystem.js
- game/js/ui/selectionPanel.js

Scope:
- Minimal invasive guard patch only.
- No core loop rewrite.
- No save key change.
- No recipe format expansion.
- No UI layout expansion.
- No conveyor path algorithm change.

Commit:
fix: stabilize v0.2 production guards

Test:
1. Load existing v0.1/v0.2 save.
2. Produce Iron Plate and Copper Wire.
3. Produce Iron Rod, Copper Cable, Basic Frame.
4. Switch processor recipe while input buffer has old resource.
5. Confirm incompatible stale input does not block new recipe.
6. Fill output buffer and confirm machine shows OUTPUT BLOCKED, not stuck WORKING.
7. Conveyor chain transfers single items without duplication.
8. Save, refresh, load, continue production.
