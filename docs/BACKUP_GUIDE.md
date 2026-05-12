# HAGUMI Backup Strategy Guide

Dokumen ini menjelaskan prosedur pencadangan (backup) data untuk memastikan keamanan dan ketersediaan data HAGUMI dalam jangka panjang.

## 1. Pencadangan Database (Supabase/PostgreSQL)
Pencadangan database dilakukan secara otomatis melalui fitur Supabase:
- **Daily Backups:** Database dicadangkan secara otomatis setiap 24 jam.
- **Point-in-Time Recovery (PITR):** Memungkinkan pemulihan data ke detik tertentu dalam 7 hari terakhir (tersedia di paket Pro).
- **Manual Backups:** Dilakukan sebelum melakukan migrasi skema database besar menggunakan perintah:
  ```bash
  supabase db dump --remote > backups/db_manual_backup_$(date +%F).sql
  ```

## 2. Pencadangan Asset (Storage)
Aset pengguna (gambar profil, kustomisasi pet) disimpan di Supabase Storage:
- **Versioning:** Fitur versioning diaktifkan pada bucket storage utama.
- **Replikasi:** Aset direplikasi secara otomatis ke wilayah lain (Multi-region Storage).

## 3. Retensi Data
- **Harian:** Disimpan selama 30 hari.
- **Bulanan:** Disimpan selama 12 bulan.
- **Tahunan:** Disimpan selama 7 tahun (untuk data kepatuhan keuangan).

## 4. Enkripsi Backup
Semua file cadangan dienkripsi menggunakan standar **AES-256** saat diam (*at rest*) dan saat dikirim (*in transit*). Kunci enkripsi dikelola secara terpusat melalui sistem Manajemen Kunci (KMS).

## 5. Uji Coba Restorasi (Restoration Testing)
Setiap 3 bulan, tim infrastruktur wajib melakukan simulasi restorasi data ke lingkungan *Staging* untuk memastikan file cadangan tidak rusak dan prosedur pemulihan berfungsi dengan baik.
