# HAGUMI Disaster Recovery Plan (DRP)

Dokumen ini berisi prosedur darurat jika terjadi kegagalan sistem total atau bencana pada infrastruktur utama.

## 1. Klasifikasi Bencana
- **Level 1 (Kritis):** Database korup atau hilang.
- **Level 2 (Sangat Tinggi):** Wilayah hosting utama (Singapura) tumbang total.
- **Level 3 (Tinggi):** Layanan pihak ketiga (Stripe/Supabase Auth) tidak dapat diakses.

## 2. Prosedur Pemulihan (Recovery Steps)

### Skenario A: Kegagalan Wilayah Singapura
1. **Identifikasi:** Monitoring mendeteksi downtime > 5 menit di cluster Singapura.
2. **Alihkan Trafik:** Cloudflare Global Load Balancer otomatis mengalihkan trafik ke cluster US-East.
3. **Promosi Database:** Jika Primary DB di Singapura tidak dapat diakses, promosikan Read Replica di wilayah US menjadi Primary DB.
4. **Verifikasi:** Pastikan WebSocket dan Market berfungsi di wilayah baru.

### Skenario B: Kebocoran Data atau Peretasan
1. **Isolasi:** Matikan akses API publik segera (Maintenance Mode).
2. **Audit:** Identifikasi cakupan data yang terdampak.
3. **Restorasi:** Pulihkan database ke titik terakhir sebelum peretasan (PITR).
4. **Patching:** Terapkan perbaikan keamanan sebelum menghidupkan kembali layanan.

## 3. Target Pemulihan (RTO & RPO)
- **Recovery Time Objective (RTO):** < 15 menit untuk pemulihan layanan.
- **Recovery Point Objective (RPO):** < 5 menit kehilangan data maksimal.

## 4. Daftar Kontak Darurat (Emergency Contacts)
- **CTO:** [Name] - [Phone]
- **Lead DevOps:** [Name] - [Phone]
- **Cloud Support:** Cloudflare & Supabase Enterprise Support.
