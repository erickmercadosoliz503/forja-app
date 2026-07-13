import { db } from "./firebase-config.js";
import {
  doc, getDoc, collection, addDoc, updateDoc, deleteDoc, query, where, getDocs
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

// ---- Últimos registros guardados de un ejercicio (para poder revisarlos y corregirlos) ----
export async function obtenerHistorial(entrenadorId, alumnoId, ejercicioId, limite = 6) {
  const q = query(
    collection(db, "entrenadores", entrenadorId, "alumnos", alumnoId, "registros"),
    where("ejercicioId", "==", ejercicioId)
  );
  const snap = await getDocs(q);
  const registros = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  registros.sort((a, b) => (b.fecha?.toMillis?.() || 0) - (a.fecha?.toMillis?.() || 0));
  return registros.slice(0, limite);
}

// ---- Corregir un registro que ya se había guardado ----
export async function actualizarRegistro(entrenadorId, alumnoId, registroId, { peso, reps }) {
  await updateDoc(doc(db, "entrenadores", entrenadorId, "alumnos", alumnoId, "registros", registroId), { peso, reps });
}

// ---- Borrar un registro guardado por error ----
export async function eliminarRegistro(entrenadorId, alumnoId, registroId) {
  await deleteDoc(doc(db, "entrenadores", entrenadorId, "alumnos", alumnoId, "registros", registroId));
}
