// Pega aquí el bloque "firebaseConfig" que te da la consola de Firebase
// (Configuración del proyecto → Tus apps → icono </> → Registrar app web)

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDtwPM2Ri0Mh_erAnC7Z6FASQaxIxVQT5c",
  authDomain: "forja-app-ab506.firebaseapp.com",
  projectId: "forja-app-ab506",
  storageBucket: "forja-app-ab506.firebasestorage.app",
  messagingSenderId: "448982388490",
  appId: "1:448982388490:web:ca6cadd2cc2cec7e4ef4f3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
