# S.P.A.C.E. NET — Active Mission Order Fix

Commit:
fix: enforce active mission order

Changed files:
- game/js/data/missions.js
- game/js/systems/missionSystem.js
- game/js/systems/evaNotificationSystem.js

Integration:
Copy the included game/ folder over the existing project game/ folder.

Fix:
- Mission system evaluates only the active mission.
- Future mission conditions cannot complete early.
- NEXUS click/contact mission must complete before gather mission can complete.
- Gather Raw Materials uses collected labels.
- Stabilize NEXUS Core uses delivered labels.
- Delivery mission cannot complete without NEXUS delivery.
- E.V.A. runtime disabled; E.V.A. does not mutate mission state.

Test:
1. Start clean save.
2. Click NEXUS first.
3. Confirm Contact NEXUS Core completes.
4. Collect 20 Iron Ore and 10 Copper Ore.
5. Confirm Gather Raw Materials completes by collection.
6. Confirm Stabilize NEXUS Core becomes active after gather.
7. Confirm objective text says delivered 0/20 and 0/10 only for delivery mission.
8. Confirm delivery mission does not complete until NEXUS delivery button is used.
9. Confirm resources decrease after delivery.
10. Confirm old E.V.A. messages still appear.
11. Save/load regression test.
12. Second path: collect resources before clicking NEXUS, then click NEXUS, confirm gather starts with existing collected progress.
