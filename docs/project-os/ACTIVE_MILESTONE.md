# ACTIVE_MILESTONE.md

## Aktif Milestone
Milestone 08 — E.V.A. Notifications

## Amaç
E.V.A. sistemini v0.1 core loop'a bağlamak; nadir, anlamlı ve tekrarsız bildirimlerle oyuncuya yönlendirme ve atmosfer sağlamak.

## Olacaklar
- gameState.eva.notifications
- gameState.eva.emittedEventIds
- E.V.A. notification data
- E.V.A. notification system
- HUD E.V.A. panel
- Duplicate trigger engelleme
- Mission progression trigger
- First resource trigger
- First miner / processor / conveyor trigger
- Input shortage trigger
- Output blocked trigger
- Delivery complete trigger
- Memory Fragment 01 trigger

## Olmayacaklar
- Voiceover
- Ses sistemi
- Cutscene
- Animated portrait
- E.V.A. skinleri
- Premium E.V.A. variantları
- Dialogue tree
- Chatbot sistemi
- Backend notification persistence

## Kabul kriteri
E.V.A. panel görünür. Mesajlar anlamlı olaylarda tetiklenir. Aynı event birden fazla kez spam üretmez. Mission progression ile senkron çalışır. Memory Fragment 01 mesajı tetiklenir. Mevcut kamera, build, production, conveyor, storage ve mission sistemleri bozulmaz.
