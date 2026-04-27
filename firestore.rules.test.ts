import { readFileSync } from "fs";
import { resolve } from "path";
import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { setLogLevel } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

describe("Firestore Security Rules", () => {
  beforeAll(async () => {
    // Silence network warnings
    setLogLevel("error");

    testEnv = await initializeTestEnvironment({
      projectId: "demo-project",
      firestore: {
        rules: readFileSync(resolve(__dirname, "firestore.rules"), "utf8"),
      },
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
  });

  it("should fail to read the neighborhoods collection (scraping prevention)", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const query = unauthedDb.collection("neighborhoods");
    await assertFails(query.get());
  });

  it("should fail to submit missing required fields", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const ref = unauthedDb.collection("neighborhoods").doc("test1");
    // Missing 'changesText' and 'otherNamesText'
    await assertFails(ref.set({
      neighborhoodName: "The Annex",
      homeLocation: [43.6, -79.4],
      polygonPoints: [{lat: 43.6, lng: -79.4}, {lat: 43.61, lng: -79.4}, {lat: 43.6, lng: -79.41}],
      createdAt: testEnv.unauthenticatedContext().firestore.FieldValue.serverTimestamp()
    }));
  });

  it("should succeed with exact schema", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const ref = unauthedDb.collection("neighborhoods").doc("test2");
    
    await assertSucceeds(ref.set({
      neighborhoodName: "The Annex",
      homeLocation: [43.6, -79.4],
      polygonPoints: [{lat: 43.6, lng: -79.4}, {lat: 43.61, lng: -79.4}, {lat: 43.6, lng: -79.41}],
      changesText: "Grew north",
      otherNamesText: "",
      createdAt: testEnv.unauthenticatedContext().firestore.FieldValue.serverTimestamp()
    }));
  });

  it("should fail if extra fields are added (Shadow Update)", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const ref = unauthedDb.collection("neighborhoods").doc("test3");
    
    await assertFails(ref.set({
      neighborhoodName: "The Annex",
      homeLocation: [43.6, -79.4],
      polygonPoints: [{lat: 43.6, lng: -79.4}, {lat: 43.61, lng: -79.4}, {lat: 43.6, lng: -79.41}],
      changesText: "",
      otherNamesText: "",
      createdAt: testEnv.unauthenticatedContext().firestore.FieldValue.serverTimestamp(),
      isAdmin: true // Poisoned field
    }));
  });

  it("should fail to update an existing document", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const ref = unauthedDb.collection("neighborhoods").doc("test4");
    
    await assertSucceeds(ref.set({
      neighborhoodName: "The Annex",
      homeLocation: [43.6, -79.4],
      polygonPoints: [{lat: 43.6, lng: -79.4}, {lat: 43.61, lng: -79.4}, {lat: 43.6, lng: -79.41}],
      changesText: "",
      otherNamesText: "",
      createdAt: testEnv.unauthenticatedContext().firestore.FieldValue.serverTimestamp()
    }));

    // Try updating
    await assertFails(ref.update({
      changesText: "Updated..."
    }));
  });
});
