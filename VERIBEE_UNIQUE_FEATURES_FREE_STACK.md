# Veribee Unique Features and Free-Only Implementation Stack

This is based on `4ECED-Market Research-G1.pdf`. The core user pain is trust for high-value online purchases above PHP 10,000, especially product authenticity and secure physical handover.

## Unique Veribee Features

| Feature | What makes it unique | Free implementation path |
|---|---|---|
| AI Scanner | Checks product photos, serial numbers, labels, and visual counterfeit signals before dispatch. | Use Tesseract OCR for serial/label extraction, Transformers.js for browser/on-device image classification or embeddings, and a local JSON/Postgres reference table for known serial formats, SKU patterns, and brand rules. |
| VSI, Verified Seller Index | Legitimacy score based on real transaction and verification history, not easy-to-manipulate star reviews. | Calculate locally from completed orders, dispute rate, KYC status, cancellation rate, delivery success, and authentication pass rate. Store in Supabase Free Plan or local demo store. |
| Proof of Originality Report | Buyers can inspect why a product is marked verified before checkout. | Store evidence fields: serial number, OCR result, product photos, seller declaration, receipt image, auth score, reviewer notes, and verification timestamp. |
| Secure Handover | High-value items are not just left at the door; release requires OTP or biometric + OTP. | Use Expo LocalAuthentication for device biometric prompt and local OTP code flow. No paid API required. |
| Verified Delivery Workflow | Rider route is tied to pickup confirmation, buyer handover, and final proof of delivery. | Use Expo Router screens plus local state/Supabase rows for delivery status. Use OpenStreetMap/Nominatim only for user-triggered geocoding, with caching and attribution. |
| Buyer Confidence Layer | Product card and detail pages show auth status, seller VSI, handover method, and evidence summary. | Already represented in demo product data through auth score, AI scanner result, evidence array, and warranty note. |

## Recommended Free AI/API Choices

| Need | Recommended free option | Notes |
|---|---|---|
| OCR for serial numbers, receipts, labels | Tesseract / Tesseract.js | Open-source OCR under Apache 2.0. Good for text printed on labels, receipts, and serial plates. |
| Image classification / counterfeit visual signals | Transformers.js with ONNX models | Runs models directly in the browser or JS runtime, no server required. Start with lightweight image classification or embedding models. |
| Product matching / duplicate image similarity | Transformers.js image embeddings + cosine similarity | Store reference embeddings locally or in Supabase. Use this for demo-level visual matching. |
| Auth scoring | Local deterministic scoring function | Combine OCR match, image confidence, seller VSI, receipt presence, KYC status, and prior dispute history. Keep explainable. |
| Database and auth | Supabase Free Plan | Free plan is enough for demo users, product tables, orders, and auth experiments. |
| Maps / geocoding | OpenStreetMap + Nominatim | Use only for user-triggered search, max 1 request/second on public Nominatim, include attribution, and cache results. |
| Biometric handover | Expo LocalAuthentication | Local device biometric prompt; no paid service. Pair with OTP for high-value deliveries. |
| Push notifications | Expo Notifications | Free for prototype/demo use. For production, verify platform limits before launch. |

## AI Scanner MVP Logic

1. Seller uploads product photos, serial label, receipt, and proof images.
2. OCR extracts serial/SKU/receipt text.
3. Local rule checks validate brand-specific serial format, expected model keywords, price band, and missing evidence.
4. Image model produces a category or embedding signal to compare against reference examples.
5. Veribee computes an auth score:

```text
authScore =
  OCR serial confidence * 25
  + image match confidence * 25
  + receipt/evidence completeness * 20
  + seller VSI contribution * 20
  + manual reviewer confidence * 10
```

6. Products above a threshold become `verified`; uncertain products become `pending`; conflicting evidence becomes `failed`.

## Demo Accounts

| Role | Name | Phone | Password |
|---|---|---|---|
| Seller | Maria Santos | +639171234501 | VeribeeTest123! |
| Buyer | David Kim | +639171234502 | VeribeeTest123! |
| Rider | Angelo Reyes | +639171234503 | VeribeeTest123! |

Local OTP for account and delivery testing: `123456`.

## Demo Product Dataset

| Product | Category | Price | Serial | Auth Score | Status |
|---|---|---:|---|---:|---|
| Series 9 Chronograph Smartwatch | Electronics | PHP 18,500 | VT-S9-2026-000184 | 97 | Verified |
| Classic Artisan Leather Tote | Bags | PHP 12,990 | MA-TOTE-MM-042026-77 | 96 | Verified |
| Limited Edition Urban Kicks | Shoes | PHP 8,450 | NK-UK-LE-840221-PH | 93 | Verified |
| 18k Gold Heritage Pendant | Jewelry | PHP 24,000 | HJ-18K-HP-2026-019 | 98 | Verified |
| Monogram Canvas Wallet | Bags | PHP 6,900 | MA-WLT-CZ-2026-118 | 71 | Pending review |

## Sources Checked

- Hugging Face Transformers.js: https://huggingface.co/docs/transformers.js/
- Tesseract OCR documentation: https://github.com/tesseract-ocr/tessdoc
- Supabase billing/free plan overview: https://supabase.com/docs/guides/platform/billing-on-supabase
- OpenStreetMap Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/
