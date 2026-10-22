# Usuarios internos: Windows municipal y cuenta local IMV

La rama feat/usuarios-windows contiene ambos mecanismos sobre un único IdUsuarioAplicacion. Esta guía reemplaza la configuración anterior de Windows exclusivo. La migración está preparada y probada. Posteriormente se aplicó explícitamente a la base local de desarrollo; ver [ingreso y administración en desarrollo](ingreso-desarrollo.md). No se aplicó al entorno municipal.

## Estructura y permisos

La inspección previa no encontró usuarios/credenciales/roles de aplicación en el SQL, la base local ni el EDMX. Personas representa beneficiarios y no se reutiliza como tabla de empleados.

La migración database/migrations/20261002_14_usuarios_aplicacion.sql crea dbo.UsuariosAplicacion: identificador, nombre, estado activo, una cuenta Windows opcional, un login local opcional, hash de contraseña, versión revocable de sesión y contadores de intentos. Las dos identidades tienen índices únicos sin distinguir mayúsculas. Ambas pueden pertenecer a la misma fila.

No hay roles funcionales existentes que migrar. Todos los usuarios internos activos conservan el acceso funcional actual. El grupo Windows configurable sigue siendo una condición adicional de entrada Windows, no un rol del sistema; el acceso local requiere siempre alta administrativa. Los futuros permisos deben referenciar IdUsuarioAplicacion, independientemente del método de ingreso.

No hay altas automáticas ni vinculación por similitud de nombre. Informática debe registrar las cuentas Windows ya autorizadas antes de habilitar el nuevo backend. Si un empleado local recibe cuenta municipal, usar VincularWindows sobre su Id existente, sin crear una segunda fila. La alternativa de múltiples identidades/roles separados quedó documentada en usuarios-autenticacion-mixta-diagnostico.md y no se implementó.

Las tablas nuevas se consultan por SQL parametrizado de EF6, siguiendo el patrón existente de AuditoriaRepository. No se modificó manualmente EDMX, plantillas ni entidades generadas; tampoco se cambió la tecnología.

## Contratos de autenticación

| Endpoint | Acceso | Función |
| --- | --- | --- |
| GET /api/auth/me | Usuario interno válido | Devuelve la sesión común, sin hashes ni secretos. |
| GET /api/auth/windows | Windows exigido por IIS y comprobado por código | Resuelve la cuenta de HttpContext.Current.User.Identity contra un usuario interno activo y emite sesión de aplicación. |
| POST /api/auth/login | Entrada anónima de autenticación, HTTPS y protección de solicitud | Recibe únicamente Usuario y Contrasena IMV. Rechaza cuentas inexistentes, inactivas, bloqueadas y claves incorrectas con el mismo mensaje. |
| POST /api/auth/salir | Usuario interno válido y solicitud protegida | Revoca las cookies emitidas para ese usuario y borra la cookie del navegador. No cierra la sesión de Windows. |

Ejemplo de sesión local (Windows devuelve también CuentaWindows/Dominio):

```json
{
  "Autenticado": true,
  "IdUsuarioAplicacion": 42,
  "NombreMostrar": "María",
  "CuentaWindows": null,
  "Dominio": null,
  "UsuarioLocal": "maria",
  "MetodoIngreso": "Local",
  "Iniciales": "MA"
}
```

Los únicos AllowAnonymous de Web API son las dos entradas de autenticación; Windows exige explícitamente identidad autenticada incluso si IIS se configura mal. Los endpoints funcionales mantienen autorización global. Los headers propios y los campos de auditoría enviados en body no definen la identidad.

El servidor resuelve Id/Activo/VersionSesion en cada petición. La deshabilitación, el cambio de contraseña y la revocación de versión invalidan cookies anteriores. No hay fallback silencioso de desarrollo para un usuario interno.

## Flujo Angular

1. Consulta me para recuperar una sesión existente.
2. Si recibe 401, intenta automáticamente windows. Los municipales reconocidos no escriben credenciales en la aplicación.
3. La opción Usar cuenta IMV está disponible también durante la carga y cancela el intento pendiente; abre el formulario local.
4. El formulario envía la contraseña sólo al POST de login por HTTPS y la borra de su estado al enviarla. No hay password/token en localStorage, sessionStorage, URL ni respuestas.
5. Ambos ingresos muestran NombreMostrar y la misma identificación interna; todas las operaciones HTTP a la API envían credenciales. Las operaciones de escritura agregan X-IMV-Solicitud: 1.
6. El cierre visible corresponde a una sesión ingresada localmente. Windows/navegador conservan su propia sesión.

En un equipo fuera de la zona Intranet, el navegador puede presentar su propio diálogo de Windows al solicitar windows. Si no corresponde, cancelarlo y elegir Usar cuenta IMV. JavaScript no puede detectar ni controlar una sesión Windows o su diálogo de credenciales. Informática debe verificar el comportamiento con la zona/políticas del navegador municipal.

