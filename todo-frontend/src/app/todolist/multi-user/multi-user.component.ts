import { Component, OnInit, HostListener, ViewEncapsulation } from '@angular/core';
import { AppServiceService } from 'src/app/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { SocketserviceService } from 'src/app/socketservice.service';
import { NgForm } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-multi-user',
  templateUrl: './multi-user.component.html',
  styleUrls: ['./multi-user.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('todos', [
      transition('void => *', [
        style({
          opacity: 0,
          transform: 'translateX(-100px)'
        }),
        animate(600)
      ]),
      transition('* => void', [
        animate(600, style({
          transform: 'translateX(100px)',
          opacity: 0
        }))
      ])
    ])
  ]
})
export class MultiUserComponent implements OnInit {
  public userDetails;
  public loading=false;
  public friends = [];
  public currentUserTodos = [];
  public currentUserId;
  public currentUserName;
  public todoCount;
  public todoId;
  public currentTodo;
  public itemId;
  public subItemId;
  public userFilter =  {name : ''};
  public display:Boolean = false;
  public mdisplay :Boolean= true;
  public create:Subscription;
  public update:Subscription;
  public delete:Subscription;
  public undos:Subscription;
  public err:Subscription;
  public  time;

  constructor(private AppService: AppServiceService,
    private toastr: ToastrService,
    private router: Router,
    private SocketService: SocketserviceService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.isLoggedOut();
    this.spinner.show();
    this.checkStatus();
    this.verifyUserConfirmation();
    this.setUser();
    this.getUser();
    this.createFriendTodoResponse();
    this.getFriendUpdate();
    this.deleteFriendTodoResponse();
    this.undoResponse();
    this.errOccured();
  }


  ngOnDestroy(){

    if(this.create)
    this.create.unsubscribe();

    if(this.update)
    this.update.unsubscribe();

    if(this.delete)
    this.delete.unsubscribe();

    if(this.undos)
    this.undos.unsubscribe();
    
    if(this.err)
    this.err.unsubscribe();

    if(this.time)
    clearInterval(this.time);
    
  }
 

  @HostListener('document:keydown.control.z', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.SocketService.undo(this.currentUserId);
    event.preventDefault();
}

public check = ()=>{ 
  console.log('check is running');
  if(!this.AppService.getUserInfo())
{
  
  Cookie.delete('AuthToken');

        Cookie.delete('userId');

        Cookie.delete('userName');

        Cookie.delete('email');

        localStorage.clear();
  this.router.navigate(['/login']);
}
}//end check

public isLoggedOut = ()=>{
 this.time = setInterval(() => {
    this.check();
  }, 500);
}//end isLoggedOut


  public undo = ()=>{
    console.log('in undo')
    this.SocketService.undo(this.currentUserId);
  }//end undo


  public undoResponse = () =>{
   this.undos = this.SocketService.undoResponse().subscribe(
      (data)=>{
        console.log('undo response',data);
        if(data.userId == this.currentUserId)
        {
        if(data.created == true && data.deleted == false)
        {
          let index = this.currentUserTodos.findIndex(todo=>todo.todoId === data.todoId)
          this.currentUserTodos.splice(index,1);
        }
        if (data.created == false && data.deleted == false)
        {
        let index = this.currentUserTodos.findIndex(todo=>todo.todoId === data.todoId)
        this.currentUserTodos[index]=data.todo;
        }
        if(data.created == false && data.deleted == true)
        {
           this.currentUserTodos.push(data.todo);
        }
      }
      }
    )
  }// end UndoResponse



  public getTodoId = (todoId) => {
    this.todoId = todoId;
  }//end getTodoId

  public getTodo = (todo) => {
    this.currentTodo = todo;
    console.log('current todo', this.currentTodo);
  }//end getTodo

  public getItemId = (itemId) => {
    this.itemId = itemId;
  }//end  getItemId

  public getSubItemId = (subItemId) => {
    this.subItemId = subItemId;
  }//end getSubItemId

  public checkStatus: any = () => {
    if (Cookie.get('AuthToken') === undefined || Cookie.get('AuthToken') === '' || Cookie.get('AuthToken') === null) {
      this.router.navigate(['/']);
      return false;
    } else {
      return true;
    }
  } // end checkStatus

