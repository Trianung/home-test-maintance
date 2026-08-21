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

Dalam pengerjaan home test ini, saya menggunakan **AI Coding Assistant sebagai supporting tool** untuk membantu proses pengembangan aplikasi. AI digunakan sebagai pendamping dalam melakukan brainstorming, mengeksplorasi alternatif solusi, berdiskusi mengenai arsitektur dan pendekatan implementasi, serta membantu proses problem solving dan debugging ketika terdapat kendala teknis selama pengerjaan.

**ChatGPT** digunakan terutama sebagai *technical discussion partner* untuk membantu brainstorming, mengevaluasi alternatif arsitektur, mendiskusikan pendekatan authentication, authorization, RBAC, Dockerization, automated testing, serta membantu menganalisis dan memecahkan masalah teknis yang ditemukan selama proses pengembangan. ChatGPT juga digunakan untuk membantu melakukan review terhadap pendekatan implementasi sebelum dilakukan validasi lebih lanjut.

Sementara itu, **Google Gemini** digunakan sebagai coding assistant yang membantu proses implementasi dan pekerjaan yang bersifat boilerplate, konfigurasi environment, automated testing, Jenkins pipeline, middleware, structured logging, health check, serta membantu proses debugging dan *error solving* secara langsung selama pengembangan.

Penggunaan AI dalam proses ini tidak menggantikan proses analisis dan pengambilan keputusan teknis. Setiap saran, kode, maupun solusi yang dihasilkan oleh AI tetap diperiksa, disesuaikan, dan divalidasi secara manual berdasarkan requirement home test, business logic, security consideration, permission matrix, serta hasil pengujian aplikasi. Keputusan akhir mengenai arsitektur, implementasi, dan validasi sistem tetap dilakukan secara manual oleh developer.

AI digunakan sebagai alat bantu untuk meningkatkan efisiensi proses development, sementara pemahaman terhadap requirement, implementasi final, pengujian, dan tanggung jawab terhadap hasil akhir aplikasi tetap berada pada developer.

---
**Catatan & Keterbatasan (Known Limitations):**
Implementasi aplikasi ini difokuskan pada pemenuhan requirement utama home test, reliability backend, RBAC, automated testing, serta reproducible local environment menggunakan Docker. Oleh karena itu, beberapa aspek yang umumnya diperlukan untuk production deployment belum menjadi bagian dari scope pengerjaan, seperti konfigurasi SSL/TLS, secret rotation, reverse proxy, production-grade monitoring, dan container security hardening.

Frontend juga dibuat dengan fokus pada kebutuhan fungsional dan integrasi dengan backend, sehingga tidak ditujukan sebagai implementasi UI/UX production-grade.

Jenkinsfile disediakan untuk menggambarkan rancangan proses CI/CD dan dapat dibaca serta dievaluasi oleh reviewer, namun pipeline tidak dijalankan pada Jenkins server selama pengerjaan home test.
