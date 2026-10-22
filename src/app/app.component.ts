import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild } from '@angular/core';
import { ConsultaDestino, ConsultaDestinoContextual, ConsultaIntegralEstado, ConsultaIntegralNavegacion } from './core/models/consulta-integral.model';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { AuthService } from './core/services/auth.service';
import { ImvSearchService } from './core/services/imv-search.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './app-ingreso.css', './app-usuario.css']
})
export class AppComponent implements OnInit, OnDestroy {

  mostrarIngresoLocal = false;
  usuariosAdmin: any[] = [];
  errorSeguridad = '';
  exitoSeguridad = '';
  nombreAltaLocal = '';
  usuarioAltaLocal = '';
  contrasenaAltaLocal = '';
  confirmarAltaLocal = '';
  idAltaLocal?: number;
  prepararAltaLocal(usuario?: any): void {
    this.idAltaLocal = usuario?.IdUsuarioAplicacion;
    this.nombreAltaLocal = usuario?.NombreMostrar || '';
    this.usuarioAltaLocal = ''; this.contrasenaAltaLocal = ''; this.confirmarAltaLocal = '';
    this.exitoSeguridad = ''; this.errorSeguridad = '';
  }
  crearUsuarioLocal(): void {
    if (this.guardandoSeguridad) { return; }
    if (this.contrasenaAltaLocal !== this.confirmarAltaLocal) { this.errorSeguridad = 'Las contraseñas no coinciden.'; return; }
    this.guardandoSeguridad = true; this.exitoSeguridad = ''; this.errorSeguridad = '';
    const solicitud = this.http.post<{IdUsuarioAplicacion: number}>(environment.apiUrl + '/seguridad/usuarios/local', {
      IdUsuarioExistente: this.idAltaLocal, NombreMostrar: this.nombreAltaLocal.trim(), UsuarioLocal: this.usuarioAltaLocal.trim(),
      Contrasena: this.contrasenaAltaLocal, Confirmacion: this.confirmarAltaLocal
    });
    this.contrasenaAltaLocal = ''; this.confirmarAltaLocal = '';
    const vinculando = this.idAltaLocal !== undefined;
    solicitud.subscribe(
      resultado => {
        this.guardandoSeguridad = false; this.prepararAltaLocal();
        if (vinculando && resultado.IdUsuarioAplicacion === this.auth.usuario?.IdUsuarioAplicacion) {
          this.menuUsuarioAbierto = false; this.auth.elegirIngresoLocal(); this.mostrarIngresoLocal = true;
        } else {
          this.exitoSeguridad = vinculando ? 'Ingreso IMV habilitado sobre la misma identidad. Se revocaron sus sesiones; sus roles se conservaron.' :
            'Cuenta IMV creada sin roles. Puede iniciar sesión, cambiar su contraseña y esperar la asignación de permisos.';
          this.cargarUsuarios();
        }
      },
      error => { this.guardandoSeguridad = false; this.errorSeguridad = error.status === 409 ? 'La cuenta cambió o el usuario IMV ya está utilizado. Actualizá la lista.' :
        'No se pudo crear el ingreso IMV. Revisá los datos, la contraseña de 15 a 128 caracteres y tus permisos.'; }
    );
  }
  guardandoSeguridad = false;
  claveActual = '';
  claveNueva = '';
  readonly rolesDisponibles = ['Admin', 'Administrativo', 'Notarial', 'Contable'];
  private reloj: any;
  private rutas?: Subscription;
  private sesion?: Subscription;
  puede(rol: string): boolean { return !!this.auth.usuario?.Roles?.some(r => r === 'Admin' || r === rol); }
  cargarUsuarios(): void {
    this.panelUsuario = 'usuarios'; this.errorSeguridad = '';
    this.http.get<any[]>(environment.apiUrl + '/seguridad/usuarios').subscribe(
      usuarios => this.usuariosAdmin = usuarios,
      () => this.errorSeguridad = 'No se pudo consultar la administración de usuarios.');
  }
  asignarRol(usuario: any, rol: string, marcado: boolean): void {
    usuario.Roles = marcado ? usuario.Roles.concat([rol]) : usuario.Roles.filter(r => r !== rol);
  }
  guardarAcceso(usuario: any): void {
    if (this.guardandoSeguridad) { return; }
    this.guardandoSeguridad = true; this.errorSeguridad = '';
    this.http.put(environment.apiUrl + '/seguridad/usuarios/' + usuario.IdUsuarioAplicacion,
      { Activo: usuario.Activo, Roles: usuario.Roles, Version: usuario.Version }).subscribe(
      () => {
        this.guardandoSeguridad = false;
        if (usuario.IdUsuarioAplicacion === this.auth.usuario?.IdUsuarioAplicacion) { this.auth.elegirIngresoLocal(); this.mostrarIngresoLocal = true; }
        else { this.cargarUsuarios(); }
      },
      () => { this.guardandoSeguridad = false; this.errorSeguridad = 'No se pudo cambiar el acceso. Conservá un Admin activo y actualizá la lista antes de reintentar.'; });
  }
  cambiarClave(): void {
    if (this.guardandoSeguridad) { return; }
    this.guardandoSeguridad = true; this.errorSeguridad = '';
    const solicitud = this.http.post(environment.apiUrl + '/seguridad/contrasena', { Actual: this.claveActual, Nueva: this.claveNueva });
    this.claveActual = ''; this.claveNueva = '';
    solicitud.subscribe(
      () => { this.guardandoSeguridad = false; this.auth.elegirIngresoLocal(); this.mostrarIngresoLocal = true; this.menuUsuarioAbierto = false; },
      () => { this.guardandoSeguridad = false; this.errorSeguridad = 'No se pudo cambiar la contraseña. Verificá la clave actual, la política o reintentá más tarde.'; });
  }
  ngOnDestroy(): void { if (this.reloj) { clearInterval(this.reloj); } this.rutas?.unsubscribe(); this.sesion?.unsubscribe(); }
  menuUsuarioAbierto = false;
  panelUsuario = 'perfil';
  @ViewChild('disparadorUsuario') disparadorUsuario?: ElementRef<HTMLButtonElement>;
  @ViewChild('panelUsuarioElemento') panelUsuarioElemento?: ElementRef<HTMLElement>;
  abrirMenuUsuario(): void {
    if (this.menuUsuarioAbierto) { this.cerrarMenuUsuario(); return; }
    this.menuUsuarioAbierto = true;
    if (this.menuUsuarioAbierto) {
      setTimeout(() => { const boton = this.panelUsuarioElemento?.nativeElement.querySelector('button'); if (boton) { boton.focus(); } });
    }
  }
  cerrarMenuUsuario(): void {
    this.claveActual = ''; this.claveNueva = ''; this.contrasenaAltaLocal = ''; this.confirmarAltaLocal = '';
    this.menuUsuarioAbierto = false;
    if (this.disparadorUsuario) { this.disparadorUsuario.nativeElement.focus(); }
  }
  @HostListener('window:beforeunload', ['$event']) antesDeRecargar(event: BeforeUnloadEvent): void {
    if (document.querySelector('main input.ng-dirty,main select.ng-dirty,main textarea.ng-dirty')) { event.preventDefault(); event.returnValue = ''; }
  }
  @HostListener('document:keydown.escape') escapeUsuario(): void {
    if (this.menuUsuarioAbierto) { this.cerrarMenuUsuario(); }
  }
  @HostListener('document:click', ['$event']) clicExteriorUsuario(event: MouseEvent): void {
    const objetivo = event.target as Node;
    if (this.menuUsuarioAbierto && !this.panelUsuarioElemento?.nativeElement.contains(objetivo) &&
        !this.disparadorUsuario?.nativeElement.contains(objetivo)) { this.cerrarMenuUsuario(); }
  }
  cerrarSesiones(): void {
    const editando = Array.from(document.querySelectorAll('form.ng-dirty,main input.ng-dirty,main textarea.ng-dirty,main select.ng-dirty')).length > 0;
    if (editando && !window.confirm('Hay cambios sin guardar. ¿Descartarlos y cerrar todas tus sesiones de IMV?')) { return; }
    this.auth.salirLocal(() => {
      this.menuUsuarioAbierto = false; this.usuariosAdmin = []; this.claveActual = ''; this.claveNueva = ''; this.errorSeguridad = ''; this.searchService.setSearch('');
      this.destinoContextual = undefined; this.consultaIntegralEstado = undefined;
      this.seccionActiva = 'bienvenida'; this.mostrarIngresoLocal = true;
    });
  }

