# Maintenance Request Log

Aplikasi internal berbasis web untuk mengelola *Maintenance Request Log* di sebuah pabrik. Aplikasi ini memungkinkan **Operator** untuk membuat laporan kerusakan mesin, **Supervisor** untuk menyetujui atau menolak laporan tersebut, dan **Admin** untuk mengelola data secara keseluruhan.

Aplikasi ini dibangun menggunakan arsitektur *monorepo* yang memisahkan antara frontend dan backend, serta telah di-containerize menggunakan Docker untuk kemudahan *deployment*.

---

## Arsitektur & Keputusan Teknis (Key Decisions)

1. **Frontend (Nuxt / Vue 3)**
   - Menggunakan kerangka kerja Nuxt untuk *Server-Side Rendering (SSR)* dan performa yang lebih baik.
   - Konfigurasi environment (contoh: *Base API URL*) diatur fleksibel agar bisa berjalan baik di client-side (browser) maupun server-side di dalam ekosistem Docker.
2. **Backend (Hono dengan TypeScript)**
   - Menggunakan [Hono](https://hono.dev/), sebuah web framework modern, ringan, dan sangat cepat yang berjalan di atas environment Node.js/Edge.
   - Logika Role-Based Access Control (RBAC) diterapkan secara ketat di sisi server (backend) untuk memastikan keamanan.
3. **Database (PostgreSQL & Drizzle ORM)**
   - Menggunakan database relasional PostgreSQL.
   - Implementasi skema dan *query* menggunakan **Drizzle ORM** agar *type-safe* secara end-to-end dari database hingga ke endpoint API.
4. **Keamanan (JWT & Bcrypt)**
   - Autentikasi berbasis token menggunakan JWT (*JSON Web Tokens*).
   - Seluruh password di-hash menggunakan `bcryptjs` dan tidak pernah disimpan dalam bentuk *plain-text*.

---

## Tahapan Setup & Menjalankan Aplikasi

Aplikasi ini dapat dijalankan sepenuhnya dengan Docker dari _clean clone_.

1. **Clone repository ini:**
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Siapkan Environment Variables:**
   Copy file `.env.example` menjadi `.env` di root directory.
   ```bash
   cp .env.example .env
   ```
   *(Catatan: Anda tidak perlu mengubah isi `.env` untuk menjalankan environment lokal, semuanya sudah disiapkan default).*

3. **Jalankan Aplikasi dengan Docker Compose:**
   ```bash
   docker-compose up -d --build
   ```
   *Perintah ini akan secara otomatis melakukan build image untuk database, backend, dan frontend, serta menjalankan proses seeding database di backend.*

4. **Akses Aplikasi:**
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:3001
   - **Health Check:** http://localhost:3001/api/health

---

## Seeded Login Credentials

Database akan secara otomatis diisi (*seeded*) dengan data sampel pada saat backend pertama kali menyala. Gunakan kredensial berikut untuk menguji matriks perizinan (*permission matrix*):

| Role       | Email                      | Password         |
| ---------- | -------------------------- | ---------------- |
| Admin      | `admin@example.com`        | `Admin123!`      |
| Supervisor | `supervisor@example.com`   | `Supervisor123!` |
| Operator   | `operator@example.com`     | `Operator123!`   |

---

## CI/CD Pipeline (Jenkinsfile Stages)

Kami telah menyertakan sebuah `Jenkinsfile` (Declarative Pipeline) di root repositori untuk menggambarkan proses otomatisasi *Continuous Integration*. Berikut penjelasan setiap tahapannya (*stages*):

1. **Checkout**: Mengambil kode sumber terbaru (source code) dari version control (Git).
2. **Setup Node.js**: Memastikan environment CI menggunakan versi Node.js yang sesuai (versi 20) sebelum melakukan instalasi.
3. **Install Dependencies**: Menjalankan proses `npm install` secara **paralel** di direktori `backend` dan `frontend` agar proses CI berjalan lebih cepat.
4. **Test Backend**: Menjalankan *automated tests* (Vitest) untuk memastikan fungsi utama sistem, termasuk **RBAC Permission Matrix**, berjalan dengan benar dan tidak ada fitur yang *broken*.
5. **Build**: Melakukan *compile* kode TypeScript ke JavaScript (Backend) dan mem-build aset frontend (Nuxt) untuk *production* secara paralel.
6. **Docker Image Build**: Tahapan akhir untuk membungkus kode yang sudah lolos uji menjadi kontainer Docker yang siap di-*deploy* ke server *production*.

---

## Fitur Opsional (Bonus) yang Dikerjakan

1. **Meaningful Automated Tests**
   - Menulis test menggunakan **Vitest** (`backend/tests/rbac.test.ts`) untuk membuktikan matriks perizinan RBAC (Role-Based Access Control) berjalan dengan benar. Test menggunakan teknik *mocking database* sehingga eksekusi super cepat (<100ms).
2. **Health check endpoint and structured logging**
   - **Structured JSON Logging**: Setiap permintaan API dicatat dalam format log JSON (mencakup path, durasi, status, serta informasi user yang login). Cocok untuk monitoring di Elastic/Grafana.
   - **Health Check API**: Endpoint `GET /api/health` tanpa autentikasi yang merespons status `200 OK` jika database dapat dijangkau dan API berjalan normal, atau `503` jika koneksi database terputus.

---

## AI Disclosure

Saya menggunakan AI Coding Assistant dalam mengerjakan evaluasi tes ini. Berikut adalah rincian lengkap penggunaannya:

* **Tools yang digunakan:** Google Gemini (Antigravity IDE / Agentic AI).
* **Bagian kode yang dibantu:**
  - Setup environment otomatisasi dan kerangka testing menggunakan Vitest (`vitest.config.ts`, file setup).
  - Penulisan skrip pipeline (`Jenkinsfile`).
  - Pembuatan *middleware* untuk Structured Logging dan Endpoint Health Check.
* **Alasan penggunaan AI:** Saya menggunakan AI untuk menulis kode yang sifatnya _boilerplate_ dan rutin (seperti konfigurasi pipeline, *setup dependencies* testing, dan logger). Ini menghemat waktu sehingga saya bisa berfokus penuh merancang arsitektur monorepo, logika autentikasi, serta memastikan aturan logika RBAC (Core Requirements) aman dari eksploitasi API.
* **Kasus di mana saya menolak/merevisi kode dari AI:** 
  Ketika AI membuat *unit tests* untuk operasi penghapusan data (_delete request_) oleh **Supervisor**, AI membuat *test expectation* kosong yang seolah-olah sukses. Padahal berdasarkan spesifikasi aturan bisnis (Permission Matrix), Supervisor tidak boleh (_No_) melakukan hapus data (seharusnya merespon kode status 403 Forbidden). Saya menolak kode awal dari AI tersebut, menulis ulang blok ekspektasi *test* yang benar, dan secara manual menyisipkan logika _blocker_ `if (user.role === 'supervisor') { return 403 }` di rute `requests.ts` agar matriks yang diminta spesifikasi terpenuhi seratus persen.

---
**Catatan & Keterbatasan (Known Limitations):**
- Karena fokus penilaian pada kehandalan infrastruktur dan spesifikasi *backend*, antarmuka (UI) frontend mungkin dibuat ringkas tanpa desain *custom* berlebihan.
- Docker environment dirancang untuk kemudahan *local testing*. Untuk deployment asli, konfigurasi *network*, SSL, dan *secret rotation* perlu ditambahkan.
