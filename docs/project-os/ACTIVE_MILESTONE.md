# ACTIVE_MILESTONE.md

## Aktif Milestone
Milestone 06 — Conveyor & Storage

## Amaç
Makine output buffer, conveyor hattı, processor input buffer ve storage arasında basit item transfer zincirini kurmak.

## Olacaklar
- Basic Conveyor building
- Conveyor direction: North / East / South / West
- R tuşu ile placement sırasında conveyor yönü değiştirme
- Conveyor carriedItem state
- 1 item / transfer tick
- Miner output -> Conveyor
- Conveyor -> Conveyor
- Conveyor -> Processor input
- Processor output -> Conveyor
- Conveyor -> Small Storage
- Small Storage capacity: 100 total items
- Storage item panel
- Storage collect action

## Olmayacaklar
- Conveyor pathfinding
- Splitter / merger
- Underground conveyor
- Belt speed upgrade
- Smart routing
- Advanced logistics
- Energy
- Market
- Backend
- Save/load

## Kabul kriteri
Basic Conveyor yerleştirilebilir. R ile yön değiştirilebilir. Miner output buffer’dan conveyor hattına item geçer. Conveyor zinciri item taşır. Processor recipe seçiliyse conveyor input kabul eder. Processor output conveyor ile storage’a taşınır. Storage 100 item kapasiteyle çalışır.
