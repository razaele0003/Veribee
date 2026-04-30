# Veribee Test Accounts

These are local QA account identities for testing screen flows only. Do not create or seed these in Supabase yet.

| Role | Phone | Password | Expected Phase 1 Behavior |
|---|---|---|---|
| Seller | +639171234501 | VeribeeTest123! | Can select Seller and enter the seller dashboard. |
| Buyer | +639171234502 | VeribeeTest123! | Role is visible but blocked with a coming soon alert. |
| Rider | +639171234503 | VeribeeTest123! | Role is visible but blocked with a coming soon alert. |

Phase 1 only supports the Seller route. Buyer and Rider identities are for gating checks once auth seeding is approved later.

Local OTP code for registration testing: `123456`.
