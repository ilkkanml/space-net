# BUG_REPORTS.md

## Açık hatalar

| ID | Öncelik | Sistem | Açıklama | Durum |
|---|---|---|---|---|

## Kapanan hatalar

| ID | Sistem | Çözüm | Sürüm |
|---|---|---|---|
| BUG-M05-001 | UI | Machine panel her 0.25 saniyede komple yeniden çizildiği için bazı buton tıklamaları kaçıyordu. Refresh sadece machine info alanını güncelleyecek şekilde düzeltildi. | v0.1.0-m05-hotfix |
| BUG-M05-002 | Production | Processor input yükleme sadece tek batch taşıdığı için üretim bitince inventory'de malzeme olsa bile duruyordu. Load Input artık input buffer kapasitesi dolana kadar mümkün olan batch'leri yükler. | v0.1.0-m05-hotfix |
