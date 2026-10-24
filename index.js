require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json()); // Middleware untuk membaca request body JSON
app.use(cors());

// Konfigurasi Koneksi Database PostgreSQL[cite: 2, 3]
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } 
});

// ==========================================
// 1. ENDPOINT BUKU (CRUD LENGKAP)[cite: 3]
// ==========================================

// GET /buku - Cari buku atau tampilkan semua (Fungsi cariBuku)[cite: 1]
app.get('/buku', async (req, res) => {
  try {
    const { keyword } = req.query;
    let queryText = 'SELECT * FROM buku';
    let queryParams = [];

    if (keyword) {
      queryText += ' WHERE judul ILIKE $1 OR penulis ILIKE $1 OR penerbit ILIKE $1';
      queryParams.push(`%${keyword}%`);
    }

    const { rows } = await pool.query(queryText, queryParams);
    res.status(200).json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

// POST /buku - Tambah data buku baru (Fungsi tambahBuku)[cite: 1]
app.post('/buku', async (req, res) => {
  const { judul, penulis, tahun_terbit, penerbit } = req.body;
  
  if (!judul || !penulis || !tahun_terbit || !penerbit) {
    return res.status(400).json({ error: "Semua field buku wajib diisi" });
  }

  try {
    const queryText = 'INSERT INTO buku (judul, penulis, tahun_terbit, penerbit) VALUES ($1, $2, $3, $4) RETURNING *';
    const { rows } = await pool.query(queryText, [judul, penulis, tahun_terbit, penerbit]);
    res.status(201).json({ message: "Buku berhasil ditambahkan", data: rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Gagal menambahkan buku" });
  }
});

// PUT /buku/:id - Mengubah seluruh detail buku[cite: 3]
app.put('/buku/:id', async (req, res) => {
  const idBuku = req.params.id;
  const { judul, penulis, tahun_terbit, penerbit } = req.body;

  try {
    const queryText = 'UPDATE buku SET judul = $1, penulis = $2, tahun_terbit = $3, penerbit = $4 WHERE id_buku = $5 RETURNING *';
    const { rows } = await pool.query(queryText, [judul, penulis, tahun_terbit, penerbit, idBuku]);
    
    if (rows.length === 0) return res.status(404).json({ error: "Buku tidak ditemukan" });
    res.status(200).json({ message: "Buku berhasil diperbarui", data: rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui buku" });
  }
});

// DELETE /buku/:id - Menghapus data buku (Fungsi hapusBuku)[cite: 1]
app.delete('/buku/:id', async (req, res) => {
  const idBuku = req.params.id;
  try {
    const { rowCount } = await pool.query('DELETE FROM buku WHERE id_buku = $1', [idBuku]);
    if (rowCount === 0) return res.status(404).json({ error: "Buku tidak ditemukan" });
    res.status(200).json({ message: "Buku berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus buku" });
  }
});

// ==========================================
// 2. ENDPOINT ANGGOTA
// ==========================================

// POST /anggota - Mendaftarkan anggota (Fungsi registrasiAnggota)[cite: 1]
app.post('/anggota', async (req, res) => {
  const { nama, nik, kontak } = req.body;
  try {
    const queryText = 'INSERT INTO anggota (nama, nik, kontak) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await pool.query(queryText, [nama, nik, kontak]);
    res.status(201).json({ message: "Anggota berhasil didaftarkan", data: rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Gagal mendaftarkan anggota (NIK mungkin duplikat)" });
  }
});

// ==========================================
// 3. ENDPOINT PEMINJAMAN & PENGEMBALIAN
// ==========================================

// POST /peminjaman - Memproses peminjaman buku (Fungsi pinjamBuku)[cite: 1]
app.post('/peminjaman', async (req, res) => {
  const { id_anggota, id_buku } = req.body;
  try {
    // Insert data peminjaman[cite: 2]
    const queryPinjam = 'INSERT INTO peminjaman (id_anggota, id_buku) VALUES ($1, $2) RETURNING *';
    const resultPinjam = await pool.query(queryPinjam, [id_anggota, id_buku]);
    const idPeminjaman = resultPinjam.rows[0].id_peminjaman;

    // Catat ke Log Transaksi secara otomatis[cite: 2]
    await pool.query('INSERT INTO log_transaksi (id_peminjaman, jenis_log) VALUES ($1, $2)', [idPeminjaman, 'Peminjaman']);

    res.status(201).json({ message: "Buku berhasil dipinjam", data: resultPinjam.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Gagal memproses peminjaman" });
  }
});

// PUT /peminjaman/:id - Memproses pengembalian buku (Fungsi kembalikanBuku)[cite: 1]
app.put('/peminjaman/:id', async (req, res) => {
  const idPeminjaman = req.params.id;
  try {
    // Update status peminjaman[cite: 2]
    const queryKembali = `UPDATE peminjaman SET status_peminjaman = 'Dikembalikan', tanggal_kembali = CURRENT_DATE WHERE id_peminjaman = $1 RETURNING *`;
    const resultKembali = await pool.query(queryKembali, [idPeminjaman]);
    
    if (resultKembali.rows.length === 0) return res.status(404).json({ error: "Data peminjaman tidak ditemukan" });

    // Catat ke Log Transaksi secara otomatis[cite: 2]
    await pool.query('INSERT INTO log_transaksi (id_peminjaman, jenis_log) VALUES ($1, $2)', [idPeminjaman, 'Pengembalian']);

    res.status(200).json({ message: "Buku berhasil dikembalikan", data: resultKembali.rows[0] });
  } catch (error) {
    res.status(500).json({ error: "Gagal memproses pengembalian" });
  }
});

// ==========================================
// 4. ENDPOINT LOG TRANSAKSI
// ==========================================

// GET /laporan - Menampilkan log keluar/masuk buku (Fungsi tampilkanLaporan)[cite: 1]
app.get('/laporan', async (req, res) => {
  try {
    const queryText = `
      SELECT l.id_log, l.jenis_log, l.waktu_log, p.status_peminjaman, a.nama as peminjam, b.judul as buku
      FROM log_transaksi l
      JOIN peminjaman p ON l.id_peminjaman = p.id_peminjaman
      JOIN anggota a ON p.id_anggota = a.id_anggota
      JOIN buku b ON p.id_buku = b.id_buku
      ORDER BY l.waktu_log DESC
    `;
    const { rows } = await pool.query(queryText);
    res.status(200).json({ data: rows });
  } catch (error) {
    res.status(500).json({ error: "Gagal memuat laporan transaksi" });
  }
});

// Export untuk Vercel Serverless
module.exports = app;

// Listener untuk eksekusi secara lokal
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
  });
}