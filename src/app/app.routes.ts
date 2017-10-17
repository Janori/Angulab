import { RouterModule, Routes } from '@angular/router';
import { TableComponent } from './components/table/table.component';

const app_routes: Routes = [
  { path: '', component: TableComponent },
  { path: '**', pathMatch: 'full', redirectTo: '' }
];

export const APP_ROUTING = RouterModule.forRoot(app_routes);
