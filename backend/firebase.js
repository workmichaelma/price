var admin = require("firebase-admin");

var serviceAccount = require("./price-a4709-firebase-adminsdk-68hof-07379f9757.json");

export const initFirebase = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  
  return admin.firestore()
}
