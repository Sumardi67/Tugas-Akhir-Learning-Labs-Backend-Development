import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncpg
from typing import Optional
from dotenv import load_dotenv

# Memuat variabel environment dari file .env (untuk lokal)
load_dotenv()

pool = None

# Konfigurasi Koneksi Database PostgreSQL
@asynccontextmanager
async def lifespan(app: FastAPI):
    global pool
    pool = await asyncpg.create_pool(dsn=os.getenv("DATABASE_URL"), ssl="require")
    yield
    await pool.close()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# SKEMA INPUT BODY (Pengganti req.body)
# ==========================================
class BukuInput(BaseModel):
    judul: str
    penulis: str
    tahun_terbit: int
    penerbit: str

class AnggotaInput(BaseModel):
    nama: str
    nik: str
    kontak: str

class PeminjamanInput(BaseModel):
    id_anggota: int
    id_buku: int

# ==========================================
# 1. ENDPOINT BUKU (CRUD LENGKAP)
# ==========================================

@app.get("/buku")
async def get_buku(keyword: Optional[str] = None):
    try:
        async with pool.acquire() as conn:
            if keyword:
                query = "SELECT * FROM buku WHERE judul ILIKE $1 OR penulis ILIKE $1 OR penerbit ILIKE $1"
                rows = await conn.fetch(query, f"%{keyword}%")
            else:
                query = "SELECT * FROM buku"
                rows = await conn.fetch(query)
        return {"data": [dict(row) for row in rows]}
    except Exception:
        raise HTTPException(status_code=500, detail="Terjadi kesalahan pada server")

@app.post("/buku", status_code=201)
async def tambah_buku(buku: BukuInput):
    try:
        async with pool.acquire() as conn:
            query = "INSERT INTO buku (judul, penulis, tahun_terbit, penerbit) VALUES ($1, $2, $3, $4) RETURNING *"
            row = await conn.fetchrow(query, buku.judul, buku.penulis, buku.tahun_terbit, buku.penerbit)
            return {"message": "Buku berhasil ditambahkan", "data": dict(row)}
    except Exception:
        raise HTTPException(status_code=500, detail="Gagal menambahkan buku")

@app.put("/buku/{id_buku}")
async def ubah_buku(id_buku: int, buku: BukuInput):
    try:
        async with pool.acquire() as conn:
            query = "UPDATE buku SET judul = $1, penulis = $2, tahun_terbit = $3, penerbit = $4 WHERE id_buku = $5 RETURNING *"
            row = await conn.fetchrow(query, buku.judul, buku.penulis, buku.tahun_terbit, buku.penerbit, id_buku)
            if not row:
                raise HTTPException(status_code=404, detail="Buku tidak ditemukan")
            return {"message": "Buku berhasil diperbarui", "data": dict(row)}
    except HTTPException as he:
        raise he
    except Exception:
        raise HTTPException(status_code=500, detail="Gagal memperbarui buku")

@app.delete("/buku/{id_buku}")
async def hapus_buku(id_buku: int):
    try:
        async with pool.acquire() as conn:
            status = await conn.execute("DELETE FROM buku WHERE id_buku = $1", id_buku)
            if status == "DELETE 0":
                raise HTTPException(status_code=404, detail="Buku tidak ditemukan")
            return {"message": "Buku berhasil dihapus"}
    except HTTPException as he:
        raise he
    except Exception:
        raise HTTPException(status_code=500, detail="Gagal menghapus buku")

# ==========================================
# 2. ENDPOINT ANGGOTA
# ==========================================

@app.post("/anggota", status_code=201)
async def daftar_anggota(anggota: AnggotaInput):
    try:
        async with pool.acquire() as conn:
            query = "INSERT INTO anggota (nama, nik, kontak) VALUES ($1, $2, $3) RETURNING *"
            row = await conn.fetchrow(query, anggota.nama, anggota.nik, anggota.kontak)
            return {"message": "Anggota berhasil didaftarkan", "data": dict(row)}
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=500, detail="Gagal mendaftarkan anggota (NIK mungkin duplikat)")
    except Exception:
        raise HTTPException(status_code=500, detail="Gagal mendaftarkan anggota")

# ==========================================
# 3. ENDPOINT PEMINJAMAN & PENGEMBALIAN
# ==========================================

@app.post("/peminjaman", status_code=201)
async def pinjam_buku(pinjam: PeminjamanInput):
    try:
        async with pool.acquire() as conn:
            async with conn.transaction(): # Fitur keamanan tambahan agar 2 query gagal/sukses bersamaan
                query_pinjam = "INSERT INTO peminjaman (id_anggota, id_buku) VALUES ($1, $2) RETURNING *"
                row_pinjam = await conn.fetchrow(query_pinjam, pinjam.id_anggota, pinjam.id_buku)
                
                query_log = "INSERT INTO log_transaksi (id_peminjaman, jenis_log) VALUES ($1, $2)"
                await conn.execute(query_log, row_pinjam['id_peminjaman'], 'Peminjaman')

            return {"message": "Buku berhasil dipinjam", "data": dict(row_pinjam)}
    except Exception:
        raise HTTPException(status_code=500, detail="Gagal memproses peminjaman")

@app.put("/peminjaman/{id_peminjaman}")
async def kembali_buku(id_peminjaman: int):
    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                query_kembali = "UPDATE peminjaman SET status_peminjaman = 'Dikembalikan', tanggal_kembali = CURRENT_DATE WHERE id_peminjaman = $1 RETURNING *"
                row_kembali = await conn.fetchrow(query_kembali, id_peminjaman)
                
                if not row_kembali:
                    raise HTTPException(status_code=404, detail="Data peminjaman tidak ditemukan")

                query_log = "INSERT INTO log_transaksi (id_peminjaman, jenis_log) VALUES ($1, $2)"
                await conn.execute(query_log, id_peminjaman, 'Pengembalian')

            return {"message": "Buku berhasil dikembalikan", "data": dict(row_kembali)}
    except HTTPException as he:
        raise he
    except Exception:
        raise HTTPException(status_code=500, detail="Gagal memproses pengembalian")

# ==========================================
# 4. ENDPOINT LOG TRANSAKSI
# ==========================================

@app.get("/laporan")
async def get_laporan():
    try:
        async with pool.acquire() as conn:
            query = '''
                SELECT l.id_log, l.jenis_log, l.waktu_log, p.status_peminjaman, a.nama as peminjam, b.judul as buku
                FROM log_transaksi l
                JOIN peminjaman p ON l.id_peminjaman = p.id_peminjaman
                JOIN anggota a ON p.id_anggota = a.id_anggota
                JOIN buku b ON p.id_buku = b.id_buku
                ORDER BY l.waktu_log DESC
            '''
            rows = await conn.fetch(query)
        return {"data": [dict(row) for row in rows]}
    except Exception:
        raise HTTPException(status_code=500, detail="Gagal memuat laporan transaksi")
