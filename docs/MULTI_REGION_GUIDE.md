# HAGUMI Multi-region Deployment Guide

Panduan ini menjelaskan strategi penyebaran HAGUMI ke berbagai wilayah geografis untuk meminimalkan latensi bagi pemain global.

## 1. Topologi Wilayah (Target Regions)
Untuk tahap awal, HAGUMI akan di-deploy ke tiga wilayah utama:
- **Asia-Southeast (Singapore):** Melayani pemain di Asia dan Australia.
- **US-East (N. Virginia):** Melayani pemain di Amerika Utara dan Selatan.
- **Europe-West (Belgium):** Melayani pemain di Eropa dan Afrika.

## 2. Arsitektur Data (Database & Replication)
HAGUMI menggunakan **Supabase (PostgreSQL)** sebagai pusat data.
- **Primary Region:** Asia-Southeast (Singapore).
- **Read Replicas:** US-East dan Europe-West.
- **Strategy:** Penulisan data (*Write*) selalu diarahkan ke Primary Region, sedangkan pembacaan data (*Read*) dilakukan di replika lokal wilayah tersebut untuk mempercepat loading profil dan market.

## 3. Global Load Balancing (GSLB)
Kita menggunakan **Cloudflare Global Load Balancer** untuk mengarahkan trafik:
- **Geo-Routing:** Pemain dari Jakarta akan otomatis diarahkan ke cluster Singapura. Pemain dari New York ke cluster Virginia.
- **Failover:** Jika cluster Singapura tumbang, trafik Asia akan otomatis dialihkan ke Virginia atau Belgia secara transparan.

## 4. Sinkronisasi WebSocket (Redis Pub/Sub)
Untuk fitur sosial antar wilayah:
- Setiap wilayah memiliki cluster **Redis** lokal.
- Menggunakan **Redis Global Datastore** atau *Bridge* antar wilayah agar pemain di Singapura bisa chat secara real-time dengan pemain di New York.

## 5. Implementasi Kubernetes
Gunakan manifes di `/k8s/multi-region/` untuk menerapkan konfigurasi spesifik wilayah (seperti limit sumber daya dan variabel lingkungan wilayah).
