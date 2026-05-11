# ACTIVE_MILESTONE.md

## Aktif Milestone
Milestone 09 — Save / Load & Persistence

## Amaç
v0.1 oynanış ilerlemesini tarayıcı localStorage üzerinde kalıcı hale getirmek.

## Olacaklar
- localStorage save key: `spaceNetSave_v0_1`
- saveVersion: `0.1.0`
- Save Game button
- Load Game button
- Browser refresh sonrası otomatik save restore
- Resources persistence
- Buildings persistence
- Machine input/output/progress/status persistence
- Conveyor direction/carriedItem persistence
- Storage items/capacity persistence
- NEXUS level/memory persistence
- Mission active/completed/delivery progress persistence
- E.V.A. notifications/emittedEventIds persistence
- Gizli developer debug clear save fonksiyonu

## Olmayacaklar
- Oyuncuya açık reset
- Baştan başla butonu
- Tüm ilerlemeyi sil butonu
- Cloud save
- Account sistemi
- Backend
- Save slot sistemi
- Import/export save UI

## Kabul kriteri
Oyuncu Save Game butonuna basınca mevcut ilerleme kaydedilir. Sayfa yenilendiğinde veya Load Game ile resources, binalar, makineler, conveyor, storage, mission, NEXUS ve E.V.A. state geri gelir. Oyuncuya açık reset bulunmaz. Sadece console üzerinden gizli developer clear save fonksiyonu vardır.
