import { Component } from '@angular/core';
import { InicioBarra } from '../../components/inicio/inicio-barra/inicio-barra';
import { ProductListComponent } from '../product-list.component.ts/product-list.component';

@Component({
  selector: 'Inicio',
  imports: [InicioBarra,ProductListComponent],
  templateUrl: './inicio.html',

})
export class Inicio {

}
