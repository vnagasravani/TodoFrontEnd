import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppServiceService } from 'src/app/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { NgForm } from '@angular/forms';
import { SocketserviceService } from 'src/app/socketservice.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-single-user',
  templateUrl: './single-user.component.html',
  styleUrls: ['./single-user.component.css'],
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
export class SingleUserComponent implements OnInit {
  public senreq: Subscription;
  public create: Subscription;
  public update: Subscription;
  public delete: Subscription;
  public undo:Subscription;
  public accept:Subscription;
  public err:Subscription;
  public reject: Subscription;
  public todos = [];
  public ctodos = [];
  public currentTodo;
  public friendRequests = false;
  public todoId: String;
  public itemId: String;
  public userId;
  public requests = [];
  public reqopen = false;
  public subItemId: String;
  public _opened: Boolean = false;
  public loading = true;
  public time;
 

  constructor(private appService: AppServiceService,
    private toastr: ToastrService,
    private socketService: SocketserviceService,
    private router: Router,
    private spinner: NgxSpinnerService) {

  }



  ngOnInit() {
    this.isLoggedOut();
    this.spinner.show();
    this.userId = Cookie.get('userId');
    this.getTodos(this.userId);
    this.friendRequests = false;
    this.sentRequest();
    this.fCreateTodoResponse();
    this.fDeleteTodo();
    this.fGetUpdate();
    this.undoIResponse();
    this.errOccured();
    this.acceptRequestResponse();

  }

  ngOnDestroy(){
    if(this.senreq)
    this.senreq.unsubscribe();

    if(this.create)
    this.create.unsubscribe();

    if(this.update)
    this.update.unsubscribe();

    if(this.delete)
    this.delete.unsubscribe();

    if(this.undo)
    this.undo.unsubscribe();

    if(this.accept)
    this.accept.unsubscribe();

    if(this.err)
    this.err.unsubscribe();
    
    if(this.reject)
    this.reject.unsubscribe();

    if(this.time)
    clearInterval(this.time);
  }
 
 





  public check = () => {
    console.log('check is running');
    if (!this.appService.getUserInfo()) {

      Cookie.delete('AuthToken');

      Cookie.delete('userId');

      Cookie.delete('userName');

      Cookie.delete('email');

      Cookie.deleteAll();

      localStorage.clear();
      this.router.navigate(['/login']);
    }
  } //end check

  public isLoggedOut = () => {
  this.time =  setInterval(() => {
      this.check();
    }, 500);
  }//end IsLoggedOut

  public getTodo = (todo) => {
    this.currentTodo = todo;
    console.log('current todo', this.currentTodo);
  }//end getTodo

  public dispalyTodos = () => {
    this.friendRequests = false;
  }//end displayTodos

  public _toggleSidebar() {
    this._opened = !this._opened;
  }//end togglesidebar()

  public getTodoId = (todoId) => {
    this.todoId = todoId;
  }//end getTodoId

  public getItemId = (itemId) => {
    this.itemId = itemId;
  }//end getItemId

  public getSubItemId = (subItemId) => {
    this.subItemId = subItemId;
  }//end getSubItemId

  public undoIResponse = () => {
   this.undo = this.socketService.undoIResponse().subscribe(
      (data) => {
        console.log('undo response', data);
        if (data.userId == Cookie.get('userId')) {
          if (data.created == true && data.deleted == false) {
            let index = this.todos.findIndex(todo => todo.todoId === data.todoId)
            this.todos.splice(index, 1);
          }
          if (data.created == false && data.deleted == false) {
            let index = this.todos.findIndex(todo => todo.todoId === data.todoId)
            this.todos[index] = data.todo;
          }
          if (data.created == false && data.deleted == true) {
            this.todos.push(data.todo);
          }
        }
      }
    )
  }//end undoIResponse


  public getTodos = (id) => {
    this.appService.getTodos(id).subscribe(
      (data) => {
        this.loading = false;
        console.log('get todos is called', data);
        if (data.status == 200) {
          this.todos = data.data;
          console.log(this.todos);
        }
        else if (data.status == 404) {
          this.toastr.warning('no lists found');
        }
      },
      (err) => {
        //this.toastr.error('some error occured');
        this.router.navigate(['/error']);

      }
    )
  }//end getTodos


  public sentRequest = () => {
   this.senreq =  this.socketService.requestSent().subscribe(
      (data) => {
        console.log('request Sent', data);
        this.requests.push(data);
      }
    )
  }//end sentRequest

  public getRequests = () => {
    this.appService.getFriendRequests().subscribe(

      (data) => {
        this.loading = false;
        this.friendRequests = true;
        if (data.status == 200) {
          this.requests = data.data;
          console.log('friend requests', data);
        }
      },
      (err) => {
        // this.toastr.error("error occured");
        this.router.navigate(['/error']);
      }
    )
  }//end getRequests



