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
IMMEDIATE PRIORITY — ACTIVE BLOCKER
--------------------------------------------------

HIGH PRIORITY:
Fix mission progression duplicate completion bug.

Required investigation:
- duplicate mission completion trigger
- legacy v0.1 completion path
- objective panel overwrite timing
- mission transition sequencing
- delivery completion authority
- activeMissionId enforcement

Required repo inspection next session:
- game/js/systems/missionSystem.js
- game/js/ui/missionPanel.js
- game/js/data/missions.js
- game/js/systems/evaNotificationSystem.js
- game/js/systems/saveLoadSystem.js

Do NOT:
- mark QA PASS
- mark LOCKED
- expand v0.2 scope
- add new systems

Until blocker is resolved and user retest passes.

--------------------------------------------------
SECONDARY PRIORITIES
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

2. Stabilization Fixes Only
- Fix runtime blockers
- Fix save/load regressions
- Fix stale selection crashes
- Fix broken UI refresh cases
- Fix conveyor transfer regressions

--------------------------------------------------
DEPARTMENT USAGE RULE
--------------------------------------------------

Department GPTs may review concept, scope and risk from summarized context.

Real code is required before any department gives final approval for:
- implementation
- QA PASS
- LOCK decision
- refactor approval
- save/load migration approval
- runtime blocker closure

If a department has not seen the real files, its output must be treated as advisory review only.

--------------------------------------------------
FUTURE INTERNAL TOOLING BACKLOG
--------------------------------------------------

Internal Code Execution / QA Automation System:
- repo-aware builder
- local build runner
- browser launch automation
- console error capture
- Playwright or Puppeteer interaction tests
- save/load regression automation
- screenshot/log reporting
- CI-style QA result summary

Status:
BACKLOG — future studio tooling.

--------------------------------------------------
NEXT TARGET AFTER BLOCKER FIX
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
