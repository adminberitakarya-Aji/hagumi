# Panduan Penyeimbangan Ekonomi HAGUMI (Economy Balancing Guide)

Dokumen ini menjelaskan mekanisme di balik layar yang menjaga stabilitas ekonomi dalam game HAGUMI. Sistem ini dirancang untuk mencegah hiperinflasi (terlalu banyak koin) dan deflasi (terlalu sedikit koin), memastikan pengalaman bermain tetap menantang dan adil bagi semua pemain.

## 1. Arsitektur Simulasi Ekonomi (`simulation.go`)

Sistem simulasi berjalan sebagai *background process* (Cron Job setiap 24 jam) di server backend.
Fungsi utamanya adalah:
- **Faucet Monitoring:** Menghitung total mata uang yang masuk ke peredaran dari sumber seperti:
  - Daily Rewards (Klaim Harian)
  - Hasil kemenangan Mini-games
  - Pencapaian (Achievements)
- **Sink Monitoring:** Menghitung total mata uang yang keluar dari peredaran melalui:
  - Pembelian di Shop (Makanan, Mainan, Kosmetik)
  - Biaya Market (Pajak Transaksi, Biaya Listing)
  - Breeding Fees (Biaya Perkawinan Pet)

### Mekanisme Kontrol Inflasi
Jika `Total Faucet > Total Sink * 1.5`, sistem mengidentifikasi adanya inflasi. Tindakan otomatis yang dapat diambil:
1. Meningkatkan pajak *Market* secara dinamis.
2. Mengurangi *drop rate* koin dari mini-games untuk sementara waktu.
3. Menghadirkan "Item Spesial Terbatas" dengan harga tinggi di Shop untuk menyerap kelebihan koin (Coin Sink Event).

### Mekanisme Kontrol Deflasi
Jika `Total Sink > Total Faucet * 1.2`, pemain sedang kehabisan uang. Tindakan otomatis:
1. Memberikan "Weekend Bonus" atau "Login Bonus" tambahan.
2. Mengurangi harga item dasar (seperti makanan standar) di Shop.

## 2. Dynamic Pricing & Market Maker (`pricing.go`)

Selain ekonomi makro, HAGUMI memiliki sistem harga dinamis untuk item-item krusial di Market. Sistem ini meniru mekanisme *Supply and Demand*.

### Algoritma Harga:
- **Demand (Permintaan):** Saat pemain membeli item spesifik secara terus-menerus, *Demand Index* naik.
- **Supply (Ketersediaan):** Saat pemain menjual item (atau sistem memompa stok baru), *Supply Index* naik.
- **Ratio = Demand / Supply**
- Jika `Ratio > 1.0`, harga item akan merangkak **NAIK** (Max 10% per jam).
- Jika `Ratio < 1.0`, harga item akan merangkak **TURUN** (Max 10% per jam).

Sistem membatasi fluktuasi menggunakan nilai `MinPrice` dan `MaxPrice` untuk setiap item guna mencegah harga menjadi tidak masuk akal.

## 3. Strategi Pengujian (Simulation Testing)
Fungsi `SimulatePlayerBehavior(days, initialPlayers)` digunakan secara internal oleh developer untuk menguji proyeksi ekonomi selama berbulan-bulan ke depan hanya dalam hitungan detik. Ini memungkinkan tim untuk menemukan "sweet spot" dalam menentukan rasio hadiah sebelum fitur diluncurkan ke Production.
