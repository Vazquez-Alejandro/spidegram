# Spidegram Roadmap

## MVP (v0.1)

- [ ] **Auth completo** — registro, login, logout, verificación de email
- [ ] **Crear grupos** — formulario para crear un grupo (nombre, descripción, cover)
- [ ] **Unirse a grupos** — unirse por link de invitación o por ID del grupo
- [ ] **Subir fotos** — upload a Supabase Storage, crear registro en `photos` con status `pending`
- [ ] **Aprobar/rechazar fotos** — los admins ven las fotos pendientes y las aprueban o rechazan
- [ ] **Comentar fotos** — los miembros pueden comentar en fotos aprobadas
- [ ] **Dashboard de grupo** — grilla de fotos aprobadas, panel de pendientes para admins
- [ ] **Notificaciones** — cuando suben una foto, cuando la aprueban, cuando comentan

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
