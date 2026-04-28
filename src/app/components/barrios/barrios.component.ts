import { Component, OnInit } from '@angular/core';
import { Barrio } from 'src/app/models/barrio.model';
import { BarrioService } from 'src/app/services/barrio.service';

@Component({
  selector: 'app-barrios',
  templateUrl: './barrios.component.html'
})
export class BarriosComponent implements OnInit {
  listaBarrios: Barrio[] = [];

  constructor(private _barrioService: BarrioService) { }

  ngOnInit(): void {
    this.cargarBarrios();
  }

  cargarBarrios(): void {
    this._barrioService.getBarrios().subscribe(data => {
      this.listaBarrios = data;
    });
  }

  verDetalle(barrio: Barrio) { /* Lógica similar a planes */ }
  editarBarrio(barrio: Barrio) { /* Lógica similar a planes */ }
}