  sesionPorVencer(): boolean {
    const fin = Date.parse(this.auth.usuario?.ExpiraUtc || '');
    return isFinite(fin) && fin - Date.now() < 120000;
  }
  reautenticar(): void {
    if (window.confirm('Para volver a ingresar se descartará el formulario abierto. ¿Continuar?')) { this.auth.elegirIngresoLocal(); this.mostrarIngresoLocal = true; }
  }

  // estado inicial
  seccionActiva: string = 'bienvenida';
  consultaIntegralEstado?: ConsultaIntegralEstado;
  destinoContextual?: { seccion: ConsultaDestino; id: number };

  // sidebar colapsable
  sidebarCollapsed: boolean = false;

  avisosImportantes: string[] = [
    'Las secciones aún están en desarrollo, pueden tener datos incompletos o no funcionar como se espera',
    'Se recomienda usar el buscador para navegar a las secciones de interés',
    '"Estado de migración de datos" hace referencia a datos migrados del archivo Excel histórico y debe ser completado por personal idóneo para que el sistema funcione correctamente.',
  ];

  constructor(private searchService: ImvSearchService, public auth: AuthService, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    try { this.sidebarCollapsed = localStorage.getItem('imv.sidebarCollapsed') === 'true'; } catch (_) {}
    this.reloj = setInterval(() => {}, 30000);
    this.rutas = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = this.router.parseUrl(event.urlAfterRedirects);
        this.seccionActiva = url.root.children.primary?.segments[0]?.path || 'bienvenida';
        const id = Number(url.queryParams.id);
        this.destinoContextual = id > 0 ? { seccion: this.seccionActiva as ConsultaDestino, id } : undefined;
      }
    });
    this.sesion = this.auth.estado$.subscribe(estado => {
      if (estado === 'autenticado') { this.router.navigateByUrl(this.router.url); }
      else if (estado === 'no-autenticado') { this.destinoContextual = undefined; this.consultaIntegralEstado = undefined; this.usuariosAdmin = []; this.claveActual = ''; this.claveNueva = ''; this.prepararAltaLocal(); this.searchService.setSearch(''); }
    });
    // El enlace local evita iniciar la negociación Windows cuando se elige cuenta IMV.
    this.mostrarIngresoLocal = new URLSearchParams(window.location.search).get('ingreso') === 'local';
    if (this.mostrarIngresoLocal) { this.auth.elegirIngresoLocal(); }
    else { this.auth.cargarSesion(); }
  }

  guardarPreferencias(): void {
    try { localStorage.setItem('imv.sidebarCollapsed', String(this.sidebarCollapsed)); } catch (_) { /* Preferencia disponible en memoria si el navegador bloquea almacenamiento. */ }
  }
  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    this.guardarPreferencias();
  }

  cambiarSeccion(seccion: string) {
    this.destinoContextual = undefined;
    this.router.navigate([seccion]);
  }

  navegarDesdeConsulta(navegacion: ConsultaIntegralNavegacion): void {
    this.consultaIntegralEstado = navegacion.estado;
    this.destinoContextual = { seccion: navegacion.seccion, id: navegacion.id };
    this.router.navigate([navegacion.seccion], { queryParams: { id: navegacion.id } });
  }

  navegarContextual(destino: ConsultaDestinoContextual): void {
    this.destinoContextual = destino;
    this.router.navigate([destino.seccion], { queryParams: { id: destino.id } });
  }

  idDestino(seccion: ConsultaDestino): number | undefined {
    return this.destinoContextual && this.destinoContextual.seccion === seccion
      ? this.destinoContextual.id
      : undefined;
  }

  // buscador
  buscar(query: string) {
    const texto = (query || '').trim().toLowerCase();
    this.searchService.setSearch(texto);

    if (!texto) { return; }

    if (texto.includes('plan')) {
      this.cambiarSeccion('planes'); return;
    }
    if (texto.includes('home') || texto.includes('inicio') ||
        texto.includes('portal') || texto.includes('dashboard')) {
      this.cambiarSeccion('home'); return;
    }
    if (texto.includes('barrio') || texto.includes('bario')) {
      this.cambiarSeccion('barrios'); return;
    }
    if (texto.includes('calle') || texto.includes('cale')) {
      this.cambiarSeccion('calles'); return;
    }
    if (texto.includes('persona')) {
      this.cambiarSeccion('personas'); return;
    }
    if (texto.includes('consulta')) {
      this.cambiarSeccion('consulta-integral'); return;
    }
    if (texto.includes('adjudic')) {
      this.cambiarSeccion('adjudicaciones'); return;
    }
    if (texto.includes('propiedad') || texto.includes('inmueble')) {
      this.cambiarSeccion('propiedades'); return;
    }
    if (texto.includes('notarial')) {
      this.cambiarSeccion('notariales'); return;
    }

    if (['planes', 'barrios', 'calles', 'personas', 'adjudicaciones', 'propiedades', 'notariales', 'consulta-integral'].includes(this.seccionActiva)) {
      return;
    }

    this.cambiarSeccion('home');
  }
}
