import * as admin from 'firebase-admin';

let firebaseApp: admin.app.App | null = null;

export function getFirebaseApp() {
  if (!firebaseApp) {
    const raw = process.env.GOOGLE_CREDENTIALS!;
    // 必要なら Base64 デコード:
    // const json = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    const json = JSON.parse(raw);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(json),
    });
  }
  return firebaseApp;
}