## Contraseñas, sesión y protección de solicitudes

- BCrypt.Net-Next 4.1.0, ensamblado net35 compatible con net452, modo Enhanced con SHA384 y costo 12. Sal aleatoria individual; el prehash de la biblioteca evita truncamiento silencioso de contraseñas largas. No se implementó criptografía propia.
- Creación/reset administrativo: 15 a 128 caracteres; se recomienda una frase larga. Es una protección técnica para el nuevo ingreso sin MFA, no una regla de permisos.
- Únicamente se guarda el hash versionado bcrypt-sha384-v1. El modelo también excluye hash y versión de sesión ante serialización accidental. No se verifica ni almacena una contraseña Windows.
- Cookie IMV.Sesion cifrada y autenticada por ASP.NET MachineKey, AES/HMACSHA256, Secure y HttpOnly, de navegador, con ticket de 30 minutos sin renovación automática. Incluye Id, versión y método; no contiene contraseña.
- SameSite=None en configuración local para http://localhost:4200 hacia API HTTPS; Release transforma a Strict para producción bajo mismo origen. Si se publican archivos manualmente, configurar Strict y el origen antes de desplegar. Un navegador que bloquee cookies de terceros puede requerir servir ambos bajo mismo origen o ajustar el ambiente de desarrollo a HTTPS coherente.
- Escrituras exigen JSON y el header X-IMV-Solicitud; un Origin presente debe coincidir con el origen de API o el único CorsOrigenPermitido. La protección también se aplica al login. No habilitar wildcard con credenciales.
- Cinco fallos locales bloquean ese login 15 minutos en SQL; el bloqueo local no impide Windows asociado si el usuario sigue activo. Además, 30 intentos por dirección remota en cinco minutos por proceso, con memoria limitada, devuelven 429. No se confía en X-Forwarded-For propio. Para granjas, complementar el límite por dirección en la infraestructura; el bloqueo por usuario sigue centralizado en SQL.
- No habilitar registro de bodies del login en APM, tracing o proxy. El código no registra DTOs ni contraseñas. La contraseña existe temporalmente en memoria de navegador/servidor durante la autenticación y viaja dentro de TLS.

