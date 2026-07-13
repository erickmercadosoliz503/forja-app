# FORJA — Cimientos del proyecto

Este es el punto de partida real (ya no prototipo con `alert()`). Conecta con Firebase
de verdad. Está pensado para que un mismo despliegue sirva a **varios entrenadores**,
cada uno con su propia marca y sus propios alumnos, totalmente aislados entre sí.

## 1. Modelo de datos (Firestore)

```
users/{uid}
  rol: "entrenador" | "alumno"
  entrenadorId: string          // siempre presente
  alumnoId: string | null       // solo si rol = alumno

entrenadores/{entrenadorId}
  nombre: string
  email: string
  logoUrl: string
  colorPrimario: string         // hex, para pintar la marca del entrenador
  colorSecundario: string
  codigoInvitacion: string      // código que reparte a sus alumnos para registrarse
  stripeAccountId: string | null
  fechaAlta: timestamp

entrenadores/{entrenadorId}/alumnos/{alumnoId}
  nombre: string
  email: string
  iniciales: string
  rutinaActivaId: string | null
  planId: string | null
  estadoPago: "al_dia" | "pendiente"
  fechaAlta: timestamp

entrenadores/{entrenadorId}/alumnos/{alumnoId}/registros/{registroId}
  // una entrada por cada serie que el alumno anota (para calcular récords)
  ejercicioId: string
  peso: number
  reps: number
  serie: number
  fecha: timestamp

entrenadores/{entrenadorId}/alumnos/{alumnoId}/pesos/{pesoId}
  kg: number
  fecha: timestamp

entrenadores/{entrenadorId}/alumnos/{alumnoId}/mensajes/{mensajeId}
  emisor: "entrenador" | "alumno"
  texto: string
  fecha: timestamp
  leido: boolean

entrenadores/{entrenadorId}/rutinas/{rutinaId}
  alumnoId: string
  semana: string
  dias: [ { label: string, exercises: [ { nombre, series, reps, videoId, orden } ] } ]

entrenadores/{entrenadorId}/plantillas/{plantillaId}
  nombre: string
  dias: [ ... ]                 // misma forma que en rutinas

entrenadores/{entrenadorId}/videos/{videoId}
  titulo: string
  url: string
  duracionSeg: number
  entorno: "gym" | "casa"
```

**Por qué así:** todo cuelga de `entrenadores/{entrenadorId}`, así que las reglas de
seguridad (`firestore.rules`) pueden aislar los datos de cada entrenador sin que se
mezclen entre sí. Cuando el entrenador FORJA quiera revender la app a otro entrenador,
solo hace falta crear un nuevo documento en `entrenadores/` — nada de tocar código.

## 2. Cómo entra un alumno nuevo

1. El entrenador tiene un `codigoInvitacion` único (ej: `BRABUS2026`).
2. El alumno se registra en la app con email + contraseña + ese código.
3. Al registrarse, se busca qué entrenador tiene ese código, y se crea:
   - `users/{uid}` con `rol: "alumno"` y el `entrenadorId` encontrado
   - `entrenadores/{entrenadorId}/alumnos/{uid}` con sus datos
4. A partir de ahí, la app carga el logo/color de `entrenadores/{entrenadorId}` y
   pinta la interfaz con la marca de ese entrenador automáticamente.

## 3. Archivos de este paquete

- `firestore.rules` — reglas de seguridad multi-tenant, listas para pegar en la consola.
- `js/firebase-config.js` — pega aquí tu `firebaseConfig` de la consola.
- `js/auth.js` — login, registro de alumno con código de invitación, logout.
- `index.html` — pantalla de entrada (login / registro), ya con Firebase real.
- `manifest.json` + `sw.js` — para que la app se pueda instalar en el móvil (PWA).

## 4. Próximos pasos (en orden)

1. ✅ Cimientos (esto) — auth + estructura multi-tenant
2. Pantalla "Inicio/Rutina" del alumno leyendo y escribiendo en Firestore de verdad
3. Progreso (fotos a Storage, pesos a Firestore)
4. Panel del entrenador conectado (crear rutinas/plantillas de verdad)
5. Chat en tiempo real
6. Notificaciones push (Firebase Cloud Messaging)
7. Pagos con Stripe (cuota del alumno + cobro único al entrenador que compra la app)
8. Pulido: subdominios/slugs por entrenador, panel para que tú des de alta entrenadores nuevos
