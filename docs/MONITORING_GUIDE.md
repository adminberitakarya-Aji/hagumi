# HAGUMI Monitoring & Observability Guide

Dokumen ini menjelaskan infrastruktur pemantauan (monitoring) HAGUMI untuk memastikan kesehatan sistem kelas dunia.

## 1. Pemantauan Aplikasi (Application Monitoring)
HAGUMI menggunakan pendekatan terpusat untuk metrik:
- **Metrik Runtime:** Dipantau via `backend/monitoring/infrastructure.go`. Memantau memori heap, jumlah goroutine, dan status koneksi database.
- **Error Tracking:** Menggunakan **Sentry** di Frontend dan Backend untuk menangkap *stack trace* setiap kali terjadi error.
- **Log Aggregation:** Log aplikasi dikirim ke **Grafana Loki** atau **Datadog** menggunakan format terstruktur JSON.

## 2. Dashboard & Alerting
- **Grafana Dashboard:** Menampilkan grafik real-time untuk:
    - Jumlah koneksi WebSocket aktif.
    - Durasi rata-rata *Game Tick*.
    - Penggunaan CPU/RAM per wilayah.
- **Alerting Rules:**
    - **P1 (Kritis):** Jika database tidak dapat diakses > 30 detik (Alert via PagerDuty).
    - **P2 (Tinggi):** Jika penggunaan memori > 80% selama 5 menit (Alert via Slack).

## 3. Uptime Monitoring
Pengecekan eksternal via **Better Stack** atau **UptimeRobot** dilakukan setiap 1 menit ke endpoint `/health` di semua wilayah (Singapura, US, Eropa).
