# Veribee Three-Device Demo Profiles

Use this file as the live demo script when showing Veribee on three devices: one seller, one buyer, and one rider.

## Demo Reality Check

The app can be demoed with hardcoded local data, but local state is stored per device. That means a new order created on the buyer device will not automatically appear on a separate rider device unless the shared Supabase tables are seeded and realtime updates are enabled.

For the safest three-device demo, use the fixed shared order below. It is already aligned across the buyer order list, rider job feed, seller product inventory, OTP handover, route, and profile identities.

## Shared Credentials

| Role | Name | Phone | Password | OTP |
|---|---|---|---|---|
| Seller | Camille Dizon | +639178642310 | VeribeeTest123! | 123456 |
| Buyer | Nico Villanueva | +639178642311 | VeribeeTest123! | 123456 |
| Rider | Paolo Reyes | +639178642312 | VeribeeTest123! | 123456 |

## Seller Profile

| Field | Value |
|---|---|
| Owner | Camille Dizon |
| Store | LuxeLane Manila |
| Phone | +639178642310 |
| Email | camille.dizon@luxelane.ph |
| Location | Makati City, Metro Manila |
| Pickup address | Unit 14B, Salcedo Market Tower, H.V. Dela Costa Street, Makati City |
| Coordinates | 14.5608, 121.0244 |
| Verified since | February 12, 2026 |
| VSI | 96 |
| KYC | Complete: government ID, business permit, seller evidence history |

## Buyer Profile

| Field | Value |
|---|---|
| Name | Nico Villanueva |
| Phone | +639178642311 |
| Email | nico.villanueva@veribee.test |
| Location | Bonifacio Global City, Taguig |
| Delivery address | One Uptown Residence, 36th Street, Bonifacio Global City, Taguig City |
| Coordinates | 14.5503, 121.0518 |
| Verified since | March 5, 2026 |
| Demo behavior | High-value buyer using OTP handover and verified delivery tracking |

## Rider Profile

| Field | Value |
|---|---|
| Name | Paolo Reyes |
| Phone | +639178642312 |
| Email | paolo.reyes@veribee.test |
| Start location | Plainview Barangay Hall, Mandaluyong City |
| Start coordinates | 14.5794, 121.0359 |
| Vehicle | Honda Click 125i |
| Plate | NCR 4821 |
| Rating | 4.9 |
| KYC | Complete: driver's license, OR/CR, profile verification |

## Shared Demo Order

| Field | Value |
|---|---|
| Order ID | VB-9982 |
| Delivery ID | delivery-vb-9982 |
| Product | Structured Leather Tote MM |
| Category | Bags |
| Price | PHP 12,990 |
| Seller | LuxeLane Manila |
| Buyer | Nico Villanueva |
| Rider | Paolo Reyes |
| Status | In transit |
| Auth score | 96 |
| Handover method | OTP |
| OTP | 123456 |
| Distance | 3.2 km |
| ETA | 12 minutes |
| Rider fee | PHP 85 |

## Sample Product Catalog

| Product | Seller | Price | Status | Auth Score | Handover |
|---|---|---:|---|---:|---|
| Series 9 Chronograph Smartwatch | TechHaven PH | PHP 18,500 | Verified | 97 | Biometric + OTP |
| Structured Leather Tote MM | LuxeLane Manila | PHP 12,990 | Verified | 96 | OTP |
| Limited Edition Urban Kicks | SoleAuthentic | PHP 8,450 | Verified | 93 | OTP |
| 18k Gold Heritage Pendant | Heirloom Jewels | PHP 24,000 | Verified | 98 | Biometric + OTP |
| Monogram Canvas Wallet | LuxeLane Manila | PHP 6,900 | Pending review | 71 | OTP |

## Three-Device Demo Script

1. Seller device: log in as Camille Dizon and show `Structured Leather Tote MM` in Products.
2. Buyer device: log in as Nico Villanueva and open Orders. Use order `VB-9982` as the active in-transit delivery.
3. Rider device: log in as Paolo Reyes, go Online, accept the `VB-9982` job, and start pickup navigation.
4. Rider device: use the in-app OSM navigation preview for the pickup route.
5. Rider device: tap `I've Arrived at Pickup`, confirm pickup, then continue to customer navigation.
6. Buyer device: open order tracking for `VB-9982` and show Paolo Reyes as the assigned rider.
7. Rider device: use the in-app OSM delivery preview, then tap `I've Arrived at Customer`.
8. Rider device: enter OTP `123456`.
9. Buyer device: complete the handover/rating flow.

## Free Maps And Tracking Stack

| Need | Free demo choice | Notes |
|---|---|---|
| In-app route preview | OpenStreetMap tiles | No API key is needed for lightweight demo tiles. Keep attribution visible and avoid heavy production tile usage without a tile provider. |
| Device GPS | Expo Location | Free native/browser geolocation permission flow. Used on rider navigation screens. |
| Live cross-device rider coordinates | Supabase Realtime | Free-tier friendly for demo scale. Requires `deliveries.rider_current_lat` and `deliveries.rider_current_lng`. |
| Embedded map tiles | OpenStreetMap tiles | Free only under tile usage policy. Good for light demo usage, not heavy production traffic without a tile provider. |

## Supabase Seed Needed For True Three-Device Sync

If the demo must update live across three separate physical devices, seed the same identities and delivery into Supabase:

```sql
-- Users/profiles should match the auth.users ids created in Supabase Auth.
-- Keep phone numbers and role values exactly aligned with the table below.

-- Required delivery row for rider tracking:
insert into deliveries (
  id,
  order_id,
  status,
  otp_code,
  rider_current_lat,
  rider_current_lng
) values (
  'delivery-vb-9982',
  'VB-9982',
  'heading_to_buyer',
  '123456',
  14.5794,
  121.0359
);
```

For the local hardcoded demo, do not rely on creating a brand-new buyer order during the presentation. Use `VB-9982` because it is the shared scenario already present across the role screens.
