# Veribee Test Accounts

These are local QA account identities for testing screen flows only. Do not create or seed these in Supabase yet.

| Role | Demo Name | Phone | Password | Demo Profile | Expected Local Behavior |
|---|---|---|---|---|---|
| Seller | Maria Santos | +639171234501 | VeribeeTest123! | LuxeGoods Manila, Makati, VSI 96, KYC complete | Can enter the seller dashboard and manage preloaded sample products. |
| Buyer | David Kim | +639171234502 | VeribeeTest123! | BGC buyer, high-value handover requires OTP | Can enter the buyer home feed, view authentication reports, cart products, and checkout. |
| Rider | Angelo Reyes | +639171234503 | VeribeeTest123! | Honda Click 125i rider, rating 4.9, KYC complete | Can enter the rider job feed and complete the local delivery loop. |

Phase 3 supports Buyer, Seller, and Rider routes locally.

Local OTP code for registration testing: `123456`.
Local Rider delivery OTP code: `123456`.

Preloaded sample products include:

| Product | Category | Price | Status | Auth Score | Handover |
|---|---|---:|---|---:|---|
| Series 9 Chronograph Smartwatch | Electronics | PHP 18,500 | Verified | 97 | Biometric + OTP |
| Classic Artisan Leather Tote | Bags | PHP 12,990 | Verified | 96 | OTP |
| Limited Edition Urban Kicks | Shoes | PHP 8,450 | Verified | 93 | OTP |
| 18k Gold Heritage Pendant | Jewelry | PHP 24,000 | Verified | 98 | Biometric + OTP |
| Monogram Canvas Wallet | Bags | PHP 6,900 | Pending review | 71 | OTP |
