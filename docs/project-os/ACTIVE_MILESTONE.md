# ACTIVE_MILESTONE.md

## Aktif Milestone
Milestone 03 — Game State & Resources

## Amaç
Oyun durumunu merkezi gameState içine almak, v0.1 kaynaklarını tanımlamak, inventory/resource bar göstermek ve Iron/Copper depositlerinden manuel kaynak toplama akışını kurmak.

## Olacaklar
- js/core/gameState.js
- js/data/resources.js
- js/ui/resourceBar.js
- Merkezi inventory state
- Resource bar UI
- Iron Ore / Copper Ore / Iron Plate / Copper Wire kaynak tanımları
- Iron Deposit seçilince manuel +1 Iron Ore toplama
- Copper Deposit seçilince manuel +1 Copper Ore toplama
- Kaynak miktarı anlık UI’da güncellenir
- Selection panel kaynak toplama aksiyonu gösterir

## Olmayacaklar
- Build menu
- Makine yerleştirme
- Otomatik üretim
- Processor recipe sistemi
- Conveyor transfer
- Storage
- Görev sistemi
- E.V.A.
- Save/load

## Kabul kriteri
Oyun açılır, resource bar görünür, Iron Deposit’ten Iron Ore toplanır, Copper Deposit’ten Copper Ore toplanır, miktarlar anlık güncellenir, sahne/kamera/grid/selection sistemi bozulmaz.
