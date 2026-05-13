Commit:
fix: prevent EVA runtime from resetting mission progress

Changed files:
- game/js/systems/evaNotificationSystem.js

Integration:
Replace existing evaNotificationSystem.js with patched version.

Test:
1. Start fresh save.
2. Collect Iron Ore until 20/20.
3. Collect Copper Ore until 10/10.
4. Confirm objectives no longer reset to 0/20 and 0/10.
5. Wait for idle runtime line.
6. Trigger missing input runtime line.
7. Confirm old E.V.A. one-time messages still appear.
8. Save/load test.
