# REST API Sistem Manajemen Perpustakaan "aku"

## 1. Deskripsi Proyek

Proyek ini adalah sistem backend untuk memanajemen operasional perpustakaan, dikembangkan oleh Nathan Rajendra Hadi. Sistem ini melayani pendataan buku, pendaftaran anggota, pencatatan transaksi peminjaman dan pengembalian, serta pencatatan log (riwayat) secara otomatis. Proyek ini dibangun menggunakan **Python (FastAPI)** dan menggunakan **PostgreSQL (Supabase)** sebagai database utama.

* **Repository GitHub:** [Sumardi67/Tugas-Akhir-Learning-Labs-Backend-Development](https://github.com/Sumardi67/Tugas-Akhir-Learning-Labs-Backend-Development)

## 2. Link Deployment

API ini telah di-*deploy* dan dapat diakses secara publik melalui Vercel pada tautan berikut:

* **Base URL API:** `https://tugas-akhir-learning-labs-backend-d.vercel.app`

* **Dashboard Vercel:** [Link Dashboard](https://vercel.com/nathanrajendrahadi-7224/tugas-akhir-learning-labs-backend-development)

## 3. Skema Database (ERD)

Database terdiri dari 5 tabel relasional:

1. `anggota`: Menyimpan data unik pengunjung (id_anggota, nik, nama, kontak).

2. `pustakawan`: Menyimpan data admin/pustakawan (id_pustakawan, username, password, nama).

3. `buku`: Menyimpan data pustaka (id_buku, judul, penulis, tahun_terbit, penerbit).

4. `peminjaman`: Menghubungkan tabel anggota dan buku untuk mencatat transaksi (id_peminjaman, id_anggota, id_buku, tanggal, status).

5. `log_transaksi`: Mencatat jejak aktivitas peminjaman/pengembalian (id_log, id_peminjaman, jenis_log, waktu_log).

## 4. Dokumentasi Endpoint API & Bukti Pengujian

### A. Endpoint Buku (Resource Utama)

#### 1. Tambah Buku Baru

* **Method** : POST

* **URL** : `https://tugas-akhir-learning-labs-backend-d.vercel.app/buku`

* **Deskripsi** : Menambahkan data buku baru ke dalam sistem perpustakaan.

* **Headers** : `Content-Type: application/json`

* **Request Body** :

  ```
  {
    "judul": "Sistem Basis Data",
    "penulis": "Nathan Rajendra",
    "tahun_terbit": 2024,
    "penerbit": "Informatika"
  }
  
  ```

* **Response Sukses (201)**:

  ```
  {
    "message": "Buku berhasil ditambahkan",
    "data": { 
      "id_buku": 2, 
      "judul": "Sistem Basis Data",
      "penulis": "Nathan Rajendra",
      "tahun_terbit": 2024,
      "penerbit": "Informatika"
    }
  }
  
  ```

* **Bukti Pengujian:**
  <img width="640" height="338" alt="Screenshot 2026-10-24 145550" src="https://github.com/user-attachments/assets/c68d1158-bdc0-4df5-a2c0-e7e8a80a720b" />

#### 2. Cari/Tampilkan Buku

* **Method** : GET

* **URL** : `https://tugas-akhir-learning-labs-backend-d.vercel.app/buku`

* **Deskripsi** : Mengambil semua daftar buku atau mencari buku berdasarkan judul/penulis/penerbit.

* **Headers** : *None*

* **Response Sukses (200)**:

  ```
  {
    "data": [
      {
        "id_buku": 1,
        "judul": "Sistem Basis Data",
        "penulis": "Nathan Rajendra",
        "tahun_terbit": 2024,
        "penerbit": "Informatika"
      },
      {
        "id_buku": 2,
        "judul": "Sistem Basis Data",
        "penulis": "Nathan Rajendra",
        "tahun_terbit": 2024,
        "penerbit": "Informatika"
      }
    ]
  }
  
  ```

* **Bukti Pengujian:**
  <img width="640" height="335" alt="Screenshot 2026-10-24 151415" src="https://github.com/user-attachments/assets/a0e79f00-048f-462e-bd12-895179178d4c" />

#### 3. Ubah Data Buku

* **Method** : PUT

* **URL** : `https://tugas-akhir-learning-labs-backend-d.vercel.app/buku/:id`

* **Deskripsi** : Memperbarui keseluruhan data buku berdasarkan ID.

* **Headers** : `Content-Type: application/json`

* **Request Body** :

  ```
  {
    "judul": "Sistem Basis Data (Revisi)",
    "penulis": "Nathan Rajendra",
    "tahun_terbit": 2025,
    "penerbit": "Informatika"
  }
  
  ```

* **Response Sukses (200)**:

  ```
  {
    "message": "Buku berhasil diperbarui",
    "data": {
     "id_buku": 4,
     "judul": "Sistem Basis Data (Revisi)",
     "Penulis": "Nathan Rajendra",
     "Tahun_terbit": 2025,
     "Penerbit": "Informatika"
    }
  }
  
  ```
  * **Bukti Pengujian:**
    <img width="631" height="338" alt="Screenshot 2026-10-24 183158" src="https://github.com/user-attachments/assets/bfdc5cfd-26c0-4a35-a645-bb1ff9ae5bf4" />

#### 4. Hapus Buku

* **Method** : DELETE

* **URL** : `https://tugas-akhir-learning-labs-backend-d.vercel.app/buku/:id`

* **Deskripsi** : Menghapus data buku dari sistem berdasarkan ID.

* **Headers** : *None*

* **Response Sukses (200)**:

  ```
  { "message": "Buku berhasil dihapus" }
  
  ```
  * **Bukti Pengujian:**
    <img width="638" height="336" alt="Screenshot 2026-10-24 183247" src="https://github.com/user-attachments/assets/c985d63e-42e7-49c5-88bb-9e2164224fce" />


### B. Endpoint Anggota

#### 5. Registrasi Anggota

* **Method** : POST

* **URL** : `https://tugas-akhir-learning-labs-backend-d.vercel.app/anggota`

* **Deskripsi** : Mendaftarkan pengunjung sebagai anggota perpustakaan baru.

* **Headers** : `Content-Type: application/json`

* **Request Body** :

  ```
  {
    "nik": "3311223344556670",
    "nama": "Herman",
    "email": "nathan@email.com",
    "kontak": "08123456789"
  }
  
  ```

* **Response Sukses (201)**:

  ```
  {
    "message": "Anggota berhasil didaftarkan",
    "data": { 
      "id_anggota": 6, 
      "nik": "3311223344556670",
      "nama": "Herman",
      "kontak": "08123456789" 
    }
  }
  
  ```

* **Bukti Pengujian:**
<img width="640" height="335" alt="Screenshot 2026-10-24 150228" src="https://github.com/user-attachments/assets/a41868e8-7ab5-46cf-b56b-07598ece9a46" />

### C. Endpoint Transaksi (Peminjaman & Log)

#### 6. Pinjam Buku

* **Method** : POST

* **URL** : `https://tugas-akhir-learning-labs-backend-d.vercel.app/peminjaman`

* **Deskripsi** : Memproses peminjaman buku oleh anggota (otomatis memicu Log Peminjaman).

* **Headers** : `Content-Type: application/json`

* **Request Body** :

  ```
  {
    "id_anggota": 6,
    "id_buku": 2
  }
  
  ```

* **Response Sukses (201)**:

  ```
  {
    "message": "Buku berhasil dipinjam",
    "data": { 
      "id_peminjaman": 4, 
      "id_anggota": 6, 
      "id_buku": 2,
      "tanggal_pinjam": "2026-10-24T00:00:00.000Z",
      "tanggal_kembali": null,
      "status_peminjaman": "Dipinjam"
    }
  }
  
  ```

* **Bukti Pengujian:**
  <img width="640" height="334" alt="Screenshot 2026-10-24 151323" src="https://github.com/user-attachments/assets/d099f031-7034-46dd-ac52-58b07a202453" />


#### 7. Kembalikan Buku

* **Method** : PUT

* **URL** : `https://tugas-akhir-learning-labs-backend-d.vercel.app/peminjaman/:id`

* **Deskripsi** : Memproses pengembalian buku (otomatis memicu Log Pengembalian).

* **Headers** : *None*

* **Response Sukses (200)":**

  ```
  {
    "message": "Buku berhasil dikembalikan",
    "data": {
    "id_peminjaman": 5,
    "id_anggota: 9;,
    "id_buku: 2,
    "tanggal_pinjam": "2026-10-24",
    "tanggal_kembali": "2026-10-24",
    "status_peminjaman": "Dikembalikan"
   }
  }
  
  ```
  * **Bukti Pengujian:**
    <img width="640" height="335" alt="Screenshot 2026-10-25 040902" src="https://github.com/user-attachments/assets/d09b46c2-d5ce-4614-94e7-58f6d0a3ab94" />


#### 8. Tampilkan Laporan Log Transaksi

* **Method** : GET

* **URL** : `https://tugas-akhir-learning-labs-backend-d.vercel.app/laporan`

* **Deskripsi** : Menampilkan jejak rekam transaksi keluar masuknya buku secara *real-time*.

* **Headers** : *None*

* **Response Sukses (200)**:

  ```
  
  "data": [
    {
      "id_log": 3,
      "jenis_log": "Pengembalian",
      "waktu_log": "2026-10-24T21:08:48.264269",
      "status_peminjaman": "Dikembalikan",
      "peminjam": "Herman",
      "buku": "Sistem Basis Data"
    },
    {
      "id_log": 2,
      "jenis_log": "Peminjaman",
      "waktu_log": "2026-10-24T11:48:57.525413",
      "status_peminjaman": "Dikembalikan",
      "peminjam": "Herman",
      "buku": "Sistem Basis Data"
    },
    {
      "id_log": 1,
      "jenis_log": "Peminjaman",
      "waktu_log": "2026-10-24T08:12:59.189309",
      "status_peminjaman": "Dipinjam",
      "peminjam": "Herman",
      "buku": "Sistem Basis Data"
    }
  ]
}
  
  ```

* **Bukti Pengujian:**
  <img width="639" height="337" alt="Screenshot 2026-10-25 042823" src="https://github.com/user-attachments/assets/6d895e51-c274-4b85-b1e1-a22e917dd9a0" />

## 5. Cara Menjalankan Project Secara Lokal

Jika penilai ingin menjalankan API berbasis Python ini pada *environment* lokal (localhost), ikuti langkah berikut:

1. **Clone Repository**

   ```
   git clone https://github.com/Sumardi67/Tugas-Akhir-Learning-Labs-Backend-Development.git
   cd Tugas-Akhir-Learning-Labs-Backend-Development
   
   ```

2. **Install Dependensi Python**
   Pastikan Python dan `pip` sudah terinstal, lalu jalankan:

   ```
   pip install -r requirements.txt
   
   ```

3. **Konfigurasi Database**
   Buat file bernama `.env` di *root* folder, lalu isi dengan URL koneksi database PostgreSQL (Supabase) Anda:

   ```
   DATABASE_URL=postgresql://username:password@host:port/nama_database
   
   ```

   *(Pastikan Anda telah menjalankan tabel skema SQL bawaan proyek ke database tersebut).*

4. **Jalankan Server Lokal**

   ```
   uvicorn api.index:app --reload
   
   ```

   Server akan berjalan di `http://localhost:8000`. Silakan gunakan Thunder Client atau Postman untuk melakukan pengujian *endpoint*.
