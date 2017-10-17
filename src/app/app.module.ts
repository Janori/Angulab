import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { JtableDirective } from './elements/jtable.directive';
import { JcolumnDirective } from './elements/jcolumn.directive';
import { TableComponent } from './components/table/table.component';

// *** Rutas ***
import { APP_ROUTING } from './app.routes';

// *** Servicios ***
import { MembersService } from './services/members.service';
import { Paginator1Component } from './components/paginator1/paginator1.component';

@NgModule({
  declarations: [
    AppComponent,
    JtableDirective,
    JcolumnDirective,
    TableComponent,
    Paginator1Component,
  ],
  imports: [
    APP_ROUTING,
    BrowserModule,
    HttpModule,
    FormsModule,
  ],
  providers: [
    MembersService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
