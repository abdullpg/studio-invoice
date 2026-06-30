# Studio Invoice

Sistem invoice untuk producer musik — **offline & lokal**, dibangun dengan Next.js + SQLite (WAL).
Tetap mempertahankan elemen khasnya: **status pembayaran sebagai stempel visual** (LUNAS / BELUM LUNAS) di invoice.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma 6** ORM → **SQLite (mode WAL)**, file-based, portable
- **Auth.js v5 (NextAuth)** — Credentials, 1 akun producer
- **react-hook-form + zod** untuk form & validasi
- **html2canvas-pro + jsPDF** untuk export JPG/PDF

> Versi ini sengaja memakai SQLite (bukan Postgres) supaya bisa jalan **sepenuhnya offline** di satu komputer. Seluruh data ada di satu file `prisma/dev.db` yang gampang di-backup & dipindah.

## Prasyarat

- Node.js 18+ (diuji di Node 24)

## Setup Awal

```bash
# 1. Install dependency
npm install

# 2. Siapkan environment
#    Salin .env.example -> .env lalu isi nilainya
cp .env.example .env
#    Generate AUTH_SECRET:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
#    Tempel hasilnya ke AUTH_SECRET di .env

# 3. Buat database + tabel, lalu seed akun & profil default
npm run db:deploy
npm run db:seed
```

### Akun login default (dari `.env`)

| Field    | Nilai                   |
| -------- | ----------------------- |
| Email    | `producer@studio.local` |
| Password | `changeme123`           |

Ubah `SEED_EMAIL` / `SEED_PASSWORD` di `.env` lalu jalankan `npm run db:seed` lagi untuk memperbarui kredensial.

## Menjalankan

```bash
# Mode development (hot reload)
npm run dev
# buka http://localhost:3000

# Mode produksi lokal
npm run build
npm start
```

## Fitur

- CRUD invoice (buat, lihat, edit, hapus)
- Multi-item per invoice (deskripsi, qty, harga) dengan baris dinamis
- Diskon persen / nominal, terhitung otomatis
- Multi mata uang per-invoice: IDR / USD / EUR / simbol custom
- Status bayar (Lunas / Belum Lunas) → **stempel visual** di preview & export
- Nomor invoice otomatis `INV-{tahun}-{4 digit}`, di-generate server-side & transaksional (reset tiap ganti tahun)
- Riwayat invoice: pencarian (nomor/klien), filter status, pagination (>20 baris)
- Export **JPG** & **PDF** dari halaman detail
- Pengaturan profil studio + upload logo (`/public/uploads`)
- Login terproteksi (proxy/middleware NextAuth) — semua route butuh login
- Dark mode

## Script

| Perintah             | Fungsi                                  |
| -------------------- | --------------------------------------- |
| `npm run dev`        | Dev server                              |
| `npm run build`      | Build produksi                          |
| `npm start`          | Jalankan hasil build                    |
| `npm run db:migrate` | Buat migration baru saat schema berubah |
| `npm run db:deploy`  | Terapkan semua migration ke database    |
| `npm run db:seed`    | Seed akun producer + profil + sequence  |
| `npm run db:studio`  | Prisma Studio (GUI lihat/edit data)     |

## Backup & Portabilitas

Karena SQLite, **seluruh database = satu file** `prisma/dev.db`.

### Backup

Salin file-nya (matikan dulu server agar konsisten):

```powershell
Copy-Item prisma\dev.db "backup-invoice-$(Get-Date -Format yyyyMMdd).db"
```

> Saat server jalan ada juga `dev.db-wal` & `dev.db-shm` (Write-Ahead Log).
> Untuk backup paling aman, hentikan server dulu agar WAL ter-checkpoint ke `dev.db`.

### Restore / pindah komputer

Salin `prisma/dev.db` ke komputer baru (path yang sama), `npm install`, lalu `npm run dev`.

### Migrasi ke database lain (mis. Postgres) nanti

1. Ganti `provider` di `prisma/schema.prisma` ke `postgresql` dan `DATABASE_URL` di `.env`.
2. Jalankan `npx prisma migrate deploy` di database baru.
3. Pindahkan data. Karena semua akses lewat Prisma, kode aplikasi tidak perlu diubah.

## Struktur Proyek

```
app/
  (auth)/login/              # halaman login
  (dashboard)/
    invoices/                # riwayat, buat, detail, edit
    settings/                # profil studio
  api/                       # invoices, settings, upload, auth, next-number
components/                  # form, preview, stempel, tabel, shell, ui/ (shadcn)
lib/                         # prisma, auth, currency, totals, validations, export, dll
prisma/
  schema.prisma
  migrations/                # history schema (commit ke git)
  seed.ts
proxy.ts                     # proteksi route (NextAuth, edge-safe)
```

## Catatan WAL

Mode WAL diaktifkan otomatis di `lib/prisma.ts` (`PRAGMA journal_mode=WAL`) untuk konkurensi baca/tulis yang lebih baik. Pengaturan ini tersimpan permanen di header database.
