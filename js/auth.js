import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc, setDoc, collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---- Login (entrenadores y alumnos usan el mismo formulario) ----
export async function login(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export function logout() {
  return signOut(auth);
}

// ---- Registro de un entrenador nuevo (crea su propio tenant y código de invitación) ----
export async function registrarEntrenador({ nombre, email, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  const codigoInvitacion = generarCodigoInvitacion(nombre);

  // Importante: se crea primero users/{uid}, porque las reglas de seguridad de
  // entrenadores/{uid} comprueban el rol consultando este documento.
  await setDoc(doc(db, "users", uid), {
    rol: "entrenador",
    entrenadorId: uid,
    alumnoId: null
  });

  // El propio uid del entrenador se usa como entrenadorId: simplifica todo lo demás
  await setDoc(doc(db, "entrenadores", uid), {
    nombre,
    email,
    codigoInvitacion,
    colorPrimario: "#5ACAE4",
    colorSecundario: "#1F8FAE",
    logoUrl: "",
    stripeAccountId: null,
    fechaAlta: new Date()
  });

  return { uid, codigoInvitacion };
}

function generarCodigoInvitacion(nombre) {
  const base = nombre.trim().split(/\s+/)[0].toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "FORJA";
  const numero = Math.floor(1000 + Math.random() * 9000);
  return `${base}${numero}`;
}

// ---- Registro de un alumno nuevo usando el código de invitación de su entrenador ----
export async function registrarAlumno({ nombre, email, password, codigoInvitacion }) {
  // 1. Buscar qué entrenador tiene ese código
  const q = query(collection(db, "entrenadores"), where("codigoInvitacion", "==", codigoInvitacion.trim().toUpperCase()));
  const resultados = await getDocs(q);
  if (resultados.empty) {
    throw new Error("Código de invitación no válido. Pídeselo a tu entrenador.");
  }
  const entrenadorDoc = resultados.docs[0];
  const entrenadorId = entrenadorDoc.id;

  // 2. Crear la cuenta de autenticación
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  const iniciales = nombre.trim().split(/\s+/).slice(0, 2).map(p => p[0].toUpperCase()).join("");

  // 3. Crear el documento de usuario (rol + tenant)
  await setDoc(doc(db, "users", uid), {
    rol: "alumno",
    entrenadorId,
    alumnoId: uid
  });

  // 4. Crear la ficha del alumno dentro del entrenador correspondiente
  await setDoc(doc(db, "entrenadores", entrenadorId, "alumnos", uid), {
    nombre,
    email,
    iniciales,
    rutinaActivaId: null,
    planId: null,
    estadoPago: "pendiente",
    fechaAlta: new Date()
  });

  return { uid, entrenadorId };
}

// ---- Averiguar el rol/tenant de la persona ya logueada ----
export async function obtenerPerfil(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data(); // { rol, entrenadorId, alumnoId }
}

// ---- Cargar la marca (logo/colores) del entrenador para pintar la interfaz ----
export async function cargarMarcaEntrenador(entrenadorId) {
  const snap = await getDoc(doc(db, "entrenadores", entrenadorId));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.colorPrimario) {
    document.documentElement.style.setProperty("--accent", data.colorPrimario);
  }
  if (data.colorSecundario) {
    document.documentElement.style.setProperty("--accent-strong", data.colorSecundario);
  }
  return data; // { nombre, logoUrl, colorPrimario, colorSecundario, ... }
}

// ---- Punto de entrada: reacciona cuando cambia el estado de sesión ----
export function escucharSesion(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback({ autenticado: false });
      return;
    }
    const perfil = await obtenerPerfil(user.uid);
    if (!perfil) {
      callback({ autenticado: true, perfilIncompleto: true, user });
      return;
    }
    const marca = await cargarMarcaEntrenador(perfil.entrenadorId);
    callback({ autenticado: true, user, perfil, marca });
  });
}
