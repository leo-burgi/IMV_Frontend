# Validación de usuarios y autenticación mixta

Fecha: 2 de octubre de 2026. Rama de ambos repositorios: `feat/usuarios-windows`.

## Resultado

Implementación terminada y validada en entorno local. No se hizo commit ni push. La migración NO se aplicó a IMV_Gestion; se ejecutó dos veces para comprobar idempotencia en una base temporal aislada, eliminada al finalizar.

- Backend: compilación Debug y Release aprobadas; 71 comprobaciones de autenticación mixta, identidad, sesiones y auditoría, más 10 pruebas de negocio aprobadas.
- IIS Express + SQL Server + EF6: 29 comprobaciones de integración aprobadas. Incluyen ingreso Windows real, ingreso local, errores genéricos, bloqueo por intentos, usuario inactivo, cookies y revocación, alta/modificación con auditoría, FK, protección de auditoría y vinculación posterior conservando el identificador.
- Angular: compilaciones de desarrollo y producción aprobadas; 121 pruebas ChromeHeadless aprobadas.
- Scripts PowerShell: sintaxis validada. Ambos repositorios: git diff --check aprobado.

La prueba Windows utilizó la cuenta real del equipo de trabajo DESKTOP-1PJ5BGV\IMV. El equipo pertenece a WORKGROUP: no se comprobó todavía una cuenta del dominio municipal ni el comportamiento de sus navegadores y políticas de red.

## Base de datos y API

Migración preparada: `database/migrations/20261002_14_usuarios_aplicacion.sql`. Agrega UsuariosAplicacion y una FK nullable IdUsuarioAplicacion en AuditoriaCambios. No altera el EDMX ni las tablas de negocio. Los registros históricos de auditoría mantienen su texto y un ID nulo; no se atribuyen automáticamente a personas.

Endpoints: GET /api/auth/me; GET /api/auth/windows; POST /api/auth/login; POST /api/auth/salir. Los endpoints funcionales resuelven el mismo usuario interno activo por ambos mecanismos. La auditoría nueva guarda su ID y una referencia estable USUARIO:<id> en los campos de texto existentes.

Las contraseñas locales se almacenan como BCrypt con prehash SHA-384, costo 12 y sal aleatoria. No se incluyen en DTOs de respuesta. El ingreso local exige HTTPS; el formulario no conserva la contraseña en almacenamiento del navegador. La administración solicita la contraseña mediante entrada segura.

## Activación pendiente

1. Aplicar la migración en la base de destino y dar de alta usuarios internos autorizados mediante tools/Administrar-UsuarioAplicacion.ps1.
2. Configurar IIS según el manual: acceso anónimo de transporte con autorización de aplicación; Windows integrado exclusivamente en /api/auth/windows. Usar HTTPS y revisar origen/CORS y cookies según el despliegue.
3. Verificar cuentas municipales reales, permisos de conexión SQL del proceso y flujo automático de Windows en el navegador del entorno.

La asociación posterior de una cuenta Windows utiliza VincularWindows sobre el usuario interno existente y conserva auditoría, historial y relaciones. No se agregaron roles ni permisos inexistentes. La alternativa extensible de identidades separadas se documentó y no se implementó.

## Archivos modificados

El siguiente inventario incluye los cambios de la implementación Windows ya presentes y la ampliación local. No incluye binarios ni paquetes ignorados.
### IMV_Backend

- `database/migrations/20261002_14_usuarios_aplicacion.sql'
- `docs/autenticacion-windows-auditoria.md'
- `docs/usuarios-autenticacion-mixta-diagnostico.md'
- `docs/usuarios-autenticacion-mixta.md'
- `IMV.Api/App_Start/UnityConfig.cs'
- `IMV.Api/App_Start/WebApiConfig.cs'
- `IMV.Api/Controllers/AdjudicacionesController.cs'
- `IMV.Api/Controllers/AuditoriaController.cs'
- `IMV.Api/Controllers/AuthController.cs'
- `IMV.Api/Controllers/BarriosController.cs'
- `IMV.Api/Controllers/CallesController.cs'
- `IMV.Api/Controllers/ConsultaIntegralController.cs'
- `IMV.Api/Controllers/DashboardController.cs'
- `IMV.Api/Controllers/InicioController.cs'
- `IMV.Api/Controllers/NotarialesController.cs'
- `IMV.Api/Controllers/PersonasController.cs'
- `IMV.Api/Controllers/PlanesController.cs'
- `IMV.Api/Controllers/PropiedadesController.cs'
- `IMV.Api/Filters/SolicitudSeguraAttribute.cs'
- `IMV.Api/Filters/WindowsAuthorizeAttribute.cs'
- `IMV.Api/IMV.Api.csproj'
- `IMV.Api/packages.config'
- `IMV.Api/Properties/AssemblyInfo.cs'
- `IMV.Api/Services/ContrasenaLocalService.cs'
- `IMV.Api/Services/IntentosIngresoService.cs'
- `IMV.Api/Services/SesionAplicacionService.cs'
- `IMV.Api/Services/UsuarioActualService.cs'
- `IMV.Api/Web.config'
- `IMV.Api/Web.Release.config'
- `IMV.Application.SmokeTests/App.config'
- `IMV.Application.SmokeTests/IMV.Application.SmokeTests.csproj'
- `IMV.Application.SmokeTests/MixedAuthTests.cs'
- `IMV.Application.SmokeTests/Program.cs'
- `IMV.Application/Services/AdjudicacionService.cs'
- `IMV.Application/Services/AuditoriaService.cs'
- `IMV.Domain/Dto/AuditoriaDTO.cs'
- `IMV.Domain/Entities/UsuarioAplicacion.cs'
- `IMV.Domain/IMV.Domain.csproj'
- `IMV.Domain/Interfaces/IAuditoriaRepository.cs'
- `IMV.Domain/Interfaces/IUsuarioActualService.cs'
- `IMV.Domain/Interfaces/IUsuarioAplicacionRepository.cs'
- `IMV.Infra/IMV.Infra.csproj'
- `IMV.Infra/Repositories/AuditoriaRepository.cs'
- `IMV.Infra/Repositories/UsuarioAplicacionRepository.cs'
- `tools/Administrar-UsuarioAplicacion.ps1'
- `tools/Enable-MixedAuthIisExpress.ps1'
- `tools/Enable-WindowsAuthIisExpress.ps1'
- `tools/Test-MixedAuthIntegration.ps1'

### imv-frontend

- `docs/autenticacion-windows-auditoria.md'
- `docs/usuarios-autenticacion-mixta-diagnostico.md'
- `docs/usuarios-autenticacion-mixta.md'
- `src/app/app.component.css'
- `src/app/app.component.html'
- `src/app/app.component.spec.ts'
- `src/app/app.component.ts'
- `src/app/app.module.ts'
- `src/app/core/auth/ingreso-local.component.spec.ts'
- `src/app/core/auth/ingreso-local.component.ts'
- `src/app/core/interceptors/windows-auth.interceptor.ts'
- `src/app/core/models/auditoria.model.ts'
- `src/app/core/models/usuario-actual.model.ts'
- `src/app/core/services/auth.service.spec.ts'
- `src/app/core/services/auth.service.ts'
- `src/environments/environment.prod.ts'

Consultar docs/usuarios-autenticacion-mixta.md para configuración y reproducción de las pruebas mediante tools/Test-MixedAuthIntegration.ps1.
