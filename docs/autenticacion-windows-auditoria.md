# Auditoría previa — Windows Authentication (2026-10-01)

Documento registrado antes de modificar código.

## EXISTENTE
- Repositorios reales: IMV_Backend e imv-frontend bajo D:/MIS DATOS/Documentos/Base de datos/Backend. Ambos limpios en codex/fichas-consulta-operativa al inicio.
- Tras fetch no existe main. master backend b7687ab y frontend 0e0f48b ya incluyen la rama; fast-forward local y merge sin cambios/conflictos. Push master: Everything up-to-date. Desarrollo únicamente en feat/usuarios-windows.
- Backend: .NET Framework 4.5.2, Web API 2, EF6 Database First. SQL con Integrated Security; no impersonación configurada.
- UsuarioActualService obtiene HttpContext.Current.User.Identity, pero cae en UsuarioDesarrollo/DESARROLLO_LOCAL y trunca al límite solicitado.
- Servicios de altas/modificaciones usan IUsuarioActualService(50); reemplazo de titulares da baja lógica al detalle. Historial notarial usa 100 para UsuarioResponsable y 50 para UsuarioAlta. AuditoriaService usa 256 y transacciones existentes.
- EDMX: UsuarioAlta/Modif/Baja varchar(50); UsuarioResponsable varchar(100). Migración AuditoriaCambios: Usuario nvarchar(256). No se consultó ni modificó el directorio municipal.
- Controllers funcionales con AllowAnonymous, incluidos POST/PUT. WebApiConfig sin autorización global. Values tiene Authorize. Se revisaron todos los controllers.
- IIS Express: proyecto y .vs/IMV_Backend.slnx/config/applicationhost.config habilitan Anonymous y deshabilitan Windows.
- CORS localhost:4200 sin SupportsCredentials. API desarrollo/producción Angular apuntan a https://localhost:44350/api.
- Servicios HTTP Angular usan HttpClient y environment.apiUrl; no hay transporte alternativo funcional. Barra muestra Administrador/AD; no existe sesión.

## PROBLEMA DETECTADO
- Acceso anónimo funcional y auditoría susceptible de identificar incorrectamente por fallback/truncamiento.
- Sin sesión ni credenciales integradas centralizadas en Angular; producción apunta a localhost.
- Preflight sin credenciales se bloquea en IIS antes de Web API si Anonymous está deshabilitada; requiere módulo CORS nativo para escenarios de distinto origen.
- Equipo local WORKGROUP, PartOfDomain=False. Usuario no conoce dominio/longitudes municipales: no se puede afirmar compatibilidad de todas las cuentas reales.

## PROPUESTA
- Windows en IIS Express, modo Windows ASP.NET, impersonate=false, autorización global y quitar todos los AllowAnonymous funcionales.
- UsuarioActualService como fuente única: preservar DOMINIO\usuario, validar formato/longitud sin truncar; fallback explícito sólo Debug + entorno Development + petición local + configuración habilitada. Release no contiene rama de fallback.
- GET api/auth/me sin consulta AD; grupo Windows opcional configurable, 401 sin identidad y 403 sin pertenencia. No crear tabla de usuarios/contraseñas.
- Mantener longitudes y EDMX; entregar verificación de columnas/cuentas a Informática antes del despliegue. Fallar expresamente si exceden capacidad.
- Angular: sesión inicial, estados carga/401/403/error, usuario real e interceptor limitado a la API; producción /api bajo mismo origen.
- Documentar módulo CORS, IIS, Negotiate/NTLM, HTTPS, zona Intranet, identidad técnica SQL y validación municipal.

## BASE VALIDADA
- Solución completa Debug compilada con MSBuild VS18 Community; 10 smoke tests pasan.
- Angular Node 14.21.3: build desarrollo y 98 pruebas ChromeHeadless pasan. No se reprodujo fallo GPU/cifrado.
- Intento MSBuild de SSMS falló por Roslyn ausente; se resolvió usando Visual Studio. Node14 no admite openssl-legacy-provider; se ejecutó sin esa opción.