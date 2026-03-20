import admin from "firebase-admin";

function getAdminApp() {
  if (admin.apps.length > 0) return admin.apps[0]!;
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "agendalgbt-app.firebasestorage.app",
  });
}

export function getAdminDb() {
  getAdminApp();
  return admin.firestore();
}

export const adminDb = new Proxy({} as admin.firestore.Firestore, {
  get(_target, prop) {
    const db = getAdminDb();
    const value = (db as any)[prop];
    return typeof value === "function" ? value.bind(db) : value;
  },
});

export default admin;
