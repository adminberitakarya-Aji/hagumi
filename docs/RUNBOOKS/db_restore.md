# Runbook: Pemulihan Database (Database Restoration)

Gunakan panduan ini jika terjadi kerusakan data pada database produksi HAGUMI.

## Prasyarat
- Akses Admin ke Dashboard Supabase.
- CLI Supabase terinstal di komputer lokal.

## Langkah-langkah Pemulihan

### 1. Masuk ke Mode Pemeliharaan
Pastikan tidak ada penulisan data baru selama proses pemulihan.
```bash
# Set environment variable untuk mengaktifkan maintenance mode di App
MAINTENANCE_MODE=true
```

### 2. Identifikasi Titik Pemulihan (PITR)
Cari tahu kapan tepatnya data mulai rusak melalui log transaksi atau laporan pengguna.

### 3. Eksekusi Restorasi via Dashboard
1. Buka **Supabase Dashboard** -> **Settings** -> **Database**.
2. Pilih menu **Backups**.
3. Klik **Restore** pada titik waktu yang diinginkan (Point-in-Time).
4. Tunggu proses restorasi selesai (Biasanya 5-10 menit tergantung ukuran data).

### 4. Verifikasi Integritas Data
Jalankan query pengecekan saldo koin dan status pet secara acak:
```sql
SELECT count(*) FROM pets WHERE stage = 'egg';
SELECT sum(coins) FROM profiles;
```

### 5. Hidupkan Kembali Layanan
Hapus mode pemeliharaan dan pantau log error pada backend.
