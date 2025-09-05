# Cashier System - Transaction API & Thermal Printer Integration

## Overview

Sistem kasir ini telah diperbarui dengan integrasi API transaksi baru dan dukungan thermal printer BP-ECO58D untuk mencetak nota transaksi.

## Fitur Baru

### 1. Transaction API Integration

#### Endpoints yang digunakan:

**CREATE Transaction**

```
POST /api/v1/transactions
```

**Request Body:**

```json
{
  "PaymentMethod": "credit_card",
  "TotalPrice": 276000,
  "Products": [
    {
      "id": "1c2bc6c7-89ae-11f0-9178-525400e0e2b9",
      "quantity": 2,
      "price": 120000
    },
    {
      "id": "31a07b3f-89ae-11f0-9178-525400e0e2b9",
      "quantity": 3,
      "price": 12000
    }
  ]
}
```

**GET All Transactions**

```
GET /api/v1/transactions?page=1&limit=10
```

**GET Transaction by ID**

```
GET /api/v1/transactions/:id
```

### 2. Thermal Printer Support (BP-ECO58D)

#### Fitur Printer:

- **Test Print**: Mencetak halaman test untuk memastikan printer berfungsi
- **Print Receipt**: Mencetak nota transaksi lengkap
- **ESC/POS Commands**: Menggunakan standar ESC/POS untuk thermal printer
- **Web Serial API**: Koneksi ke printer melalui browser modern

#### Format Nota:

```
      PET SHOP POS
        Nama Toko
       Lokasi Toko
================================
Tanggal: 05/09/2025 15:30:20
ID Trans: a4b5167c-2adf-48
Kasir   : Adit Ganteng
Pembayaran: CREDIT CARD
--------------------------------
ITEM
--------------------------------
Royal Canin Tuna Adult 1Kg
2 x Rp120.000        Rp240.000

Me-O Mackarel Sachet
3 x Rp12.000          Rp36.000
--------------------------------
TOTAL:               Rp276.000
================================
        Terima Kasih
      Atas Kunjungan Anda
    Barang yang sudah dibeli
     tidak dapat dikembalikan
```

### 3. Payment Method Selection

Sistem sekarang mendukung multiple payment methods:

- **Cash** (Tunai)
- **Credit Card** (Kartu Kredit)
- **Debit Card** (Kartu Debit)

### 4. Enhanced UI/UX

#### Perubahan pada Cashier Interface:

- **Product Cards**: Hover effects dan visual feedback yang lebih baik
- **Cart Items**: Layout yang lebih rapi dengan informasi lengkap
- **Payment Method Selector**: Dropdown untuk memilih metode pembayaran
- **Test Print Button**: Tombol untuk test koneksi printer
- **Print Receipt Button**: Tombol cetak nota di modal receipt
- **Better Receipt Modal**: Tampilan nota yang lebih detail

## Cara Penggunaan

### Setup Thermal Printer

1. **Koneksi Hardware:**

   - Hubungkan printer BP-ECO58D ke komputer via USB
   - Pastikan driver printer sudah terinstall
   - Printer akan muncul sebagai Serial Port

2. **Browser Requirements:**

   - Gunakan browser modern yang mendukung Web Serial API (Chrome, Edge)
   - Izinkan akses Serial Port saat diminta

3. **Test Printer:**
   - Klik tombol "Test Print" di area keranjang
   - Jika berhasil, printer akan mencetak halaman test
   - Jika gagal, periksa koneksi dan driver printer

### Proses Transaksi

1. **Pilih Produk:**

   - Cari produk menggunakan search bar
   - Klik pada product card untuk menambah ke keranjang
   - Quantity akan otomatis bertambah jika produk sudah ada

2. **Atur Keranjang:**

   - Gunakan tombol +/- untuk mengubah quantity
   - Klik tombol sampah untuk menghapus item
   - Klik "Clear" untuk mengosongkan keranjang

3. **Pilih Metode Pembayaran:**

   - Gunakan dropdown untuk memilih Cash/Credit Card/Debit Card

4. **Checkout:**

   - Klik tombol "Checkout"
   - Sistem akan membuat transaksi via API
   - Modal receipt akan muncul dengan detail transaksi

5. **Print Nota:**
   - Klik "Print Nota" di modal receipt
   - Nota akan dicetak ke thermal printer
   - Jika printer belum terkoneksi, sistem akan meminta koneksi

## Technical Details

### Files Created/Modified:

1. **src/services/transactionApi.ts** - API service untuk transaksi
2. **src/services/thermalPrinter.ts** - Service untuk thermal printer
3. **src/services/api.ts** - Ditambah method untuk transaction API v2
4. **src/services/index.ts** - Export services baru
5. **src/pages/Cashier.tsx** - UI cashier dengan fitur lengkap

### Dependencies:

- **Web Serial API**: Untuk koneksi ke thermal printer
- **ESC/POS Commands**: Standard commands untuk thermal printer
- **React Hooks**: State management untuk UI

### Error Handling:

- **API Errors**: Toast notifications untuk error transaksi
- **Printer Errors**: Handle koneksi dan print failures
- **Stock Validation**: Validasi stok sebelum checkout
- **Network Issues**: Retry mechanism dan error messages

## Browser Compatibility

### Fully Supported:

- Chrome 89+
- Edge 89+
- Opera 76+

### Limited Support (No Printer):

- Firefox (Web Serial API tidak tersedia)
- Safari (Web Serial API tidak tersedia)

## Troubleshooting

### Printer Issues:

1. **Connection Failed**: Periksa kabel USB dan driver
2. **Print Failed**: Restart printer dan browser
3. **Garbled Text**: Periksa encoding dan printer settings

### API Issues:

1. **Transaction Failed**: Periksa koneksi internet dan server status
2. **Invalid Data**: Validasi data cart sebelum submit
3. **Timeout**: Implementasi retry mechanism

### Browser Issues:

1. **Serial API Not Available**: Gunakan Chrome/Edge
2. **Permission Denied**: Allow serial port access
3. **HTTPS Required**: Web Serial API hanya bekerja di HTTPS

## Future Enhancements

1. **Multiple Printer Support**: Support untuk berbagai merk printer
2. **Receipt Templates**: Customizable receipt layouts
3. **Offline Mode**: Cache transaksi saat offline
4. **Barcode Scanner**: Integration dengan barcode scanner
5. **Customer Display**: Dual screen support
6. **Cash Drawer**: Integration dengan cash drawer
