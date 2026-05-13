# BUG REPORTS

## v0.2 QA Stabilization — Current Risk Tracking

STATUS:
CONFIRMED HIGH BUG OPEN
QA VALIDATION BLOCKED UNTIL FIXED

--------------------------------------------------
ACTIVE HIGH BUG
--------------------------------------------------

Bug ID:
V0_2_MISSION_PROGRESS_DUPLICATE_COMPLETION

Status:
OPEN / REPRODUCED BY USER

Area:
Mission progression / Objective panel / NEXUS delivery flow

Observed:
- Mission order now mostly progresses correctly.
- Gather Raw Materials reaches 20/20 Iron Ore and 10/10 Copper Ore.
- Turquoise completion message appears.
- Left mission panel then resets display to 0/20 and 0/10.
- NEXUS delivery later triggers completion again.
- Legacy text still appeared in prior build: “Internal v0.1 mission pass complete.”

Current diagnosis:
- Duplicate completion trigger still exists.
- Completion appears to be triggered from more than one path:
  1. inventory/resource watcher
  2. NEXUS delivery handler
- Legacy v0.1 completion/display path may still be active outside the new activeMissionId guard.
- Objective panel is being overwritten after completion transition.

Required fix direction:
- Mission completion authority must be isolated to one path.
- Only activeMissionId may be evaluated.
- Future missions must remain locked.
- Collect objective reads collected inventory/produced count only.
- Delivery objective reads NEXUS deliveryProgress only.
- Legacy/internal completion notifier must be removed or active-guarded.
- E.V.A. runtime must not mutate mission state.

Blocking level:
HIGH — do not QA PASS / do not LOCK until resolved.

--------------------------------------------------
RECENT FAILED PATCHES / DO NOT TREAT AS PASSED
--------------------------------------------------

- SPACE_NET_EVA_Runtime_Presence_Patch — FAILED
- SPACE_NET_EVA_Runtime_Mission_Reset_Bugfix — FAILED
- SPACE_NET_Mission_EVA_Logic_Fix — FAILED
- SPACE_NET_Mission_Collect_Delivery_Fix — FAILED
- SPACE_NET_Active_Mission_Order_Fix — PARTIAL SUCCESS
- SPACE_NET_Active_Mission_Progression_Fix — PARTIAL SUCCESS
- SPACE_NET_Mission_Objective_Display_Fix — FAILED / BUG PERSISTS
- SPACE_NET_Legacy_Mission_Completion_Isolation — FAILED / BUG PERSISTS

--------------------------------------------------
RESOLVED THIS SESSION / STILL VALID
--------------------------------------------------

- CSS overwrite issue restored
- main.js accidental truncation restored
- Legacy v0.1 save key migration added
- Selection panel stale deleted-building protection added
- Selected building highlight activation completed
- Build label corrected from Milestone 09 to v0.2 QA Stabilization
- Storage state malformed save guard added
- Storage capacity fallback added
- Storage item transfer validation strengthened

--------------------------------------------------
KNOWN RISK AREAS
--------------------------------------------------

Priority: MEDIUM

- Conveyor-heavy stress layouts not fully validated
- Long-session runtime stability not fully validated
- Recipe switching spam not fully validated
- Remove mode + selection interaction needs QA review
- Save/load regression still requires QA confirmation
- Potential stale UI edge cases after rapid delete/load operations
- Selection refresh timing still requires observation

--------------------------------------------------
KNOWN NON-BLOCKING POLISH ITEMS
--------------------------------------------------

Priority: LOW

- Machine highlight polish can be improved
- Conveyor visual readability can be improved
- Panel animations can be improved
- UI transitions can be improved
- Camera smoothing can be improved
- General cleanup/refactor pass recommended later

--------------------------------------------------
CURRENT QA CONCLUSION
--------------------------------------------------

Current v0.2 build is NOT ready for QA PASS.

Reason:
Mission progression HIGH bug remains open.

Next session must start with real repo inspection of:
- game/js/systems/missionSystem.js
- game/js/ui/missionPanel.js
- game/js/data/missions.js
- game/js/systems/evaNotificationSystem.js
- game/js/systems/saveLoadSystem.js

No LOCKED status until this blocker is fixed and user retests.
