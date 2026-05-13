# S.P.A.C.E. NET — Bug Reports

## Fixed

### Mission progression reset
Status: Fixed
- Mission chain no longer resets to the first mission after delivery.

### Future mission leak
Status: Fixed
- Future objective conditions no longer complete before becoming active.

### Duplicate mission completion
Status: Fixed
- Legacy v0.1 internal mission completion trigger isolated.

### Collect/delivery confusion
Status: Fixed
- Gather objectives use collection/progress source.
- Delivery objectives require actual NEXUS delivery.

### Objective panel reset
Status: Fixed
- Objective progress no longer returns incorrectly to 0 after valid progress.

### Objective display overflow
Status: Fixed
- Requirement display clamps to required amount.
- Large stock no longer renders as 1000/20.

### E.V.A. runtime side effects
Status: Stabilized
- E.V.A. runtime must not mutate mission state.
- Notification/cooldown logic treated as passive observer.

## Watchlist

- Long-session mission/UI refresh drift.
- Notification overlap under intensive gameplay.
- Future UI density tonal erosion.
- Save/load edge cases with future mission expansion.
