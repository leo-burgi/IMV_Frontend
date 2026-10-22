# Ingresar y administrar usuarios en desarrollo

## Este equipo ya está preparado

El 2 de octubre de 2026 se aplicó la migración de usuarios en la base **local** `DESKTOP-1PJ5BGV / IMV_Gestion`, se configuró el sitio IIS Express `IMV_Backend` y se registró `DESKTOP-1PJ5BGV\IMV` como usuario interno **1**, activo. No se creó una contraseña predeterminada ni un bypass de autenticación. La configuración IIS previa tiene respaldo `.mixed-auth.bak`.

Con el backend iniciado en Visual Studio y Angular mediante `npm start`:

- Abrir **http://localhost:4200** y elegir **Ingresar con Windows municipal** para usar la cuenta Windows del equipo.
- Abrir **http://localhost:4200/?ingreso=local** para elegir directamente usuario y contraseña IMV, sin iniciar una negociación Windows. Este enlace no autoriza ni cierra una sesión: el backend siempre valida las credenciales y el usuario interno.
- API de desarrollo: **https://localhost:44350**. El certificado HTTPS de IIS Express debe ser confiable para el navegador. Un diálogo de credenciales Windows corresponde al navegador; no ingresar la contraseña Windows en el formulario IMV.

La cuenta local del equipo se registró sólo en esta base de desarrollo. Para el municipio se deben registrar sus cuentas reales y configurar su IIS, sin ejecutar esta preparación local contra una base remota.

## Crear un usuario local IMV

Abrir Windows PowerShell en la raíz del repositorio backend y ejecutar:

```powershell
.\tools\Administrar-UsuarioAplicacion.ps1 -Accion AltaLocal -Servidor DESKTOP-1PJ5BGV -BaseDatos IMV_Gestion -ConfiarCertificadoLocal -NombreMostrar 'Nombre Apellido' -UsuarioLocal nombre.apellido
```

El script solicita la contraseña en una entrada oculta. Debe tener de 15 a 128 caracteres. No pasar contraseñas como argumentos, no usar la contraseña municipal y no crear contraseñas fijas compartidas. El resultado muestra el ID interno. Luego abrir el enlace de ingreso local y escribir el usuario creado.

El alta es administrativa mediante permisos SQL del operador. No se agregó un endpoint público ni autoservicio de usuarios. Revisar el listado antes de dar de alta para evitar duplicar a la misma persona.

## Ver usuarios y administrar su acceso

```powershell
# Sólo muestra ID, nombre, cuentas asociadas y estado; no expone hashes.
.\tools\Administrar-UsuarioAplicacion.ps1 -Accion Listar -Servidor DESKTOP-1PJ5BGV -ConfiarCertificadoLocal

# Registrar otra cuenta Windows autorizada.
.\tools\Administrar-UsuarioAplicacion.ps1 -Accion AltaWindows -Servidor DESKTOP-1PJ5BGV -ConfiarCertificadoLocal -NombreMostrar 'Nombre Apellido' -CuentaWindows 'DOMINIO\usuario'

# Vincular la cuenta municipal a un usuario local existente: reemplazar 42 por su ID.
.\tools\Administrar-UsuarioAplicacion.ps1 -Accion VincularWindows -Servidor DESKTOP-1PJ5BGV -ConfiarCertificadoLocal -IdUsuarioAplicacion 42 -CuentaWindows 'DOMINIO\usuario'

.\tools\Administrar-UsuarioAplicacion.ps1 -Accion Deshabilitar -Servidor DESKTOP-1PJ5BGV -ConfiarCertificadoLocal -IdUsuarioAplicacion 42
.\tools\Administrar-UsuarioAplicacion.ps1 -Accion Habilitar -Servidor DESKTOP-1PJ5BGV -ConfiarCertificadoLocal -IdUsuarioAplicacion 42
.\tools\Administrar-UsuarioAplicacion.ps1 -Accion CambiarContrasena -Servidor DESKTOP-1PJ5BGV -ConfiarCertificadoLocal -IdUsuarioAplicacion 42
```

CambiarContrasena requiere un usuario que ya tenga cuenta local y vuelve a solicitar la nueva contraseña oculta. Habilitar, deshabilitar, vincular y cambiar contraseña revocan sus sesiones previas.

`ConfiarCertificadoLocal` mantiene la conexión SQL cifrada y permite su certificado de desarrollo. Está restringido al equipo local; rechaza servidores remotos. Para SQL municipal omitirlo y utilizar un certificado confiable.

## Preparar nuevamente otro checkout local

Compilar el backend y, desde su raíz, ejecutar:

```powershell
.\tools\Preparar-EntornoDesarrollo.ps1
```

Lee servidor/base de Web.config, verifica que SQL sea local y que el sitio IIS apunte al proyecto API de este checkout. Aplica únicamente la migración de usuarios y registra la cuenta Windows actual si falta. Repetirlo no crea duplicados ni habilita usuarios que ya estaban deshabilitados. No crea ni elimina bases de datos, no modifica tablas de negocio y no guarda contraseñas.

Si Visual Studio usa otro applicationhost.config, indicar `-ConfigPath` y, si corresponde, `-SiteName`. Reiniciar IIS Express/Visual Studio después de cambiar su configuración. El script no termina procesos automáticamente.

## Validación de este cambio

- Preparación aplicada y repetida: mismo usuario interno 1, sin duplicados.
- Ingreso real del equipo: `/api/auth/windows` y `/api/auth/me` devolvieron HTTP 200 y el ID esperado; también se verificó el portal en navegador.
- Administración probada en Windows PowerShell 5.1 sobre base temporal: alta local con entrada segura, hash verificable, vinculación, habilitación/deshabilitación, revocación, cambio de contraseña, listado sin secretos y rechazo de confianza SQL remota. Base temporal eliminada.
- Frontend: 122 pruebas aprobadas, incluyendo ingreso local directo sin llamadas Windows; compilación de producción aprobada y revisión visual de la pantalla.

Cambios de esta etapa: `tools/Preparar-EntornoDesarrollo.ps1`, `tools/Administrar-UsuarioAplicacion.ps1`, codificación UTF-8 compatible con Windows PowerShell en `tools/Enable-MixedAuthIisExpress.ps1`; `src/app/app.component.ts`, HTML/CSS y su spec; `src/app/app-ingreso.css`; componente y CSS de ingreso local; esta guía y enlaces desde el manual.

## Actualización de roles y primer ingreso

La preparación antigua de usuarios no completa el esquema actual. Aplicar las migraciones y el bootstrap explícitos descritos en `../../IMV_Backend/docs/alta-usuarios-primer-ingreso.md`. El alta local habitual ya está disponible exclusivamente para Admin desde el panel de usuario; las cuentas nuevas nacen sin roles.
