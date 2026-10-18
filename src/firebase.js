import { initializeApp } from 'firebase/app'
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const cfg = {
  apiKey: "AIzaSyDPO0rwSZfnO5a_vPV7yMrpW499t7_e_d4",
  authDomain: "saleem-cdc03.firebaseapp.com",
  projectId: "saleem-cdc03",
  appId: "1:1050694781082:web:036c74b40d625d9166b723",
}
export const cloud = true
const app = initializeApp(cfg)
export const fdb = initializeFirestore(app, { localCache: persistentLocalCache() })
export const auth = getAuth(app)