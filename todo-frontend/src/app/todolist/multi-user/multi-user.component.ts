import { Component, OnInit, HostListener } from '@angular/core';
import { AppServiceService } from 'src/app/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { SocketserviceService } from 'src/app/socketservice.service';
import { NgForm } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-multi-user',
  templateUrl: './multi-user.component.html',
  styleUrls: ['./multi-user.component.css'],
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
  public display = false;
  public mdisplay= true;

  constructor(private AppService: AppServiceService,
    private toastr: ToastrService,
    private router: Router,
    private SocketService: SocketserviceService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    this.checkStatus();
    this.verifyUserConfirmation();
    this.setUser();
    this.getUser();
    this.createFriendTodoResponse();
    this.getFriendUpdate();
    this.deleteFriendTodoResponse();
    this.undoResponse();
  }

  @HostListener('document:keydown.control.z', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.SocketService.undo(this.currentUserId);
    event.preventDefault();
}

  public undo = ()=>{
    console.log('in undo')
    this.SocketService.undo(this.currentUserId);

  }

  public undoResponse = () =>{
    this.SocketService.undoResponse().subscribe(
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
  }

  public error = ()=>{
    this.SocketService.errOccured().subscribe(
      (data)=>{
        this.toastr.error(data.message);
        console.log('error',data);
      }
    )
  }

  public getTodoId = (todoId) => {
    this.todoId = todoId;
  }

  public getTodo = (todo) => {
    this.currentTodo = todo;
    console.log('current todo', this.currentTodo);
  }

  public getItemId = (itemId) => {
    this.itemId = itemId;
  }

  public getSubItemId = (subItemId) => {
    this.subItemId = subItemId;
  }

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
      })
  }

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
        this.toastr.error('some error occured');
      }
    )
  }

  public createFriendTodo = (todoName, form: NgForm) => {
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

  public addFriendItem = (taskName, form: NgForm) => {
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

  }

  public updateFriendItem = (taskName, form: NgForm) => {
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

  public addFriendSubItem = (subtaskName, form: NgForm) => {
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

  public updateFriendSubItem = (subtaskName, form: NgForm) => {
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
  }

  public completeFriendTodo = (todo)=>{
    let data={
      todoId:todo.todoId,
      todo:todo,
      userId : this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')
    }
    this.SocketService.completeFriendTodo(data);
  }
  
  public recompleteFriendTodo = (todo)=>{
    let data={
      todoId:todo.todoId,
      todo:todo,
      userId : this.currentUserId,
      userName:this.currentUserName,
      otherUser:Cookie.get('userName')

    }
    this.SocketService.recompleteFriendTodo(data);
  }
  
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
  }
  
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
  }
  
  
  
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
    
  }
  
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
  }
  

  public createFriendTodoResponse = () => {
    this.SocketService.getFriendCreateTodo().subscribe(
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
  }

  public getFriendUpdate = () => {
    this.SocketService.getFriendUpdate().subscribe(
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

  }

  public deleteFriendTodoResponse = () => {
    this.SocketService.getFriendDeleteTodo().subscribe(
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
  }



}
