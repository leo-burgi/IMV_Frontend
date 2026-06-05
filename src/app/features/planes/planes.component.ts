import { Component, OnInit } from '@angular/core';
import { PlanService } from 'src/app/core/services/plan.service';
import { Plan } from 'src/app/core/models/plan.model';

@Component({
  selector: 'app-planes',
  templateUrl: './planes.component.html'
})
export class PlanesComponent implements OnInit {
  listaPlanes: Plan[]=[];

  constructor(private planService: PlanService) { }
  
  ngOnInit(): void {
    this.planService.getPlanes().subscribe(data => {
      this.listaPlanes = data;
    });
  }
  verDetalle(plan: any) {
  alert('Vas a ver el detalle del plan: ' + plan.NombrePlan);
  
}

}
