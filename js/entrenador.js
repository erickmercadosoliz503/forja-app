import { db } from "./firebase-config.js";
import {
  doc, updateDoc, collection, getDocs, query, orderBy, addDoc, setDoc
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

// ---- Convierte el nombre de un ejercicio en un id estable (para poder rastrear récords) ----
export function slugEjercicio(nombre) {
  return nombre.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// ---- Crear una rutina nueva y asignarla como activa a un alumno ----
export async function crearYAsignarRutina(entrenadorId, alumnoId, { semana, dias }) {
  const diasConId = dias.map(d => ({
    label: d.label,
    exercises: d.exercises.map(e => ({ ...e, ejercicioId: slugEjercicio(e.nombre) }))
  }));

  const rutinaRef = await addDoc(collection(db, "entrenadores", entrenadorId, "rutinas"), {
    alumnoId,
    semana,
    dias: diasConId,
    fechaCreacion: new Date()
  });

  await updateDoc(doc(db, "entrenadores", entrenadorId, "alumnos", alumnoId), {
    rutinaActivaId: rutinaRef.id
  });

  return rutinaRef.id;
}