  public verifyUserConfirmation: any = () => {
    console.log('verify user confirmation is called');
    this.SocketService.verifyUser().subscribe(data => {
    });
  }//end verifyUserConfirmation

  public setUser = () => {
    console.log('currentUserId',this.currentUserId);
    this.SocketService.setuser(Cookie.get('AuthToken'));
  }//end setUser

  public getUser = () => {
    this.AppService.getUser().subscribe(
      (data) => {
        this.userDetails = data.data;
        this.friends = this.userDetails.friendList.filter(user => user.active == true);
        console.log('friends', this.friends);
        console.log('user details', this.userDetails);
      },
      (err)=>{
        this.router.navigate(['/error']);
      })   
  }//end getUser

  public getTodos = (friend) => {
    this.display = true;
    this.mdisplay = false;
    console.log('mdisplay',this.mdisplay);
    this.currentUserName = friend.name;
    this.currentUserId = friend.id;
    this.AppService.getTodos(friend.id).subscribe(
      
      (data) => {
        this.loading = false;
        console.log('get todos is called');
        if (data.status == 200) {
          
          this.currentUserTodos = data.data;
          this.todoCount = this.currentUserTodos.length;
          console.log(this.currentUserTodos);
        }
        else if (data.status == 404) {
          this.toastr.warning('no lists found');
          this.currentUserTodos = [];
          this.todoCount = 0;
        }
      },
      (err) => {
        this.currentUserTodos = [];
        this.router.navigate(['/error']);
      }
    )
  }//end getTodos 

