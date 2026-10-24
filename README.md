# REST API Sistem Manajemen Perpustakaan "aku"

## 1. Deskripsi Proyek
Proyek ini adalah sistem backend untuk memanajemen operasional perpustakaan, dikembangkan oleh Nathan Rajendra Hadi. Sistem ini melayani pendataan buku, pendaftaran anggota, pencatatan transaksi peminjaman dan pengembalian, serta pencatatan log (riwayat) secara otomatis. Proyek ini dibangun menggunakan **Node.js, Express.js**, dan menggunakan **PostgreSQL (Supabase)** sebagai database utama.

## 2. Link Deployment
API ini telah di-*deploy* dan dapat diakses secara publik melalui Vercel pada tautan berikut:
- **Base URL:** `https://<URL-VERCEL-ANDA>.vercel.app` *(Catatan: Ganti dengan URL Vercel asli Anda)*

## 3. Skema Database (ERD)
Database terdiri dari 5 tabel relasional:
1. `anggota`: Menyimpan data unik pengunjung (id_anggota, nik, nama, kontak).
2. `pustakawan`: Menyimpan data admin/pustakawan (id_pustakawan, username, password, nama).
3. `buku`: Menyimpan data pustaka (id_buku, judul, penulis, tahun_terbit, penerbit).
4. `peminjaman`: Menghubungkan tabel anggota dan buku untuk mencatat transaksi (id_peminjaman, id_anggota, id_buku, tanggal, status).
5. `log_transaksi`: Mencatat jejak aktivitas peminjaman/pengembalian (id_log, id_peminjaman, jenis_log, waktu_log).

*(Tambahkan gambar screenshot ERD Anda di bawah ini dengan format `![ERD Perpustakaan](link-gambar)`)*

---

## 4. Dokumentasi Endpoint API

### A. Endpoint Buku (Resource Utama)

#### 1. Tambah Buku Baru
- **Method** : POST
- **URL** : `https://<URL-VERCEL-ANDA>.vercel.app/buku`
- **Deskripsi** : Menambahkan data buku baru ke dalam sistem perpustakaan.
- **Headers** : `Content-Type: application/json`
- **Request Body** :
  ```json
  {
    "judul": "Sistem Basis Data",
    "penulis": "Nathan Rajendra",
    "tahun_terbit": 2024,
    "penerbit": "Informatika"
  }
  ```
- **Response Sukses (201)**:
  ```json
  {
    "message": "Buku berhasil ditambahkan",
    "data": { 
      "id_buku": 1, 
      "judul": "Sistem Basis Data",
      "penulis": "Nathan Rajendra",
      "tahun_terbit": 2024,
      "penerbit": "Informatika"
    }
  }
  ```
- **Response Error (400)**:
  ```json
  { "error": "Semua field buku wajib diisi" }
  ```

#### 2. Cari/Tampilkan Buku
- **Method** : GET
- **URL** : `https://<URL-VERCEL-ANDA>.vercel.app/buku` atau `.../buku?keyword=sistem`
- **Deskripsi** : Mengambil semua daftar buku atau mencari buku berdasarkan judul/penulis/penerbit.
- **Headers** : *None*
- **Response Sukses (200)**:
  ```json
  {
    "data": [
      {
        "id_buku": 1,
        "judul": "Sistem Basis Data",
        "penulis": "Nathan Rajendra",
        "tahun_terbit": 2024,
        "penerbit": "Informatika"
      }
    ]
  }
  ```

#### 3. Ubah Data Buku
- **Method** : PUT
- **URL** : `https://<URL-VERCEL-ANDA>.vercel.app/buku/:id` (Ganti `:id` dengan id buku)
- **Deskripsi** : Memperbarui keseluruhan data buku berdasarkan ID.
- **Headers** : `Content-Type: application/json`
- **Request Body** :
  ```json
  {
    "judul": "Sistem Basis Data (Revisi)",
    "penulis": "Nathan Rajendra",
    "tahun_terbit": 2025,
    "penerbit": "Informatika"
  }
  ```
- **Response Sukses (200)**:
  ```json
  {
    "message": "Buku berhasil diperbarui",
    "data": { "id_buku": 1, "judul": "Sistem Basis Data (Revisi)" }
  }
  ```

