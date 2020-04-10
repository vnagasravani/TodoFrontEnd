import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MultiUserComponent } from './multi-user/multi-user.component';
import { FriendComponent } from './friend/friend.component';
import { SingleUserComponent } from './single-user/single-user.component';
import { ErrorComponent } from './error/error.component';




const routes: Routes = [
  
  {path:'friend/:id' , component:MultiUserComponent ,pathMatch:'full'},
  {path:'list' , component:FriendComponent ,pathMatch:'full'},
  {path:'user' , component:SingleUserComponent ,pathMatch:'full'},
  {path:'error' , component:ErrorComponent ,pathMatch:'full'},
  {path:'*',redirectTo:'login',pathMatch:'full'}

  
];

@NgModule({
  declarations:[],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TodoListRoutingModule { }
