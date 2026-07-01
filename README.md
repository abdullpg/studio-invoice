# 🧾 Studio Invoice

Aplikasi pembuat invoice (nota tagihan) untuk **producer musik**. Berjalan **offline di komputermu sendiri** — tidak perlu internet, tidak perlu bayar server. Semua data tersimpan di satu file di laptop/PC-mu.

Ciri khasnya: status pembayaran tampil sebagai **stempel** **LUNAS** (hijau) / **BELUM LUNAS** (merah) di atas invoice, persis seperti distempel manual.

> Panduan ini ditulis untuk pemula. Ikuti langkah demi langkah, tidak perlu paham coding.

---

## ✨ Fitur

- **Buat, lihat, edit, hapus invoice** dengan mudah
- **Banyak item** per invoice (deskripsi, jumlah, harga satuan)
- **Diskon** otomatis — bisa persen (%) atau angka tetap (nominal)
- **Banyak mata uang**: Rupiah, USD, Euro, atau simbol custom — beda-beda per invoice
- **Stempel LUNAS / BELUM LUNAS** di invoice
- **Nomor invoice otomatis** berformat `INV-2026-0001` (urut sendiri, reset tiap ganti tahun)
- **Riwayat invoice**: cari berdasarkan nomor/nama klien, filter status, pagination
- **Export ke JPG & PDF** untuk dikirim ke klien
- **Profil studio**: nama, alamat, kontak, rekening, dan **logo** — tampil di setiap invoice
- **Login** sederhana supaya invoice-mu tidak bisa dibuka orang lain
- **Mode terang & gelap** (dark mode)
- **Tampilan responsif**: nyaman dipakai di **HP maupun komputer**

---

## 🧰 Langkah 1 — Pasang Node.js (sekali saja)

Aplikasi ini butuh **Node.js versi 18 atau lebih baru**. Cek dulu apakah sudah ada — buka terminal lalu ketik:

```bash
node --version
```

Kalau muncul angka seperti `v18.x` atau lebih tinggi, lewati langkah ini. Kalau muncul error "command not found", pasang dulu:

### 🪟 Windows
1. Buka <https://nodejs.org> → unduh versi **LTS**.
2. Jalankan installer, klik **Next** sampai selesai.
3. Tutup lalu buka lagi terminal (PowerShell).

