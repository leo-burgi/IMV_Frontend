# Usuarios internos y autenticación Windows/local — diagnóstico previo (2026-10-02)

## EXISTENTE
- Ambos repositorios están en feat/usuarios-windows. Hay cambios de la implementación Windows anterior sin commit; se conservarán. No se realizará commit ni push.
- SQL base scriptBASEDATOS14.08.26.sql, migraciones hasta 20260908_13 y esquema local IMV_Gestion revisados. No existe tabla de usuarios, credenciales, roles o permisos de aplicación. Personas contiene datos de beneficiarios; no es una tabla de empleados/usuarios y no debe reutilizarse como tal.
- EF6 Database First tiene las entidades funcionales y campos auditables varchar(50), responsable varchar(100); AuditoriaCambios se accede por SQL parametrizado de EF y tiene Usuario nvarchar(256), FechaHora datetime2. No hay IdUsuario ni FK a usuarios.
- API sólo Windows desde HttpContext, autorización global, grupo Windows opcional. me expone cuenta/dominio/nombre. IIS Express Anonymous deshabilitado, Windows habilitado.
- Angular intenta me y muestra identidad Windows; no tiene login, roles ni almacenamiento de credenciales.
- Campos UsuarioAlta/Modif/Baja/Responsable y AuditoriaCambios se completan desde IUsuarioActualService.

## PROBLEMA DETECTADO
- Un empleado sin Windows es rechazado por IIS antes de alcanzar API. Un formulario solo en Angular no resolvería esa barrera.
- Windows es la representación del responsable; una persona local que posteriormente recibe cuenta municipal no puede conservar una identidad común porque no hay usuario interno.

## PROPUESTA MÍNIMA (implementada)
- Una tabla dbo.UsuariosAplicacion con IdUsuarioAplicacion, NombreMostrar, Activo, CuentaWindows opcional única, UsuarioLocal opcional único, HashContrasena opcional y versión de sesión; columnas para limitar intentos locales. Permite ambos métodos en la misma fila, sin duplicar usuario al vincular Windows. Alta/vinculación/habilitación sólo administrativa mediante herramienta interna.
- Una columna nullable FK IdUsuarioAplicacion en AuditoriaCambios. Mantener historia antigua con NULL, sin inventar equivalencias. Nuevas operaciones registran FK y referencia estable USUARIO:<id> en los campos de texto existentes. No se alteran todas las tablas funcionales ni se reemplazan sus historiales.
- Repositorios SQL parametrizados de EF6 como AuditoriaRepository; no se edita manualmente EDMX ni entidades generadas.
- Windows permanece integrado en /api/auth/windows. IIS debe permitir acceso anónimo al transporte general para que login local pueda llegar; autorización global sigue rechazando operaciones sin usuario interno válido. Ruta Windows mantiene Anonymous deshabilitada y Windows habilitada. No consultar ni verificar contraseñas Windows.
- Login local por HTTPS, BCrypt.Net-Next 4.1.0 compatible net452 (ensamblado net35), modo Enhanced SHA384 con sal aleatoria y costo 12 (sin truncamiento bcrypt de contraseñas largas); cookie cifrada/autenticada por ASP.NET MachineKey, Secure/HttpOnly/SameSite, expiración y versión revocable. Sin contraseñas en respuestas, logs, URL, localStorage ni cookies.
- No hay infraestructura de roles: se mantiene el mismo acceso funcional para todo usuario interno activo. El grupo Windows opcional se usa sólo como condición de entrada Windows, no como rol funcional; se requiere además una asociación administrativa a usuario activo.
- Usuarios Windows deben habilitarse/vincularse internamente antes de entrar. No crear usuarios automáticamente ni vincular por coincidencia de nombre.

## ALTERNATIVA EXTENSIBLE (no implementada)
- Separar UsuariosAplicacion, IdentidadesUsuario y CredencialesLocales para admitir varias identidades Windows/proveedores por persona, con tablas de roles/permisos cuando exista una necesidad funcional definida.
- Resuelve múltiples identidades y administración compleja, pero agrega tablas/relaciones y reglas fuera del alcance. La alternativa mínima sólo admite una cuenta Windows y una credencial local por usuario; es suficiente para recibir una cuenta municipal sin perder Id/historia.

## DECISIONES EXTERNAS
- Informática debe dar de alta/vincular cuentas y definir si mantiene GrupoWindowsAutorizado. No se conocen las cuentas/dominio reales.
- Despliegue IIS debe aplicar configuración mixta por ruta y HTTPS; esto reemplaza el requisito anterior de Anonymous deshabilitado globalmente, que es incompatible con el nuevo login local.
- La migración se validará en base aislada antes de aplicarla a IMV_Gestion o producción. No se harán cambios de esquema sobre la base de trabajo automáticamente.