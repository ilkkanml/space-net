# CHANGELOG

## [v0.2.0] — Milestone 12 Machine Detail UI
STATUS: USER TEST PASSED / QA PENDING

Machine readability layer implemented without rewriting the production loop.

### Added
- Machine detail panel shell
- Recipe dropdown selector
- Input slot rendering
- Output slot rendering
- Progress bar
- Status pill display
- Machine power placeholder text: Not active in v0.2
- Responsive machine detail panel cleanup
- Selected building highlight
- Stale selection guard

### Improved
- Machine selection readability
- Processor recipe visibility
- Input/output buffer visibility
- Missing input / output blocked / working state visibility
- Selection panel empty state
- Remove mode interaction safety
- Legacy v0.1 save key migration
- Visible build label updated to v0.2 QA Stabilization

### Fixed
- Restored base CSS after machine UI style overwrite
- Preserved HUD, build menu, save/load panel and remove mode styles
- Restored main loop after accidental truncation
- Guarded selection panel against stale deleted buildings
- Supported legacy v0.1 save key migration

### User Test Result
- v0.2 build opens locally.
- Visible build label corrected after local/cache refresh.
- Machine Detail UI did not block runtime.
- No blocker reported by user.

### Scope Guard
- No real energy system added
- No upgrade system added
- No overclocking added
- No production statistics screen added
- No gameplay power system added

### QA Status
Pending QA validation.

---

## [v0.2.0] — Milestone 11 Data Expansion
STATUS: USER TEST PASSED / QA PENDING

### Added
- Iron Rod
- Copper Cable
- Basic Frame
- v0.2 recipe definitions
- inputs[] recipe format support
- Multi-input production support
- Conveyor validation support for inputs[] recipes

### Preserved
- v0.1 Iron Plate recipe
- v0.1 Copper Wire recipe
- Basic Processor as the only processor
- Existing production loop structure
- Existing save structure

### User Test Result
- Basic Frame does not start with missing input.
- No blocker reported by user.

### QA Status
Pending QA validation.

---

## [v0.1.0] — First Playable Prototype
STATUS: QA APPROVED / LOCKED

Final Internal QA completed successfully.

### Added
- 3D isometric playable scene
- Orthographic camera system
- Grid placement system
- NEXUS Core gameplay loop
- Iron and Copper resource deposits
- Basic Miner
- Basic Processor
- Basic Conveyor
- Small Storage
- Resource processing pipeline
- Conveyor transfer logic
- Storage interaction
- NEXUS mission chain
- Partial delivery support
- Memory Fragment 01
- E.V.A. notification system
- Save / Load system
- Browser refresh persistence
- Continuous building placement
- Conveyor drag placement
- Remove mode
- Remove drag toggle

### Improved
- Camera controls aligned with city-builder standards
- Build flow usability
- Conveyor placement interaction
- General prototype stability
- Internal persistence validation

### Fixed
- Camera behavior inconsistencies
- Placement flow interruptions
- Persistence edge cases
- Conveyor interaction issues
- Remove mode usability inconsistencies

### Final Approved Package
SPACE_NET_Milestone_10_Hotfix_CityBuilderCamera.zip

### Final Commit
fix: align camera controls with city builder standard

### QA Result
PASSED INTERNAL TEST

### Notes
v0.1.0 successfully validates the first automation gameplay loop defined in the original production scope.