### 🍎 macOS
- Cara termudah: unduh installer **LTS** dari <https://nodejs.org>, lalu jalankan.
- Atau lewat [Homebrew](https://brew.sh): `brew install node`

### 🐧 Linux (Ubuntu/Debian)
```bash
sudo apt update && sudo apt install -y nodejs npm
```
> Kalau versinya terlalu lama, pakai [nvm](https://github.com/nvm-sh/nvm): `nvm install 20`

---

## 🚀 Langkah 2 — Siapkan aplikasi (sekali saja)

Buka terminal **di dalam folder project ini**, lalu jalankan perintah berikut **berurutan**.

### 1) Pasang semua komponen aplikasi
```bash
npm install
```

### 2) Buat file pengaturan `.env`

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```
**macOS / Linux:**
```bash
cp .env.example .env
```

### 3) Buat kunci keamanan login

Jalankan perintah ini, lalu **salin hasilnya**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Buka file `.env`, tempel hasil tadi ke dalam tanda kutip `AUTH_SECRET`, contoh:
```
AUTH_SECRET="hAsiL-AcAk-yAng-tAdi-disALin="
```

### 4) Siapkan database & akun login
```bash
npm run db:deploy
npm run db:seed
```

Selesai! Setup hanya perlu dilakukan sekali.

---

## ▶️ Langkah 3 — Menjalankan aplikasi

Setiap kali ingin memakai aplikasi:

```bash
npm run dev
```

Lalu buka browser ke 👉 **<http://localhost:3000>**

Untuk menghentikan, tekan **Ctrl + C** di terminal.

### 🔑 Login pertama kali

| | |
| -------- | ----------------------- |
| Email    | `producer@studio.local` |
| Password | `changeme123`           |

> **Ganti password!** Buka file `.env`, ubah `SEED_EMAIL` dan `SEED_PASSWORD` sesukamu, lalu jalankan `npm run db:seed` sekali lagi.

---

## 📖 Cara pakai singkat

1. **Atur profil studio dulu** → menu **Pengaturan**. Isi nama studio, kontak, rekening, dan upload logo. Ini akan muncul di semua invoice.
2. **Buat invoice** → menu **Buat Baru**. Isi nama klien, tambah item (deskripsi + jumlah + harga), atur diskon & mata uang bila perlu, pilih status Lunas/Belum, lalu **Simpan**.
3. **Lihat & kelola** → menu **Invoice**. Klik salah satu untuk melihat detail.
4. **Kirim ke klien** → di halaman detail, klik **JPG** atau **PDF** untuk mengunduh.
5. **Ubah status** kapan saja dengan tombol **Tandai Lunas / Tandai Belum Lunas**.

---

## 💾 Backup data (penting!)

Semua data ada di **satu file**: `prisma/dev.db`. Untuk backup, cukup **salin file itu** ke tempat aman (flashdisk, cloud, dll). Hentikan aplikasi dulu (Ctrl + C) agar aman.

**Windows (PowerShell):**
```powershell
Copy-Item prisma\dev.db "backup-$(Get-Date -Format yyyyMMdd).db"
```
**macOS / Linux:**
```bash
cp prisma/dev.db "backup-$(date +%Y%m%d).db"
```

**Restore / pindah ke komputer lain:** salin folder project + file `prisma/dev.db`, jalankan `npm install`, lalu `npm run dev`.

---

## 🆘 Masalah umum

| Masalah | Solusi |
| --- | --- |
| `node: command not found` | Node.js belum terpasang — ulangi Langkah 1. |
| Port 3000 sudah dipakai | Jalankan di port lain: `npm run dev -- -p 3001` lalu buka `localhost:3001`. |
| Lupa password | Ubah `SEED_PASSWORD` di `.env`, jalankan `npm run db:seed` lagi. |
| Mau lihat/edit data mentah | `npm run db:studio` (membuka tampilan tabel di browser). |
| Halaman error setelah update kode | Hentikan (Ctrl + C), jalankan `npm install` lalu `npm run dev` lagi. |

---

## 🏭 Mode produksi (opsional, lebih cepat)

Kalau aplikasi sudah stabil dan ingin versi lebih ngebut:
```bash
npm run build
npm start
```

---

## 🗂️ Daftar perintah

| Perintah             | Fungsi                                   |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Menjalankan aplikasi (mode harian)       |
| `npm run build`      | Membuat versi produksi                   |
| `npm start`          | Menjalankan versi produksi               |
| `npm run db:seed`    | Membuat/menyetel ulang akun login        |
| `npm run db:studio`  | Membuka GUI untuk melihat data           |
| `npm run db:deploy`  | Menyiapkan tabel database                |

---

## 🧱 Untuk yang penasaran (teknis)

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Prisma 6** + **SQLite (mode WAL)** → database 1 file, gampang dipindah
- **Auth.js v5 (NextAuth)** untuk login
- **react-hook-form + zod** untuk form & validasi
- **html2canvas-pro + jsPDF** untuk export JPG/PDF

<details>
<summary>Struktur folder</summary>

```
app/
  (auth)/login/        # halaman login
  (dashboard)/         # invoices (list/buat/detail/edit) + settings
  api/                 # endpoint: invoices, settings, upload, auth
components/            # form, preview, stempel, tabel, shell, ui/ (shadcn)
lib/                   # prisma, auth, currency, totals, validations, export
prisma/
  schema.prisma        # struktur database
  migrations/          # riwayat perubahan struktur
  dev.db               # ← DATABASE-MU (backup file ini)
proxy.ts               # proteksi login antar-halaman
```
</details>

<details>
<summary>Pindah ke database lain (mis. PostgreSQL) nanti</summary>

Karena memakai Prisma, pindah database tidak mengubah kode aplikasi:
1. Ubah `provider` di `prisma/schema.prisma` menjadi `postgresql`.
2. Ganti `DATABASE_URL` di `.env` ke alamat database baru.
3. Jalankan `npx prisma migrate deploy`.
</details>
