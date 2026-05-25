# Spidegram Roadmap

## MVP (v0.1) ✅

- [x] **Auth completo** — registro, login, logout
- [x] **Schema DB** — 8 tablas con RLS, triggers, índices, Storage RLS
- [x] **Crear grupos** — formulario + Server Action, creador se vuelve admin
- [x] **Unirse a grupos** — por ID del grupo
- [x] **Dashboard de usuario** — lista de grupos con rol
- [x] **Subir fotos** — upload a Supabase Storage, crear registro en `photos` con status `pending`
- [x] **Aprobar/rechazar fotos** — panel de admin con approve/reject
- [x] **Comentar fotos** — formulario + listado en página de foto individual
- [x] **Dashboard de grupo** — upload, pendientes (admin), grilla aprobadas
- [x] **Reacciones** — like/unlike en fotos
- [x] **Foto individual** — lightbox con comentarios, likes, caption
- [x] **Feed social** — timeline con fotos públicas de amigos + grupos
- [x] **Seguir/amigos** — buscar, seguir, dejar de seguir
- [x] **Notificaciones** — triggers automáticos + página + badge

## v0.2

- [ ] **Perfiles de usuario** — editable con avatar, bio
- [ ] **Links de invitación** — compartir link para unirse a un grupo
- [ ] **Roles avanzados** — dueño del grupo, admins, miembros

## v0.2

- [ ] **Feed público** — scroll infinito de fotos marcadas como `is_public: true`
- [ ] **Perfiles de usuario** — avatar, nombre, fotos subidas
- [ ] **Links de invitación** — compartir link para unirse a un grupo
- [ ] **Roles avanzados** — dueño del grupo, admins, miembros

## v0.3

- [ ] **Reacciones** — like/love a fotos
- [ ] **Álbumes dentro de grupos** — sub-carpetas para organizar fotos
- [ ] **Descarga de fotos** — exportar fotos originales
- [ ] **Modo offline / PWA** — ver fotos sin conexión

## v0.4+

- [ ] **Compartir fuera de la app** — links públicos a fotos individuales
- [ ] **Búsqueda** — buscar fotos por caption, grupo, usuario
- [ ] **Analytics del grupo** — cuántas fotos subió cada quién
- [ ] **Modo oscuro / claro**
- [ ] **App mobile** — React Native o wrapper
