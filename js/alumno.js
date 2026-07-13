import { db } from "./firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ---- Ficha del alumno dentro de su entrenador ----
export async function obtenerAlumno(entrenadorId, alumnoId) {
  const snap = await getDoc(doc(db, "entrenadores", entrenadorId, "alumnos", alumnoId));
  return snap.exists() ? snap.data() : null;
}

// ---- Rutina activa asignada por el entrenador (si ya tiene una) ----
export async function obtenerRutinaActiva(entrenadorId, rutinaId) {
  if (!rutinaId) return null;
  const snap = await getDoc(doc(db, "entrenadores", entrenadorId, "rutinas", rutinaId));
  return snap.exists() ? snap.data() : null;
}
