# Majamu State Management

## Overview
Majamu menggunakan client state untuk pengalaman pengguna yang cepat dan realtime. State disimpan menggunakan Zustand dan localStorage untuk data tertentu.

---

## cartStore

### Purpose
Mengelola keranjang belanja pelanggan.

### State
- items
- totalItems
- totalPrice
- notes

### Persistence
- localStorage

### Actions
- addItem
- removeItem
- updateQuantity
- updateSweetness
- clearCart

---

## activeOrderStore

### Purpose
Melacak pesanan aktif pelanggan.

### State
- orderId
- statusUrl
- currentStatus
- estimatedTime

### Persistence
- localStorage

### Actions
- setActiveOrder
- updateStatus
- clearActiveOrder

---

## customerHistoryStore

### Purpose
Menyimpan riwayat pesanan pelanggan tanpa login.

### State
- orders[]

### Persistence
- localStorage
- maksimal 30 riwayat

### Actions
- addHistory
- removeHistory
- clearHistory

---

## authStore

### Purpose
Autentikasi Owner dan Kasir.

### State
- user
- role
- session
- isAuthenticated

### Persistence
- secure storage

### Actions
- login
- logout
- refreshSession

---

## settingsStore

### Purpose
Konfigurasi toko.

### State
- storeStatus
- urgencyThresholdMinutes
- queueCounter

### Actions
- updateSettings
- refreshSettings

---

## ownerDashboardStore

### Purpose
Data dashboard owner.

### State
- omzetHariIni
- jumlahPesanan
- produkTerlaris
- stokHabis

### Actions
- refreshDashboard

---

## cashierBoardStore

### Purpose
Realtime board kasir.

### State
- waitingOrders
- acceptedOrders
- preparingOrders
- readyOrders

### Actions
- refreshOrders
- moveOrderStatus

---

## Responsive Strategy

### Customer
- Mobile First
- Persist state antar refresh

### Cashier
- Realtime subscription Supabase

### Owner
- Realtime dashboard metrics
