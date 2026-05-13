# S.P.A.C.E. NET — Changelog

## v0.2 FINAL FREEZE

### Production
- Added Iron Rod.
- Added Copper Cable.
- Added Basic Frame.
- Preserved v0.1 recipes.
- Added v0.2 recipe chain.
- Stabilized multi-input production.
- Added atomic consume/output guard.
- Added missing input / output safety.

### Mission Stabilization
- Added activeMissionId authority.
- Added prerequisite mission lock.
- Separated collect objectives from delivery objectives.
- Added explicit mission transition.
- Isolated legacy duplicate completion trigger.
- Fixed mission progression reset after delivery.
- Fixed future mission condition leak.
- Fixed objective panel reset.
- Added objective resource display clamp:
  - 0/20 when empty
  - 5/20 when partial
  - 20/20 when sufficient
  - never 1000/20

### E.V.A.
- Added lightweight runtime presence foundation.
- Preserved old mission E.V.A. messages.
- Added runtime notification restraint.
- Added cooldown/queue guard direction.
- Ensured E.V.A. remains passive observer.
- Reduced generic assistant direction.
- Preserved rare but meaningful E.V.A. philosophy.

### Atmosphere
- Established silence-first philosophy.
- Established industrial loneliness direction.
- Established observe-and-maintain gameplay feel.
- Established anti-dopamine-spam design direction.
- Added preservation protocol.
