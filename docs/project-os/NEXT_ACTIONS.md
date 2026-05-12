# NEXT ACTIONS

--------------------------------------------------
CURRENT PROJECT STATE
--------------------------------------------------

v0.1.0:
STATUS: QA APPROVED / LOCKED

v0.2.0:
STATUS: ACTIVE DEVELOPMENT

Current phase:
QA Stabilization

Milestone 11:
USER TEST PASSED / QA PENDING

Milestone 12:
USER TEST PASSED / QA PENDING

Primary QA file:
`docs/project-os/V0_2_QA_CHECKLIST.md`

--------------------------------------------------
IMMEDIATE PRIORITIES
--------------------------------------------------

1. Run v0.2 QA Checklist
- Launch / Runtime Smoke Test
- v0.1 Regression Test
- Milestone 11 Data Expansion Test
- Machine Detail UI Test
- Selection / Highlight Test
- Conveyor Stress Test
- Recipe Switching Stress Test
- Save / Load Regression Test
- Long Session Stability Test
- Scope Guard Verification

2. Log QA Result
- If blocker found: update BUG_REPORTS.md
- If no blocker: mark checklist conclusion as QA PASSED WITH NON-BLOCKING POLISH or QA PASSED
- Do not mark LOCKED until QA result is complete

3. Stabilization Fixes Only
- Fix runtime blockers
- Fix save/load regressions
- Fix stale selection crashes
- Fix broken UI refresh cases
- Fix conveyor transfer regressions

--------------------------------------------------
NEXT TARGET AFTER QA
--------------------------------------------------

Target:
v0.2 QA PASS preparation

Focus:
- Final stabilization
- Final cleanup
- Final usability review
- Final regression review

--------------------------------------------------
IMPORTANT RULES
--------------------------------------------------

Do not expand advanced systems before v0.2 stabilization is complete.

Do not implement:
- real energy simulation
- upgrade systems
- research tree
- backend
- market
- multiplayer
- advanced logistics

Protect foundation stability first.
