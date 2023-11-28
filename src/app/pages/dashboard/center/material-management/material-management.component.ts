import { ChangeDetectorRef, Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ExchangeService } from 'src/app/services/exchanging.service';
import { UserService } from 'src/app/services/user.service';
import { GenericService } from 'src/app/share/generic.service';
import { NotificacionService } from 'src/app/share/notificacion.service';
import { TipoMessage } from 'src/app/share/notification.service';
import { ExchangeRequest } from 'src/models/MaterialExchangeModel';
import { CenterMaterial } from 'src/models/MaterialModel';

@Component({
  selector: 'app-material-management',
  templateUrl: './material-management.component.html',
  styleUrls: ['./material-management.component.css'],
})
export class MaterialManagementComponent {
  customers: any[] = [];
  materials: CenterMaterial[] = [];
  centerAdmin: any[] = [];
  userLogin: any;
  selectedCustomer: any;
  fecha = new Date();
  isSuperAdmin: boolean = false;
  isCenterAdmin: boolean = false;
  isClient: boolean = false;
  center: any;
  datos: any; //respuesta del API
  destroy$: Subject<boolean> = new Subject<boolean>();

  total = 0;
  qtyItems = 0;

  displayedColumns: string[] = [
    'material',
    'precio',
    'cantidad',
    'subtotal',
    'acciones',
  ];
  dataSource = new MatTableDataSource<any>();

  constructor(
    private cdr: ChangeDetectorRef,
    private exchangeService: ExchangeService,
    private gService: GenericService,
    private router: Router,
    private userService: UserService,
    private noti: NotificacionService
  ) {
    this.userLogin = this.userService.getInfo();
    this.loadUser(this.userLogin);
    this.loadCustomers();
    this.loadCenterAdmin();
    this.loadMaterials();
  }

  performRedeem() {
    const { user, center, isSuperAdmin } = this.userLogin;
    const centerAux = isSuperAdmin ? this.center: center;
    const { selectedCustomer } = this
    const data = this.exchangeService.getData();

    const exchangeRequest: ExchangeRequest = {
      userId: selectedCustomer.userID,
      exchangeDetails: {
        centerID: centerAux.centerID,
        Exchange_Material_Details: data.map((item: any) => ({
          materialID: item.materialID,
          quantity: item.amount,
          eco_coins: item.price * item.amount
        }))
      }
    };
    console.log(exchangeRequest, selectedCustomer);

    if(selectedCustomer){
      this.gService
      .create('materialexchange', exchangeRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        //Obtener respuesta
        this.noti.mensajeRedirect(
          'Canje creado',
          `Cliente: ${selectedCustomer.name}`,
          TipoMessage.success,
          'home/exchanging/'
        );
        console.log(data);
        this.exchangeService.clearExchange();
      });
    }

  }

  ngOnInit(): void {
    this.exchangeService.currentExchangeData$.subscribe((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.total = this.exchangeService.getTotalAmount();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  actualizarCantidad(item: any) {
    this.exchangeService.addItemToExchange(item, false);
    this.total = this.exchangeService.getTotalAmount();
  }

  /* center's materials */
  loadMaterials() {
    const { center, isSuperAdmin} = this.userLogin;
    const data = this.exchangeService.getData();
    const centerAux = isSuperAdmin ? this.center: center;

    if(centerAux){
      this.gService
      .list(`material/center/${centerAux.centerID}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.materials = response;
        this.materials.forEach(material => {
          material.checked = !!data.find(x => x.materialID === material.materialID);
        });  
      });
    } else {
      this.exchangeService.clearExchange();
    }
  }

  loadUser(data: any) {
    const { user, center, isSuperAdmin, isCenterAdmin, isClient } = data;
    if (isSuperAdmin) {
      this.center = undefined;
      this.selectedCustomer = undefined;
    } else if (isCenterAdmin) {
      if (center) {
        this.center = center;
        this.isCenterAdmin = isCenterAdmin;
      } else {
        this.router.navigate(['home']);
      }
    } else if (isClient || user) {
      this.isClient = isClient;
    }
  }

  loadCenterAdmin() {
    this.gService
      .list('user/role/2')
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.centerAdmin = response;
      });
  }
  loadCustomers() {
    this.gService
      .list('user/role/3')
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.customers = response;
      });
  }

  setSelectedCenter(user: any) {
    if (user) {
      this.gService
        .get('center/user', user.userID)
        .pipe(takeUntil(this.destroy$))
        .subscribe((data: any) => {
          this.center = data;
          this.loadMaterials();
        });
    }
  }

  setSelectedCustomer(user: any) {
    if (user) {
      this.selectedCustomer = user;
    }
  }

  ngAfterViewInit() {
    this.userService.userChanges().subscribe((data) => this.loadUser(data));
  }

  onCheckboxChange(checked: boolean, materialId: number) {
    if (checked) {
      this.loadMaterial(materialId);
    } else{
      this.materials.forEach(material => {
        if (material.materialID === materialId) {
          material.checked = false;
        }
      });    
      this.exchangeService.removeFromExchange(materialId);
    }
  }

  onDeleteMaterial(element: any){
    if(element){
      this.materials.forEach(material => {
        if (material.materialID === element.materialID) {
          material.checked = false;
        }
      });      
      this.exchangeService.removeFromExchange(element.materialID);
      this.cdr.detectChanges();
    }  
  }

  loadMaterial(id: any) {
    this.gService
      .get('material/', id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: any) => {
        this.exchangeService.addItemToExchange(response, true);
      });
  }
}
