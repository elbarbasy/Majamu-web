-- Tambah kolom wa_sent_at di tabel payments untuk deduplication pengiriman struk WA.
-- Kolom ini di-set setelah struk WA berhasil dikirim (baik oleh webhook maupun client fallback).
-- Mencegah pelanggan menerima pesan ganda.

ALTER TABLE payments ADD COLUMN IF NOT EXISTS wa_sent_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN payments.wa_sent_at IS 'Timestamp saat struk WhatsApp berhasil dikirim. Digunakan untuk deduplication.';
