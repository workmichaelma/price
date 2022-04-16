import { initFirebase } from '../../firebase'
const isDev = process.env.isDev

const DB_NAME = `products${isDev ? "__test" : ""}`
let db = null

export const getProduct = async (args) => {
  db = initFirebase()
  const { code, brand } = args
  let docRef = db.collection(DB_NAME);

  if (code) {
    docRef = docRef.where("code", "==", code);
  }
  if (brand) {
    docRef = docRef.where("brand", "==", brand);
  }

  const snapshot = await docRef.get();
  return productPreprocess(snapshot);
}

const productPreprocess = snapshot => {
  const items = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    items.push(data);
  })

  if (items.length === 1) {
    return items[0]
  }

  return items;

}