  public createFriendTodo = (todoName, form: NgForm) => {
    if(todoName == '' || todoName==undefined || todoName == null)
  {
    this.toastr.warning('enter todo Title ')
  }
  else
  {
    let todoDetail = {
      todoTitle: todoName,
      userId: this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    console.log('in createFriendTodo ');
    this.SocketService.createFriendList(todoDetail);
    form.reset();
  }
  }//end createFriendTodo

  public deleteFriendTodo = (todo) => {
    let todoDetail = {
      todoId: todo.todoId,
      todo: todo,
      userId: this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    console.log('deleteFriendTodo ', todoDetail);
    this.SocketService.deleteFriendTodo(todoDetail);
  }

  public updateFriendTodo = (todoName, form: NgForm) => {
    if(todoName == '' || todoName==undefined || todoName == null)
  {
    this.toastr.warning('enter todo Title ')
  }
  else
  {
    let todoDetail = {
      todoId: this.todoId,
      todo: this.currentTodo,
      userId: this.currentUserId,
      todoTitle: todoName,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    this.SocketService.updateFriendTodo(todoDetail);
    form.reset();
  }
  }//end deleteFriendTodo

  public addFriendItem = (taskName, form: NgForm) => {
    if(taskName == '' || taskName==undefined || taskName== null)
  {
    this.toastr.warning('enter Task Title ');
  }
  else
  {
    let itemDetail = {
      todoId: this.todoId,
      itemName: taskName,
      todo: this.currentTodo,
      userId: this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    this.SocketService.addFriendItem(itemDetail);
    form.reset();
  }
  }//end addFriendItem

  public deleteFriendItem = (itemId) => {
    let data = {
      itemId: itemId,
      todoId: this.todoId,
      todo: this.currentTodo,
      userId: this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    this.SocketService.deleteFriendItem(data);

  }//end deleteFriendItem

  public updateFriendItem = (taskName, form: NgForm) => {
    if(taskName == '' || taskName==undefined || taskName== null)
    {
      this.toastr.warning('enter Task Title ');
    }
    else
    {
    let data = {
      itemName: taskName,
      itemId: this.itemId,
      todoId: this.todoId,
      todo: this.currentTodo,
      userId: this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    this.SocketService.updateFriendItem(data);
    form.reset();
  }
  }//end updateFriendItem

  public addFriendSubItem = (subtaskName, form: NgForm) => {
    if(subtaskName == '' || subtaskName==undefined || subtaskName== null)
    {
      this.toastr.warning('enter Task Title ');
    }
    else
    {
    let subItemDetail = {
      itemId: this.itemId,
      subTaskName: subtaskName,
      todoId: this.todoId,
      todo: this.currentTodo,
      userId: this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    this.SocketService.addFriendSubItem(subItemDetail);
    form.reset();
  }
  }//end addFriendSubItem

  public updateFriendSubItem = (subtaskName, form: NgForm) => {
    if(subtaskName == '' || subtaskName==undefined || subtaskName== null)
    {
      this.toastr.warning('enter Task Title ');
    }
    else
    {
    let data = {
      subItemName : subtaskName ,
      itemId : this.itemId,
      subItemId : this.subItemId,
      todoId : this.todoId,
      todo: this.currentTodo,
      userId: this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    this.SocketService.updateFriendSubItem(data);
     form.reset();
  }
  }//end updateFriendSubItem 

  public deleteFriendSubItem = (subItemId)=>{
    let data ={
      subItemId:subItemId,
      todoId : this.todoId,
      todo: this.currentTodo,
      userId: this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    this.SocketService.deleteFriendSubItem(data);
  }//end deleteFriendSubItem

  public completeFriendTodo = (todo)=>{
    let data={
      todoId:todo.todoId,
      todo:todo,
      userId : this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    this.SocketService.completeFriendTodo(data);
  }//end completeFriendTodo
  
  public recompleteFriendTodo = (todo)=>{
    let data={
      todoId:todo.todoId,
      todo:todo,
      userId : this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')

    }
    this.SocketService.recompleteFriendTodo(data);
  }//end recompleteFriendTodo
  
  public completeFriendItem = (todo,itemId)=>{
    let data={
      todoId:todo.todoId,
      todo:todo,
      userId:this.currentUserId,
      itemId:itemId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    this.SocketService.completeFriendItem(data);
  }//end completeFriendItem
  
  public recompleteFriendItem = (todo,itemId)=>{
    let data={
      todoId:todo.todoId,
      todo:todo,
      userId:this.currentUserId,
      itemId:itemId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    this.SocketService.recompleteFriendItem(data);
  }//end recompleteFriendItem
  
  
  
  public completeFriendSubItem = (todo,itemId,subItemId)=>{
    let data={
      itemId : itemId,
      subItemId : subItemId,
      todoId : todo.todoId,
      todo:todo,
      userId : this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    console.log('complete sub item',data);
    this.SocketService.completeFriendSubItem(data);
    
  }//end completeFriendSubItem
  
  public recompleteFriendSubItem = (todo,itemId,subItemId)=>{
    let data={
      itemId : itemId,
      subItemId : subItemId,
      todoId : todo.todoId,
      todo:todo,
      userId : this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    console.log('complete sub item',data);
    this.SocketService.recompleteFriendSubItem(data);
  }//end recompleteFriendSubItem
  

  public createFriendTodoResponse = () => {
   this.create =  this.SocketService.getFriendCreateTodo().subscribe(
      (data) => {
        console.log('createFriendTodoResponse', data);
        console.log(this.currentUserId, data.todo.userId);
        if (this.currentUserId == data.todo.userId) {
          console.log('before assigning', data, this.currentUserTodos);
          this.currentUserTodos.push(data.todo);
          console.log('lists', this.currentUserTodos); 
        }
        this.toastr.info(data.msg);
      }
    )
  }//end createFriendTodoResponse

  public getFriendUpdate = () => {
  this.update =  this.SocketService.getFriendUpdate().subscribe(
      (data) => {
        console.log('getFriendTodoResponse', data);
        console.log(this.currentUserId, data.todo.userId);
        if (this.currentUserId == data.todo.userId) {
          let index = this.currentUserTodos.findIndex(todo => todo.todoId == data.todo.todoId)
          this.currentUserTodos[index] = data.todo;
        }
       this.toastr.info(data.msg);
      }
    )
  }//end  getFriendUpdate

  public deleteFriendTodoResponse = () => {
   this.delete = this.SocketService.getFriendDeleteTodo().subscribe(
      (data) => {
       
        console.log('getFriendDeleteTodoResponse', data);
        console.log(this.currentUserId, data.todo.userId);
        if (this.currentUserId == data.todo.userId) {
          let index = this.currentUserTodos.findIndex(todo => todo.todoId == data.todo.todoId);
          this.currentUserTodos.splice(index, 1); 
        }
        this.toastr.info(data.msg);
      }
    )
  }//end deleteFriendTodoResponse

  public errOccured = () =>{
   this.err = this.SocketService.errOccured().subscribe(
      (data)=>{
        this.toastr.warning(data.message );
        console.log(data.data);
      }
    )
  }//end errOccured 



}
