# HAGUMI Data Replication & Consistency Guide

Dokumen ini merinci bagaimana HAGUMI menjaga integritas data di seluruh wilayah yang berbeda.

## 1. Strategi Replikasi Database
HAGUMI menggunakan model **Single-Leader Replication**:
- **Write Operations:** Semua operasi tulis (seperti membeli item, memberi makan pet) HARUS dikirim ke server utama di wilayah Singapura.
- **Read Operations:** Operasi baca (seperti melihat profil, melihat leaderboard) bisa dilakukan dari replika terdekat di wilayah lokal pemain.
- **Lag Monitoring:** Sistem memantau jeda replikasi (*replication lag*). Jika lag melebihi 1 detik, sistem otomatis akan beralih membaca dari server utama untuk memastikan pemain melihat data terbaru.

## 2. Resolusi Konflik (Conflict Resolution)
Karena penulisan hanya terjadi di satu tempat, konflik *race condition* diminimalkan. Namun, untuk sistem inventaris, kami menerapkan:
- **Optimistic UI:** Frontend mengasumsikan sukses dan memperbarui UI secara instan.
- **Server Validation:** Backend melakukan validasi akhir. Jika gagal, status UI akan di-*rollback* (dikembalikan ke semula) dan pemain mendapatkan notifikasi.

## 3. Sinkronisasi Cache (Redis)
Setiap wilayah memiliki cache Redis lokal. Invalidasi cache dilakukan secara global:
- Saat profil pet di-update di Singapura, sebuah pesan dikirim ke **Redis Pub/Sub Global** untuk memerintahkan penghapusan cache profil pet tersebut di wilayah US dan Europe.

## 4. Mekanisme Rekonsiliasi
Sistem menjalankan *Background Job* setiap 1 jam untuk membandingkan total saldo koin pemain di database utama dengan ringkasan transaksi. Jika ada selisih, sistem akan melakukan perbaikan otomatis (*auto-reconciliation*).
