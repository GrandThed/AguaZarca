import firebase from "firebase/app";
import "firebase/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyCf7wR4-v4SZGz681Xb4jV3mKeYKssRswE",
  authDomain: "aguazarca-d27a0.firebaseapp.com",
  databaseURL: "https://aguazarca-d27a0.firebaseio.com",
  projectId: "aguazarca-d27a0",
  storageBucket: "aguazarca-d27a0.appspot.com",
  messagingSenderId: "194875983516",
  appId: "1:194875983516:web:da13d9b53f1a0dd1e24f59",
  measurementId: "G-D1CHG5VLC1",
});
const db = firebase.firestore()
export {db}
