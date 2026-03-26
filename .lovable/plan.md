

## Analysis: Image vs Current System — Required Changes

### Image থেকে প্রাপ্ত তথ্য

**Packages:**
- Family Package (1 Child + 1 Guardian, Soft Zone): Regular ৫০০/-, Eid Special ৩৫০/-, Extra Per Guardian ১৫০/-
- Full Board (1 Child + 1 Guardian, Soft Zone + Ride Zone): ৮০০/-

**Soft Play Zone (10 items — Free with package):**
Happy Kitchen, Rainbow Slide, Projector Game, Coconut Tree, Tube Slide, Toy Sensory Play, Sand Play, Rock Climbing Wall, Net Crawling, Fun Trampoline

**Ride Zone (Individual rides with Regular/Eid prices):**
| Ride | Regular | Eid Price |
|------|---------|-----------|
| Horse Ride | ১৭০ | ১০০ |
| Bike Racing | ২৩০ | ১৫০ |
| Water Gun | ১৩০ | ১০০ |
| Shooting Star | ১৭০ | ১০০ |
| Car Racing | ২০০ | ১৫০ |
| Shooting Gun | ২০০ | ১৫০ |

**Other items:**
- Lucky Gift: 6 coin ২০০/-, 10 coin ৩০০/-, 20 coin ৫০০/-
- Massage Chair: ১০০/- (20 min ২০০/-)

**Ride Zone Package:** Eid Offer ৫০০, Regular ১৩৫০

**Business:** Open 10am-10pm, Socks Mandatory

---

### Current System vs Image — Gap Analysis

#### 1. **Rides Table — Needs Major Update**
Current DB-তে rides গুলো image-এর সাথে মেলে না:

| Current DB Rides | Image Rides |
|---|---|
| Jumping Castle, Kiddie Train, Carousel, Ferris Wheel, Mini Train, Swing Ride, Bumper Cars, Slide Adventure, Trampoline | Horse Ride, Bike Racing, Water Gun, Shooting Star, Car Racing, Shooting Gun, Lucky Gift, Massage Chair |

**Action:** Current rides delete/update করে image অনুযায়ী সঠিক rides যোগ করতে হবে। Soft Play Zone ইতোমধ্যে একটি ride হিসেবে আছে (price ৩৫০)।

#### 2. **Pricing — Eid/Special Price Support নেই**
- Current system-এ rides-এ শুধু একটি `price` কলাম আছে
- Image-এ প্রতিটি ride-এ **Regular price** এবং **Eid/Offer price** দুটি আছে
- **Action:** `rides` table-এ `offer_price` কলাম যোগ করতে হবে, অথবা settings-এ offer toggle system

#### 3. **Package Pricing — Update Needed**
- Current settings: `entry_price: 500`, `extra_guardian_price: 100`, `socks_price: 50`
- Image: Family Package Regular ৫০০ (matches!), Eid Special ৩৫০, Extra Guardian ১৫০, Full Board ৮০০
- **Action:** 
  - `extra_guardian_price` ১০০ → ১৫০ আপডেট
  - Eid/Special pricing support যোগ (offer_entry_price, fullboard_price)
  - Full Board package pricing system যোগ

#### 4. **Ride Zone Package — New Concept**
- Image-এ "Ride Zone" package আছে: Regular ১৩৫০, Eid ৫০০ — সব rides একসাথে
- Current system-এ এই concept নেই
- **Action:** Settings-এ ride zone package pricing যোগ

#### 5. **Lucky Gift & Massage Chair — Special Items**
- এগুলো coin-based/time-based pricing — regular ride structure-এ fit করে না
- **Action:** এগুলো rides হিসেবে যোগ করা যায় special category-তে, অথবা আলাদা pricing note হিসেবে

#### 6. **Soft Play Zone Ride — Price Update**
- Current: ৩৫০
- Image: Family Package-এ included (৫০০ entry-তে)
- **Action:** Soft Play Zone-কে package-এর অংশ হিসেবে treat করা, আলাদা ride হিসেবে নয়

---

### Recommended Implementation Steps

| # | Task | Area |
|---|------|------|
| 1 | `rides` table-এ `offer_price` কলাম যোগ (migration) | Database |
| 2 | Settings-এ Eid/Offer toggle + offer pricing fields যোগ (offer_entry_price, fullboard_price, ride_zone_package_price) | Settings |
| 3 | Current dummy rides মুছে image অনুযায়ী সঠিক rides ইনসার্ট | Database |
| 4 | AdminRides form-এ Offer Price ফিল্ড যোগ | Admin UI |
| 5 | PricingSection-এ packages ও offer pricing reflect করা | Public UI |
| 6 | AdminSettings pricing tab-এ Full Board, Ride Zone Package, Eid offer fields যোগ | Admin UI |

### Summary
মূলত ৩টি বড় gap আছে: **(1)** Rides ডাটা ভুল/ডামি — image অনুযায়ী আপডেট দরকার, **(2)** Eid/Offer dual pricing system নেই — DB ও UI তে যোগ করতে হবে, **(3)** Package types (Family, Full Board, Ride Zone) properly structured নেই। এগুলো ধাপে ধাপে implement করা যাবে।

