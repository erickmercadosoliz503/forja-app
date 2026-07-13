import { db } from "./firebase-config.js";
import {
  doc, updateDoc, collection, getDocs, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---- Actualizar los datos de marca del entrenador (nombre, colores, logo) ----
export async function actualizarMarca(entrenadorId, datos) {
  await updateDoc(doc(db, "entrenadores", entrenadorId), datos);
}

// ---- Listar los alumnos reales de este entrenador ----
export async function listarAlumnos(entrenadorId) {
  const q = query(collection(db, "entrenadores", entrenadorId, "alumnos"), orderBy("fechaAlta", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