Referencias: [BCrypt.Net](https://github.com/BcryptNet/bcrypt.net), [paquete 4.1.0](https://www.nuget.org/packages/BCrypt.Net-Next/4.1.0), [OWASP almacenamiento de contraseñas](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html), [Microsoft protección CSRF](https://learn.microsoft.com/en-us/aspnet/web-api/overview/security/preventing-cross-site-request-forgery-csrf-attacks).

## Auditoría y vinculación

IUsuarioActualService es la fuente única: ObtenerIdUsuarioActual devuelve el Id interno y ObtenerUsuarioActual devuelve USUARIO:<id>. Esa referencia corta cabe en las columnas funcionales existentes y no cambia al agregar una cuenta Windows.

AuditoriaCambios agrega IdUsuarioAplicacion nullable con FK y sin cascade. Toda nueva alta/modificación/baja registrada por AuditoriaService lleva Id, referencia estable y FechaHora en la misma transacción funcional existente. Las bajas lógicas de titulares y los cambios notariales también utilizan el mismo responsable. UsuarioResponsable conserva la referencia estable.

Las filas históricas mantienen Usuario y un Id NULL. No se asigna un Id por coincidencia de texto ni se reescribe historia: el trigger append-only continúa vigente. La identificación de filas nuevas puede resolverse con:

```sql
SELECT a.IdAuditoria, a.Operacion, a.FechaHora, a.IdUsuarioAplicacion,
       u.NombreMostrar, a.Usuario
FROM dbo.AuditoriaCambios a
LEFT JOIN dbo.UsuariosAplicacion u ON u.IdUsuarioAplicacion=a.IdUsuarioAplicacion;
```

Los usuarios se deshabilitan, no se eliminan; la FK impide eliminar un responsable referenciado. Las relaciones funcionales existentes no se rediseñaron.

## Alta y administración interna

Compilar primero. Ejecutar tools/Administrar-UsuarioAplicacion.ps1 con Windows PowerShell 5.1 desde una estación administrativa, con conexión SQL cifrada y certificado confiable. Usa la identidad administrativa integrada; no incluye claves SQL ni expone un endpoint público de alta.

```powershell
.\tools\Administrar-UsuarioAplicacion.ps1 -Accion AltaWindows -Servidor SQL_MUNICIPAL -NombreMostrar 'Juan Pérez' -CuentaWindows 'MUNICIPALIDAD\jperez'
.\tools\Administrar-UsuarioAplicacion.ps1 -Accion AltaLocal -Servidor SQL_MUNICIPAL -NombreMostrar 'María' -UsuarioLocal maria
.\tools\Administrar-UsuarioAplicacion.ps1 -Accion VincularWindows -Servidor SQL_MUNICIPAL -IdUsuarioAplicacion 42 -CuentaWindows 'MUNICIPALIDAD\maria'
.\tools\Administrar-UsuarioAplicacion.ps1 -Accion Deshabilitar -Servidor SQL_MUNICIPAL -IdUsuarioAplicacion 42
.\tools\Administrar-UsuarioAplicacion.ps1 -Accion Habilitar -Servidor SQL_MUNICIPAL -IdUsuarioAplicacion 42
.\tools\Administrar-UsuarioAplicacion.ps1 -Accion CambiarContrasena -Servidor SQL_MUNICIPAL -IdUsuarioAplicacion 42
```

La contraseña se solicita con Read-Host -AsSecureString y se hashea dentro del proceso; nunca se acepta por argumento de línea de comandos. VincularWindows no reemplaza una cuenta ya vinculada y el índice único impide asociarla a otra fila.

## IIS Express y despliegue municipal

Antes de activar el código:

1. Respaldar base y revisar/aplicar 20261002_14_usuarios_aplicacion.sql con Informática. No hay actualización de esquema automática al iniciar la API. Mantener la migración previa de auditoría.
2. Registrar las cuentas Windows existentes; vincular sobre usuarios locales cuando corresponda. Definir nombres/estado activo y verificar cuentas municipales reales. No se consultó AD ni se conocen aún esas cuentas.
3. Configurar IIS: Windows Authentication instalada; sitio de transporte general con Anonymous habilitada y Windows deshabilitada; ruta exacta api/auth/windows con Anonymous deshabilitada y Windows habilitada. Esto permite llegar al login local, pero no autoriza endpoints funcionales.
4. En IIS Express ejecutar Enable-MixedAuthIisExpress.ps1 sobre el applicationhost.config del sitio correcto y reiniciar. El script guarda respaldo y sólo modifica las dos ubicaciones. No ejecutar el script anterior Enable-WindowsAuthIisExpress.ps1, que corresponde al flujo Windows exclusivo.
5. En IIS productivo configurar las mismas ubicaciones en applicationHost.config/IIS Manager, con proveedores Negotiate y NTLM. Desbloquear/delegar las secciones únicamente donde sea necesario; cambiar Web.config no instala ni configura el servidor IIS.
6. Usar HTTPS con certificado confiable y frontend/API bajo el mismo origen, conservando el path /api. Configurar Strict y CORS vacío en ese caso. Evitar terminar TLS antes del host sin una configuración explícita que conserve la condición segura.
7. Configurar zona Intranet/lista autorizada del navegador y verificar negociación Windows. Para API/Angular en orígenes distintos, CORS permite sólo el origen configurado y credenciales. El preflight general funciona por la entrada mixta; los rechazos nativos de la ruta Windows pueden necesitar IIS CORS Module para que el navegador lea sus 401, como documenta Microsoft.
8. Application pool .NET CLR v4 e integrado. Conceder a su cuenta técnica los permisos funcionales de SQL y SELECT/UPDATE necesarios sobre UsuariosAplicacion; el alta administrativa requiere permisos separados. Mantener impersonate=false y SQL Integrated Security del proceso. No conceder permisos SQL a cada empleado.
9. En un único servidor se usa MachineKey automática del host. En granja, provisionar claves criptográficas fuertes compartidas mediante configuración protegida, fuera de Git. No cambiar claves sin contemplar que revocará cookies.
10. Verificar me en ambos ingresos, operaciones y IdUsuarioAplicacion en auditoría; repetir con un usuario deshabilitado y un equipo sin cuenta municipal.

[IIS CORS Module](https://learn.microsoft.com/en-us/iis/extensions/cors-module/cors-module-configuration-reference).

## Validación reproducible

- Compilar IMV_Backend.slnx Debug/Release y ejecutar IMV.Application.SmokeTests.exe.
- tools/Test-MixedAuthIntegration.ps1 -Servidor <SQL_LOCAL>: requiere PowerShell 7, IIS Express, proyecto compilado y permisos para crear una base temporal. Crea una base vacía con nombre único IMV_Auth_Pruebas_<guid>, configura un sitio aislado, realiza pruebas reales y elimina únicamente esa base al finalizar. No modifica IMV_Gestion. Su omisión de validación del certificado se limita al certificado de desarrollo de localhost.
- Angular Node 14: npm run build, npm run build -- --prod, npm test -- --watch=false --browsers=ChromeHeadless --progress=false --reporters=dots.

No se implementaron recuperación por correo, MFA, LDAP adicional, autoservicio de alta ni pantallas de roles.