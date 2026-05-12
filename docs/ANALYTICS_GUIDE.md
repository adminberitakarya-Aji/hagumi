# HAGUMI Analytics Strategy Guide

Strategi ini dirancang untuk memahami perilaku pemain dan ekonomi game HAGUMI.

## 1. Event Taxonomy (Katalog Event)
Berikut adalah event utama yang dilacak:
- `session_start`: Dilacak saat pemain login atau membuka PWA.
- `purchase`: Dilacak saat pemain membeli item di Shop atau Market. Properti: `item_id`, `price`, `currency`.
- `gacha_pull`: Dilacak saat melakukan tarikan gacha. Properti: `pool_id`, `result_rarity`.
- `pet_interaction`: Dilacak saat memberi makan, mandi, atau bermain. Properti: `interaction_type`, `pet_id`.

## 2. Alat Analitik (Tooling)
- **Mixpanel:** Digunakan untuk analisis perilaku pengguna (Product Analytics) dan *cohort analysis*.
- **Supabase (SQL):** Digunakan untuk analisis ekonomi berat (total sirkulasi koin, inflasi item) melalui query langsung ke database.

## 3. Key Performance Indicators (KPI)
- **DAU (Daily Active Users):** Jumlah pemain unik per hari.
- **D1/D7 Retention:** Persentase pemain yang kembali setelah hari ke-1 dan ke-7.
- **ARPU (Average Revenue Per User):** Pendapatan rata-rata per pemain dari top-up Gems.
- **Economy Velocity:** Kecepatan perputaran koin di Market antar pemain.
