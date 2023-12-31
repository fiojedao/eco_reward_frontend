import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { GenericService } from 'src/app/share/generic.service';

@Component({
  selector: 'app-center-detail',
  templateUrl: './center-detail.component.html',
  styleUrls: ['./center-detail.component.css'],
})
export class CenterDetailComponent {
  datos: any; //respuesta del API
  destroy$: Subject<boolean> = new Subject<boolean>();

  //gService es la variable que hace la solucitud
  constructor(
    private gService: GenericService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    let id = this.route.snapshot.paramMap.get('id');
    if (!isNaN(Number(id))) {
      this.getCenter(Number(id));
    }
  }

  getCenter(id: any) {
    this.gService
      .get('center', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        console.log(data);
        this.datos = data;
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
