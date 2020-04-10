import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SidebarModule } from 'ng-sidebar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FilterPipeModule } from 'ngx-filter-pipe';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import { DeferLoadModule } from '@trademe/ng-defer-load';

//import { AngularFontAwesomeModule } from 'angular-font-awesome';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UserModule } from './user/user.module';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TodolistModule } from './todolist/todolist.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FilterPipeModule,
    NgxSpinnerModule,
    NgbTooltipModule,
    DeferLoadModule,
   /// AngularFontAwesomeModule,
    //FontAwesomeModule,
    ToastrModule.forRoot(),
    SidebarModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    UserModule,
    TodolistModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