  public acceptRequest = (requestData) => {
    console.log(requestData);
    this.socketService.acceptRequest(requestData);
  }//end acceptRequest


  public acceptRequestResponse = () => {
   this.accept =  this.socketService.acceptRequestResponse().subscribe(
      (data) => {
        console.log(data);
        this.requests.splice(this.requests.findIndex(request => request.senderId === data.userId), 1);
      }
    )
  }//end acceptRequestResponse

  public rejectRequest = (requestData) => {
    console.log('requestData is called');
    this.socketService.rejectRequest(requestData);
   this.reject = this.socketService.rejectRequestResponse().subscribe(
      (data) => {
        console.log('reject request', data);
        this.requests.splice(this.requests.findIndex(request => request.receiverId === data.receiverId), 1);
      })
  }//end rejectRequest


  public createTodo = (todoItem, form: NgForm) => {
    if (todoItem == '' || todoItem == undefined || todoItem == null) {
      this.toastr.warning('enter the todo title');
    }
    else {
      let todoDetail = {
        todoTitle: todoItem,
        userId: Cookie.get('userId')
      }
      this.socketService.createList(todoDetail);

      this.socketService.getUpdate().then(
        (data) => {
          console.log('before assigning', data, this.todos);
          this.todos.push(data);
          console.log('lists', this.todos);
          form.reset();
        }

      )
    }
  }//end createTodo

  public addItem = (itemName, form: NgForm) => {
    if (itemName == '' || itemName == undefined || itemName == null) {
      this.toastr.warning('enter task name');
    }
    else {
      let itemDetail = {
        todoId: this.todoId,
        itemName: itemName

      }
      console.log('itemdetail', itemDetail);
      this.socketService.addItem(itemDetail);
      this.socketService.getUpdate().then(
        (data) => {
          let index = this.todos.findIndex(todo => todo.todoId == data.todoId)
          this.todos[index] = data;
          console.log('lists', this.todos);
          form.reset();
        }
      )
    }

  }//end addItem

  public addSubItem = (subItem, form: NgForm) => {
    if (subItem == '' || subItem == undefined || subItem == null) {
      this.toastr.warning('enter subItem Name')
    }
    else {
      let subItemDetail = {
        itemId: this.itemId,
        subTaskName: subItem
      }
      console.log('subItemdetail', subItemDetail);
      this.socketService.addSubItem(subItemDetail);
      this.socketService.getUpdate().then(
        (data) => {
          console.log('add sub item', data);
          let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
          this.todos[index] = data;
          // this.todos = [];
          // this.getTodos(this.userId);
          form.reset();
        }
      )
    }
  }//end addSubItem

  public deleteSubItem = (subItemId) => {
    let data = {
      subItemId: subItemId
    }
    this.socketService.deleteSubItem(data);
    this.socketService.getUpdate().then((data) => {
      console.log('delete sub item', data);
      let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
      this.todos[index] = data;
    })
  }//end deleteSubItem

  public deleteItem = (itemId) => {
    let data = {
      itemId: itemId
    }
    this.socketService.deleteItem(data);
    this.socketService.getUpdate().then((data) => {
      console.log('delete item', data);
      let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
      this.todos[index] = data;
    })
  }//end deleteItem

  public deleteTodo = (todoId) => {
    let data = {
      todoId: todoId
    }
    this.socketService.deleteTodo(data);
    this.socketService.deleteTodoResponse().then((data) => {
      console.log('delete todo ', data);
      let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
      this.todos.splice(index, 1);
    })
  }//end deleteTodo

  public updateTodo = (todoTitle, form: NgForm) => {
    if (todoTitle == '' || todoTitle == undefined || todoTitle == null) {
      this.toastr.warning('enter todo title')
    }
    else {
      let data = {
        todoTitle: todoTitle,
        todoId: this.todoId
      }
      this.socketService.updateTodo(data);
      this.socketService.getUpdate().then(data => {
        console.log('update todo', data);
        let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
        this.todos[index] = data;
        form.reset();
      })
    }
  }//end updateTodo


  public updateItem = (itemName, form: NgForm) => {
    if (itemName == '' || itemName == undefined || itemName == null) {
      this.toastr.warning('enter task name');
    }
    else {
      let data = {
        itemName: itemName,
        itemId: this.itemId
      }
      this.socketService.updateItem(data);
      this.socketService.getUpdate().then(data => {
        console.log('update item', data);
        let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
        this.todos[index] = data;
        form.reset();
      })
    }
  }//end updateItem

