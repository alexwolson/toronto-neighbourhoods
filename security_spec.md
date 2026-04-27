# Security Specification (Payload-First TDD)

## 1. Data Invariants
- A `neighborhood` document can only be created with an exact matching schema consisting of `neighborhoodName`, `homeLocation`, `polygonPoints`, `changesText`, `otherNamesText`, and `createdAt`.
- Updates to existing documents are strictly forbidden.
- Deletions are strictly forbidden.
- Reads by anonymous or spoofed users are strictly forbidden (the dataset must only be queryable via an admin/server endpoint).
- Data type and sizes are strictly constrained to prevent "Denial of Wallet" attacks.

## 2. The "Dirty Dozen" Payloads
1. **The Shadow Update:** Contains an extra `isAdmin: true` field. (Fails because `data.keys().size() != 6`).
2. **Missing Field:** Payload omits `changesText`. (Fails because `hasAll([])` check fails).
3. **Poisoned Type:** `neighborhoodName` is set to `{ value: "The Annex" }` instead of a string. (Fails `is string` check).
4. **Denial of Wallet (Huge String):** `changesText` is a 5MB string. (Fails `data.changesText.size() <= 5000`).
5. **Denial of Wallet (Huge Array):** `polygonPoints` contains 51 points. (Fails `data.polygonPoints.size() <= 50`).
6. **Poisoned Array Elements:** `homeLocation` is `["10", 20]`. (Fails `data.homeLocation[0] is number`).
7. **Temporal Attack:** `createdAt` is set to a past date instead of `request.time`. (Fails `data.createdAt == request.time`).
8. **Unauthorized Update:** Client attempts to overwrite an existing submittal. (Fails `allow update: if false`).
9. **Scraping Attack:** Client issues `getDocs(collection(db, 'neighborhoods'))`. (Fails `allow read: if false`).
10. **The Update Gap:** Payload includes identical data but is an update request. (Fails `allow update: if false`).

## 3. The Test Runner
A `firestore.rules.test.ts` file validates these assertions in CI.
