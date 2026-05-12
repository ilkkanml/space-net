# v0.2 QA Checklist — Basic Production Expansion

## Current Phase

STATUS: QA STABILIZATION

Milestone 11: USER TEST PASSED / QA PENDING
Milestone 12: USER TEST PASSED / QA PENDING

Do not mark v0.2 or its milestones as LOCKED until this checklist is completed.

---

## 1. Launch / Runtime Smoke Test

- [ ] Game opens locally without white screen
- [ ] Console has no red runtime error
- [ ] Top-left label shows v0.2 QA Stabilization
- [ ] Resource bar renders correctly
- [ ] Mission panel renders correctly
- [ ] E.V.A. panel renders correctly
- [ ] Build menu renders correctly
- [ ] Selection panel renders correctly

Pass note:

---

## 2. v0.1 Regression Test

- [ ] Iron Ore can be collected
- [ ] Copper Ore can be collected
- [ ] Basic Miner can be placed on Iron Deposit
- [ ] Basic Miner can be placed on Copper Deposit
- [ ] Basic Processor can be placed
- [ ] Basic Conveyor can be placed
- [ ] Small Storage can be placed
- [ ] Iron Plate production still works
- [ ] Copper Wire production still works
- [ ] NEXUS mission flow still works
- [ ] E.V.A. notifications still appear
- [ ] Remove mode still works
- [ ] Conveyor drag placement still works
- [ ] Camera controls still work

Pass note:

---

## 3. Milestone 11 Data Expansion Test

- [ ] Iron Rod recipe appears
- [ ] Copper Cable recipe appears
- [ ] Basic Frame recipe appears
- [ ] Iron Plate -> Iron Rod production works
- [ ] Copper Wire -> Copper Cable production works
- [ ] Iron Rod + Iron Plate + Copper Cable -> Basic Frame production works
- [ ] Basic Frame does not start with missing input
- [ ] No partial input consume happens when recipe cannot start
- [ ] Existing v0.1 recipes still work

Pass note:

---

## 4. Machine Detail UI Test

- [ ] Clicking a machine opens Machine Detail panel
- [ ] Machine name displays correctly
- [ ] Status pill displays correctly
- [ ] Recipe dropdown displays correctly
- [ ] Recipe selection changes active recipe
- [ ] Input slots render correctly
- [ ] Output slots render correctly
- [ ] Progress bar updates during production
- [ ] Missing Input state displays correctly
- [ ] Output Blocked state displays correctly
- [ ] Power placeholder says Not active in v0.2
- [ ] Panel refresh does not flicker badly

Pass note:

---

## 5. Selection / Highlight Test

- [ ] Selected building highlights visually
- [ ] Selecting another building clears previous highlight
- [ ] Selecting world object clears building highlight
- [ ] ESC / Cancel clears selection safely
- [ ] Remove mode clears normal selection safely
- [ ] Deleted selected building does not leave stale highlight
- [ ] Deleted selected building does not crash panel refresh

Pass note:

---

## 6. Conveyor Stress Test

- [ ] Miner -> Conveyor -> Processor works
- [ ] Processor -> Conveyor -> Storage works
- [ ] Multiple conveyors transfer correctly
- [ ] Conveyor does not push wrong item into processor
- [ ] Conveyor respects active recipe inputs
- [ ] Conveyor does not duplicate items
- [ ] Conveyor does not delete items unexpectedly
- [ ] Conveyor-heavy layout remains stable for several minutes

Pass note:

---

## 7. Recipe Switching Stress Test

- [ ] Switching recipes resets progress safely
- [ ] Rapid recipe switching does not crash
- [ ] Input buffer remains understandable after recipe switch
- [ ] Output buffer remains intact after recipe switch
- [ ] Machine does not get stuck in invalid state
- [ ] Selected panel keeps correct recipe visible

Pass note:

---

## 8. Save / Load Regression Test

- [ ] Save works with v0.2 resources
- [ ] Load restores v0.2 resources
- [ ] Save/load restores selected recipe
- [ ] Save/load restores input buffer
- [ ] Save/load restores output buffer
- [ ] Save/load restores production progress safely
- [ ] Legacy v0.1 save migration does not break current build
- [ ] Browser refresh persistence works

Pass note:

---

## 9. Long Session Stability Test

- [ ] Game runs 10 minutes without console error
- [ ] Game runs 20 minutes without console error
- [ ] Production continues over time
- [ ] UI refresh remains stable
- [ ] No obvious severe FPS degradation
- [ ] No stuck machine state appears unexpectedly

Pass note:

---

## 10. Scope Guard Verification

Confirm these were NOT added:

- [ ] No real energy simulation
- [ ] No upgrade system
- [ ] No research tree
- [ ] No market
- [ ] No contracts
- [ ] No consortium
- [ ] No backend
- [ ] No multiplayer
- [ ] No player-facing reset button
- [ ] No pay-to-win mechanic

Pass note:

---

## QA Conclusion

Result:
- [ ] QA PASSED
- [ ] QA PASSED WITH NON-BLOCKING POLISH
- [ ] QA FAILED — BLOCKER FOUND

Blocker summary:

Polish notes:

Next action:
