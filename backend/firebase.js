const admin = require('firebase-admin');

// Prevent re-initialization (Next.js / nodemon hot reload fix)
if (!admin.apps.length) {
  let credential;

  if (process.env.FIREBASE_PRIVATE_KEY) {
    // Production — use env variables (Render)
    credential = admin.credential.cert({
      projectId:    process.env.FIREBASE_PROJECT_ID,
      clientEmail:  process.env.FIREBASE_CLIENT_EMAIL,
      // Render escapes newlines — this fixes it
      privateKey:   process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  } else {
    // Local dev — use the JSON file
    try {
      const serviceAccount = require('./firebase-key.json');
      credential = admin.credential.cert(serviceAccount);
    } catch (e) {
      console.warn('firebase-key.json not found and no env vars set — Firebase disabled');
      module.exports = { admin: null, db: null };
      return;
    }
  }

  admin.initializeApp({ credential });
}

const db = admin.firestore();
module.exports = { admin, db };