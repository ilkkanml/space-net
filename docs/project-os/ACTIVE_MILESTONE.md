# ACTIVE_MILESTONE.md

## Aktif Milestone
Milestone 05 — Machines & Production

## Amaç
Yerleştirilen makinelerin merkezi production loop ile çalışmasını sağlamak.

## Olacaklar
- Basic Miner otomatik ham kaynak üretimi
- Basic Processor recipe sistemi
- Recipes:
  - 2 Iron Ore -> 1 Iron Plate
  - 2 Copper Ore -> 1 Copper Wire
- Machine status:
  - working
  - idle
  - inputShortage
  - outputFull
  - noRecipe
- Machine input/output buffer
- Production progress
- Machine detail panel
- Manual load/collect test aksiyonları

## Olmayacaklar
- Conveyor transfer
- Storage capacity logic
- Energy
- Market
- Research
- Backend
- Upgrade sistemi
- Splitter/merger
- Advanced automation

## Kabul kriteri
Basic Miner output buffer içine düzenli üretim yapar. Basic Processor seçilen recipe için input tüketir, output üretir, status doğru görünür. Output full/input shortage/no recipe durumları görülebilir. Conveyor/storage beklemeden production loop stabil çalışır.
