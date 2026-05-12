# BUG REPORTS

## v0.2 QA Stabilization — Current Risk Tracking

STATUS:
NO CONFIRMED CRITICAL BLOCKER
QA VALIDATION STILL REQUIRED

--------------------------------------------------
RESOLVED THIS SESSION
--------------------------------------------------

- CSS overwrite issue restored
- main.js accidental truncation restored
- Legacy v0.1 save key migration added
- Selection panel stale deleted-building protection added
- Selected building highlight activation completed
- Build label corrected from Milestone 09 to v0.2 QA Stabilization

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

Current v0.2 build successfully:
- launches locally
- preserves v0.1 gameplay loop
- supports multi-input production
- supports machine detail readability layer
- preserves persistence foundation
- supports legacy v0.1 save migration

No confirmed runtime blocker currently reported.

Full internal QA pass still pending before LOCKED status.
