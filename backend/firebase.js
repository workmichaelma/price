var admin = require("firebase-admin");

var serviceAccount = require("./firebase-adminsdk.json");

export const initFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  
  return admin.firestore()
}
