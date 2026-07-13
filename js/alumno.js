import { db } from "./firebase-config.js";
import {
  doc, getDoc, collection, addDoc, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// ---- Mejor serie registrada hasta ahora para un ejercicio concreto ----
export async function obtenerRecord(entrenadorId, alumnoId, ejercicioId) {
  const q = query(
    collection(db, "entrenadores", entrenadorId, "alumnos", alumnoId, "registros"),
    where("ejercicioId", "==", ejercicioId)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  let mejor = null;
  snap.forEach(d => {
    const r = d.data();
    if (!mejor || r.peso > mejor.peso || (r.peso === mejor.peso && r.reps > mejor.reps)) mejor = r;
  });
  return mejor;
}

// ---- Guardar una serie registrada por el alumno ----
export async function registrarSerie(entrenadorId, alumnoId, { ejercicioId, peso, reps, serie }) {
  await addDoc(collection(db, "entrenadores", entrenadorId, "alumnos", alumnoId, "registros"), {
    ejercicioId, peso, reps, serie, fecha: new Date()
  });
}
