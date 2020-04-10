import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarModule } from 'ng-sidebar';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { NgxSpinnerModule } from 'ngx-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import {NgbTooltipModule} from '@ng-bootstrap/ng-bootstrap';
import { DeferLoadModule } from '@trademe/ng-defer-load';
import { SingleUserComponent } from './single-user/single-user.component';
import { MultiUserComponent } from './multi-user/multi-user.component';
import { FriendComponent } from './friend/friend.component';
import { TodoListRoutingModule } from './todolist-routing.module';
import { FormsModule } from '@angular/forms';
import { ErrorComponent } from './error/error.component';



@NgModule({
  declarations: [SingleUserComponent, MultiUserComponent, FriendComponent, ErrorComponent],
  imports: [
    CommonModule,
    FormsModule,
    FilterPipeModule,
    NgxSpinnerModule,
    NgbTooltipModule,
    DeferLoadModule ,
    TodoListRoutingModule,
    BrowserAnimationsModule,
    AngularFontAwesomeModule ,
    SidebarModule.forRoot()
  ]
})
export class TodolistModule { }
