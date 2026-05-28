import { Component, OnInit } from '@angular/core';
import { CalleService } from 'src/app/services/calle.service';
import { Calle } from 'src/app/models/calle.model';

@Component({
  selector: 'app-calles',
  templateUrl: './calles.component.html',
})
export class CallesComponent implements OnInit {
  listarCalles: Calle[]=[];

  constructor(private calleService: CalleService) { }

  ngOnInit(): void {
    this.calleService.getCalles().subscribe(data => {
      this.listarCalles = data;
    });
  }
  verDetalle(calle: any) {
  alert('Vas a ver el detalle de la calle: ' + calle.NombreCalle);
  
}
}
