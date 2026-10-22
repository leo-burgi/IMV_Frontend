# Entrega auditoría IMV RAF 2026-10-22

Informe completo, matriz, migraciones, identidad Admin verificada, inventario y activación: `../../IMV_Backend/docs/entrega-auditoria-20261022.md`.

Frontend: Angular 10 sin actualización de dependencias mayores. Node 12.22.12/npm 6.14.16 fijados; ejecutar `tools/Verificar-Frontend.ps1 -NodeDirectory <carpeta-node12>`. Se verificaron TypeScript, 127 pruebas ChromeHeadless y producción. Evidencia: audit-final.log.

No se desplegó. API y frontend requieren activación coordinada después de aplicar manualmente las migraciones documentadas. Clientes sin VersionFila no pueden editar. La aceptación IIS/Windows municipal y la validación manual de accesibilidad siguen pendientes.


## Ampliación: alta y primer ingreso

Se implementó el alta exclusiva de Admin y la habilitación local sobre cuentas Windows existentes. Guía operativa: ../../IMV_Backend/docs/alta-usuarios-primer-ingreso.md. La nueva verificación aprobó 129 pruebas Angular, TypeScript y producción con Node 12.22.12; evidencia en onboarding-frontend.log. El esquema real requiere instalación manual previa.