  public updateSubItem = (subItemName, form: NgForm) => {
    if (subItemName == '' || subItemName == undefined || subItemName == null) {
      this.toastr.warning('enter subItem Name')
    }
    else {
      let data = {
        subItemName: subItemName,
        itemId: this.itemId,
        subItemId: this.subItemId,
        todoId: this.todoId
      }
      console.log('updateSubItem', data);
      this.socketService.updateSubItem(data);
      this.socketService.getUpdate().then(data => {
        console.log("update subitem ", data);
        let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
        this.todos[index] = data;
        form.reset();
      })
    }
  }//end updateSubItem

  public completeTodo = (todoId) => {
    let data = {
      todoId: todoId
    }
    this.socketService.completeTodo(data);
    this.socketService.getUpdate().then(data => {
      console.log('update item', data);
      let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
      this.todos[index] = data;
    })
  }//end completeTodo

  public recompleteTodo = (todoId) => {
    let data = {
      todoId: todoId
    }
    this.socketService.recompleteTodo(data);
    this.socketService.getUpdate().then(data => {
      console.log('update item', data);
      let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
      this.todos[index] = data;
    })
  }//end recompleteTodo

  public completeItem = (itemId) => {
    let data = {
      itemId: itemId
    }
    this.socketService.completeItem(data);
    this.socketService.getUpdate().then(data => {
      console.log('update item', data);
      let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
      this.todos[index] = data;
    })
  }//end completeItem

  public recompleteItem = (todoId, itemId) => {
    let data = {
      todoId: todoId,
      itemId: itemId
    }
    this.socketService.recompleteItem(data);
    this.socketService.getUpdate().then(data => {
      console.log('update item', data);
      let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
      this.todos[index] = data;
    })
  }//end recompleteItem



  public completeSubItem = (todoId, itemId, subItemId) => {
    let data = {
      itemId: itemId,
      subItemId: subItemId,
      todoId: todoId
    }
    console.log('complete sub item', data);
    this.socketService.completeSubItem(data);
    this.socketService.getUpdate().then(data => {
      console.log('update item', data);
      let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
      this.todos[index] = data;
    })
  }//end completeSubItem

  public recompleteSubItem = (todoId, itemId, subItemId) => {
    let data = {
      itemId: itemId,
      subItemId: subItemId,
      todoId: todoId
    }
    console.log('recomplete sub item', data);
    this.socketService.recompleteSubItem(data);
    this.socketService.getUpdate().then(data => {
      console.log('update item', data);
      let index = this.todos.findIndex(todo => todo.todoId === data.todoId);
      this.todos[index] = data;
    })
  }//end reCompleteSubItem




  public fCreateTodoResponse = () => {
   this.create = this.socketService.fCreateTodo().subscribe(
      (data) => {
        console.log('fCreateTodoResponse', data);
        console.log(Cookie.get('userId'), data.userId);
        if (Cookie.get('userId') == data.userId) {
          console.log('before assigning', data, this.todos);
          this.todos.push(data);
          console.log('lists', this.todos);

        }
      }
    )
  }//end fCreateTodoResponse

  public fGetUpdate = () => {
   this.update = this.socketService.fGetUpdate().subscribe(
      (data) => {
        console.log('getFriendTodoResponse', data);
        console.log(Cookie.get('userId'), data.userId);
        if (Cookie.get('userId') == data.userId) {
          let index = this.todos.findIndex(todo => todo.todoId == data.todoId)
          this.todos[index] = data;
        }
      }
    )
  }//end fGetUpdate

  public fDeleteTodo = () => {
  this.delete =  this.socketService.fDeleteTodo().subscribe(
      (data) => {
        console.log('getFriendDeleteTodoResponse', data);
        console.log(Cookie.get('userId'), data.userId);
        if (Cookie.get('userId') == data.userId) {
          let index = this.todos.findIndex(todo => todo.todoId == data.todoId);
          this.todos.splice(index, 1);
        }
      }
    )
  }//end fDeleteTodo

  public errOccured = () => {
   this.err = this.socketService.errOccured().subscribe(
      (data) => {
        this.toastr.warning(data.message);
        console.log(data.data);
      }
    )
  }//end  errOccured 


  public logout: any = () => {

    this.appService.logout()
      .subscribe((apiResponse) => {

        if (apiResponse.status === 200) {
          console.log("logout called")
          Cookie.delete('AuthToken');

          Cookie.delete('userId');

          Cookie.delete('userName');

          Cookie.delete('email');

          Cookie.deleteAll();

          localStorage.clear();
          
          this.router.navigate(['/login']);

        } else {
          this.toastr.error(apiResponse.message)

        } // end condition

      }, (err) => {
        this.toastr.error('some error occured', err)


      });

  } // end logout


}
