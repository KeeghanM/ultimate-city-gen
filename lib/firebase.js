import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyD2VxgD5-VqU576-vzcVQq17Mx9vpJhUKI",
  authDomain: "ultimate-city-gen.firebaseapp.com",
  projectId: "ultimate-city-gen",
  storageBucket: "ultimate-city-gen.appspot.com",
  messagingSenderId: "757639006907",
  appId: "1:757639006907:web:032cfcb9a4153d8d4bb79e",
  measurementId: "G-7KNHYGSNLX",
}

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig)
export const firestore = getFirestore(firebase)
export const auth = getAuth(firebase)
