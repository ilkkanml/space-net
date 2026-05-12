# Current State — v0.2 QA Stabilization

Current working target:
v0.2.0 Basic Production Expansion — QA Stabilization Phase.

--------------------------------------------------
BASELINE
--------------------------------------------------

v0.1.0 First Playable Prototype:
STATUS: QA APPROVED / LOCKED

v0.1 core loop remains protected.
No v0.1 scope changes should be made.

--------------------------------------------------
CURRENT ACTIVE VERSION
--------------------------------------------------

v0.2.0 Basic Production Expansion:
STATUS: ACTIVE DEVELOPMENT

Current phase:
QA Stabilization

--------------------------------------------------
MILESTONE STATUS
--------------------------------------------------

Milestone 11 — Data Expansion:
STATUS: USER TEST PASSED / QA PENDING

Implemented:
- Iron Rod
- Copper Cable
- Basic Frame
- v0.2 recipe definitions
- inputs[] recipe format support
- Multi-input production support
- Conveyor validation support for inputs[] recipes

User test confirmed:
- Basic Frame does not start with missing input.
- No blocker reported.

--------------------------------------------------

Milestone 12 — Machine Detail UI:
STATUS: USER TEST PASSED / QA PENDING

Implemented:
- Machine detail panel shell
- Recipe dropdown selector
- Input slot rendering
- Output slot rendering
- Progress bar
- Status pill display
- Selected building highlight
- Stale selection guard
- Legacy v0.1 save key migration
- Visible build label updated to v0.2 QA Stabilization

User test confirmed:
- v0.2 local build opens.
- Visible label corrected after local/cache refresh.
- No blocker reported.

--------------------------------------------------
IMPORTANT FIXES THIS SESSION
--------------------------------------------------

Resolved:
- CSS overwrite issue restored.
- main.js accidental truncation restored.
- Selection panel stale deleted-building guard added.
- Legacy v0.1 save key migration added.
- Build label updated from Milestone 09 to v0.2 QA Stabilization.

--------------------------------------------------
CURRENT RISK AREAS
--------------------------------------------------

Requires QA validation:
- Conveyor-heavy layouts
- Long-session stability
- Recipe switching spam
- Remove mode + selection interaction
- Save/load regression
- Output blocked / missing input visibility
- Stale UI references after delete/load

--------------------------------------------------
NEXT ACTION
--------------------------------------------------

Start v0.2 internal QA pass.

Do not mark Milestone 11 or Milestone 12 as QA PASSED / LOCKED until QA validation is completed.
