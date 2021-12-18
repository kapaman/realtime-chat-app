// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import { getFireStore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyD1zf-FQSL322bUkuOlMTXMjPji9LCWrEk",
    authDomain: "chat-app-2627a.firebaseapp.com",
    projectId: "chat-app-2627a",
    storageBucket: "chat-app-2627a.appspot.com",
    messagingSenderId: "609641492181",
    appId: "1:609641492181:web:c467b9321bf5d268877c5c"

};


// Initialize Firebase

// const app = initializeApp(firebaseConfig);
// const db = getFireStore();
// const auth = getAuth()
// const provider = new GoogleAuthProvider();
// export { db, auth, provider };