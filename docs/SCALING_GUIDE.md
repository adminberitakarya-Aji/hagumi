# HAGUMI Scaling & Infrastructure Guide

Panduan ini menjelaskan cara mengelola dan menskalakan infrastruktur HAGUMI yang berbasis Kubernetes dan Docker.

## 1. Containerization (Docker)
Seluruh layanan HAGUMI sudah ter-kontainerisasi:
- **Backend:** `backend/Dockerfile` (Go optimized alpine)
- **Frontend:** `Dockerfile.frontend` (Nginx serving static React build)

### Menjalankan Lokal (Development)
Gunakan Docker Compose untuk menjalankan seluruh stack termasuk Redis:
```bash
docker-compose up -d
```

## 2. Orchestration (Kubernetes)
Manifes Kubernetes terletak di folder `/k8s`.

### Deployment & Services
Layanan backend dan frontend dipisahkan untuk skalabilitas independen.
- **Backend Replicas:** Default 3 unit.
- **Frontend Replicas:** Default 2 unit.

### Auto-scaling (HPA)
HAGUMI menggunakan **Horizontal Pod Autoscaler** untuk backend:
- **Min Replicas:** 3
- **Max Replicas:** 10
- **Threshold:** 70% CPU atau 80% Memory.

Jika trafik meningkat (misal: saat event khusus), Kubernetes akan otomatis menambah pod backend untuk menjaga performa game tetap stabil.

## 3. Monitoring Health
Setiap kontainer dilengkapi dengan `healthcheck`:
- **Docker Compose:** Menggunakan `wget` ke endpoint `/health`.
- **Kubernetes:** Menggunakan `livenessProbe` dan `readinessProbe` untuk memastikan trafik hanya dikirim ke pod yang sehat.

## 4. Ingress & WebSocket
Konfigurasi Ingress mendukung sinkronisasi WebSocket. Pastikan load balancer di depan Kubernetes mendukung sticky sessions jika diperlukan di masa depan.