#### 4. Hapus Buku
- **Method** : DELETE
- **URL** : `https://<URL-VERCEL-ANDA>.vercel.app/buku/:id`
- **Deskripsi** : Menghapus data buku dari sistem berdasarkan ID.
- **Headers** : *None*
- **Response Sukses (200)**:
  ```json
  { "message": "Buku berhasil dihapus" }
  ```
- **Response Error (404)**:
  ```json
  { "error": "Buku tidak ditemukan" }
  ```

---

### B. Endpoint Anggota

#### 5. Registrasi Anggota
- **Method** : POST
- **URL** : `https://<URL-VERCEL-ANDA>.vercel.app/anggota`
- **Deskripsi** : Mendaftarkan pengunjung sebagai anggota perpustakaan baru.
- **Headers** : `Content-Type: application/json`
- **Request Body** :
  ```json
  {
    "nama": "Andi Darmawan",
    "nik": "330123456789",
    "kontak": "081234567890"
  }
  ```
- **Response Sukses (201)**:
  ```json
  {
    "message": "Anggota berhasil didaftarkan",
    "data": { "id_anggota": 1, "nama": "Andi Darmawan" }
  }
  ```

---

### C. Endpoint Transaksi (Peminjaman & Log)

#### 6. Pinjam Buku
- **Method** : POST
- **URL** : `https://<URL-VERCEL-ANDA>.vercel.app/peminjaman`
- **Deskripsi** : Memproses peminjaman buku oleh anggota (otomatis memicu Log Peminjaman).
- **Headers** : `Content-Type: application/json`
- **Request Body** :
  ```json
  {
    "id_anggota": 1,
    "id_buku": 1
  }
  ```
- **Response Sukses (201)**:
  ```json
  {
    "message": "Buku berhasil dipinjam",
    "data": { 
      "id_peminjaman": 1, 
      "id_anggota": 1, 
      "id_buku": 1,
      "status_peminjaman": "Dipinjam"
    }
  }
  ```

#### 7. Kembalikan Buku
- **Method** : PUT
- **URL** : `https://<URL-VERCEL-ANDA>.vercel.app/peminjaman/:id` (Ganti `:id` dengan id peminjaman)
- **Deskripsi** : Memproses pengembalian buku (otomatis memicu Log Pengembalian).
- **Headers** : *None*
- **Response Sukses (200)**:
  ```json
  {
    "message": "Buku berhasil dikembalikan",
    "data": { "id_peminjaman": 1, "status_peminjaman": "Dikembalikan" }
  }
  ```

#### 8. Tampilkan Laporan Log Transaksi
- **Method** : GET
- **URL** : `https://<URL-VERCEL-ANDA>.vercel.app/laporan`
- **Deskripsi** : Menampilkan jejak rekam transaksi keluar masuknya buku secara *real-time*.
- **Headers** : *None*
- **Response Sukses (200)**:
  ```json
  {
    "data": [
      {
        "id_log": 2,
        "jenis_log": "Pengembalian",
        "waktu_log": "2024-11-20T10:30:00.000Z",
        "status_peminjaman": "Dikembalikan",
        "peminjam": "Andi Darmawan",
        "buku": "Sistem Basis Data"
      },
      {
        "id_log": 1,
        "jenis_log": "Peminjaman",
        "waktu_log": "2024-11-15T09:00:00.000Z",
        "status_peminjaman": "Dikembalikan",
        "peminjam": "Andi Darmawan",
        "buku": "Sistem Basis Data"
      }
    ]
  }
  ```

---

## 5. Cara Menjalankan Project Secara Lokal

Jika penilai ingin menjalankan API ini pada *environment* lokal (localhost), ikuti langkah berikut:

1. **Clone Repository**
   ```bash
   git clone <URL-GITHUB-REPO-ANDA>
   cd <NAMA-FOLDER-REPO>
   ```

2. **Install Dependensi**
   Pastikan Node.js sudah terinstal, lalu jalankan:
   ```bash
   npm install
   ```

3. **Konfigurasi Database**
   Buat file bernama `.env` di *root* folder, lalu isi dengan URL koneksi database PostgreSQL Anda:
   ```env
   DATABASE_URL=postgresql://username:password@host:port/nama_database
   ```
   *(Pastikan Anda telah menjalankan tabel skema SQL bawaan proyek ke database tersebut).*

4. **Jalankan Server**
   ```bash
   node index.js
   ```
   Server akan berjalan di `http://localhost:3000`. Silakan gunakan Postman atau Thunder Client untuk melakukan pengujian *endpoint*.