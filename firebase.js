// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyB93Qt2ouIqmdTC3hp3JhL2oi8WdaYo_jM',
  authDomain: 'web-apps-c09ec.firebaseapp.com',
  projectId: 'web-apps-c09ec',
  storageBucket: 'web-apps-c09ec.appspot.com',
  messagingSenderId: '188455993220',
  appId: '1:188455993220:web:47c07ec215dc52800727d1',
  measurementId: 'G-LM6TQBX35V',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
// const db = getFirestore(app);

export const db = getFirestore(app);
