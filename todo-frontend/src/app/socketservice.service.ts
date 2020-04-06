import { Injectable } from '@angular/core';
import *  as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { Observable, observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { UserResponse } from './Interfaces/userResponse';
import { Todo } from './Interfaces/todo';



@Injectable({
  providedIn: 'root'
})
export class SocketserviceService {
  private socket;

  constructor(public http: HttpClient) {
    this.socket = io('http://localhost:3000');
  }

  //events to be listened
  public verifyUser = () => {
    return Observable.create((observer) => {
      this.socket.on('verify', function (data) {
        observer.next(data);
      })

    })

  }//end verify user event 

  public getUsersResponse = () => {
    return new Promise<UserResponse>((resolve, reject) => {
      this.socket.on('get-users-response', data => {
        resolve(data);
      })
    })
  }


  public getUpdate = () => {
    return new Promise<Todo>((resolve, reject) => {
      this.socket.on('get-update', function (data) {
        resolve(data);
      })

    })

  } // end  getupdate

  public getFriendUpdate = () => {

    return Observable.create((observer) => {
      this.socket.on('get-friend-update', function (data) {
        observer.next(data);
      })

    })

  }// end getFriendUpdate

  public fGetUpdate = () => {

    return Observable.create((observer) => {
      this.socket.on('f-get-update', function (data) {
        observer.next(data);
      })

    })

  }// end fGetUpdate

  public getFriendCreateTodo = () => {

    return Observable.create((observer) => {
      this.socket.on('friend-create-todo', function (data) {
        observer.next(data);
      })

    })

  }// end getFriendCreateTodo

  public fCreateTodo = () => {
    return Observable.create((observer) => {
      this.socket.on('fcreate-todo', data => {
        observer.next(data);
      })
    })
  }//end fCreateTodo

  public getFriendDeleteTodo = () => {

    return Observable.create((observer) => {
      this.socket.on('friend-delete-todo', function (data) {
        observer.next(data);
      })

    })

  }// end getFriendDeleteTodo

  public fDeleteTodo = () => {

    return Observable.create((observer) => {
      this.socket.on('f-delete-todo', function (data) {
        observer.next(data);
      })

    })

  }// end fDeleteTodo






  public requestSent = () => {
    return Observable.create((observer) => {
      this.socket.on(`sent-request`, function (data) {
        if (data.recieverId == Cookie.get('userId'))
          observer.next(data);
      })

    })

  } // end requestSent



  public sendRequestResponse = () => {

    return Observable.create((observer) => {
      this.socket.on('send-request-response', function (data) {
        observer.next(data);
      })

    })

  }// end sendRequestResponse

  public rejectRequestResponse = () => {

    return Observable.create((observer) => {
      this.socket.on('reject-request-response', function (data) {
        observer.next(data);
      })

    })

  }// end rejectRequestResponse

  public unfriendResponse = () => {
    return Observable.create((observer) => {
      this.socket.on('unfriend-response', function (data) {
        observer.next(data);
      })

    })

  }//end unfriendResponse

  public unfriendAck = () => {
    return Observable.create((observer) => {
      this.socket.on('unfriend-ack', function (data) {
        if (data.userId == Cookie.get('userId'))
          observer.next(data);
      })

    })
  }//end unfriendAck


  public acceptedRequest = () => {
    return Observable.create((observer) => {
      this.socket.on(`accepted-request`, function (data) {
        if (data.senderId == Cookie.get('userId'))
          observer.next(data);
      })

    })

  } // end accptedrequest

  public rejectedRequest = () => {
    return Observable.create((observer) => {
      this.socket.on(`rejected-request`, function (data) {
        if (data.senderId == Cookie.get('userId'))
          observer.next(data);
      })

    })
  }



  public acceptRequestResponse = () => {

    return Observable.create((observer) => {
      this.socket.on('accept-request-response', function (data) {
        observer.next(data);
      })

    })

  }// end sendRequestResponse

  public undoResponse = () => {

    return Observable.create((observer) => {
      this.socket.on('undo-response', function (data) {
        observer.next(data);
      })

    })

  }// end undoResponse

  public undoIResponse = () => {

    return Observable.create((observer) => {
      this.socket.on('undo-i-response', function (data) {
        observer.next(data);
      })

    })

  }// end undoResponse


  public searchedResult = () => {

    return Observable.create((observer) => {
      this.socket.on('searched-result', function (data) {
        observer.next(data);
      })

    })

  }// end searchedResult 








  public deleteTodoResponse = () => {
    return new Promise<Todo>((resolve, reject) => {
      this.socket.on('delete-todoList-response', data => {
        resolve(data);
      })
    })
  }//end addItemresponse






  public errOccured = () => {
    return Observable.create((observer) => {
      this.socket.on('error-message', function (data) {
        observer.next(data);
      })

    })

  }  // end err occured event 






  //events to be emitted
  public setuser = (authToken) => {
    this.socket.emit('set-user', authToken);
  }//end setuser

  public exitSocket = () => {
    this.socket.disconnect();
  }// end exit socket

  public createList = (data) => {
    this.socket.emit('create-todo', data);
  } //end createList

  public createFriendList = (data) => {
    console.log('createFriendList  is called');
    this.socket.emit('create-friend-todo', data);
  } //end createFriendList

  public addItem = (data) => {
    this.socket.emit('add-item', data);
  }//end addItem

  public addFriendItem = (data) => {
    this.socket.emit('add-friend-item', data);
  }//end addFriendItem

  public addSubItem = (data) => {
    this.socket.emit('add-sub-item', data);
  }//end addSubItem

  public addFriendSubItem = (data) => {
    this.socket.emit('add-friend-sub-item', data);
  }//end addFriendSubItem

  public updateTodo = (data) => {
    this.socket.emit('update-todo', data);
  }//end updateTodo
  
  public updateFriendTodo = (data) => {
    this.socket.emit('update-friend-todo', data);
  }//end updateFriendTodo

  public updateItem = (data) => {
    this.socket.emit('update-item', data);
  }//end updateItem

  public updateFriendItem = (data) => {
    this.socket.emit('update-friend-item', data);
  }//end updateFriendItem

  public updateSubItem = (data) => {
    this.socket.emit('update-sub-item', data);
  }//end updateSubItem

  public updateFriendSubItem = (data) => {
    this.socket.emit('update-friend-sub-item', data);
  }//end updateFriendSubItem

  public deleteTodo = (data) => {
    this.socket.emit('delete-todoList', data);
  }//end deleteTodo

  public deleteFriendTodo = (data)=>{
   this.socket.emit('delete-friend-todo',data) 
  }//end deleteFriendTodo


  public deleteItem = (data) => {
    this.socket.emit('delete-item', data);
  }//end deleteItem

  public deleteFriendItem = (data) => {
    this.socket.emit('delete-friend-item', data);
  }//end deleteFriendItem

  public deleteSubItem = (data) => {
    this.socket.emit('delete-sub-item', data);
  }//end deleteSubItem

  public deleteFriendSubItem = (data) => {
    this.socket.emit('delete-friend-sub-item', data);
  }//end deleteFriendSubItem

  public completeItem = (data)=>{
    this.socket.emit('complete-item',data);
  } //completeItem

  public completeFriendItem = (data)=>{
    this.socket.emit('complete-friend-item',data);
  } //completeFriendItem

  public recompleteItem = (data)=>{
    this.socket.emit('recomplete-item',data);
  } //recompleteItem

  public recompleteFriendItem = (data)=>{
    this.socket.emit('recomplete-friend-item',data);
  } //recompleteFriendItem

  public completeTodo= (data)=>{
    this.socket.emit('complete-todo',data);
  } //completeTodo

  public completeFriendTodo= (data)=>{
    this.socket.emit('complete-friend-todo',data);
  } //completeFriendTodo


  public recompleteTodo= (data)=>{
    this.socket.emit('recomplete-todo',data);
  } //recompleteTodo

  public recompleteFriendTodo= (data)=>{
    this.socket.emit('recomplete-friend-todo',data);
  } //recompleteFriendTodo

  public completeSubItem = (data)=>{
    this.socket.emit('complete-sub-item',data);
  } //completeSubItem

  public completeFriendSubItem = (data)=>{
    this.socket.emit('complete-friend-sub-item',data);
  } //completeFriendSubItem

  public recompleteSubItem = (data)=>{
    this.socket.emit('recomplete-sub-item',data);
  } //recompleteSubItem

  public recompleteFriendSubItem = (data)=>{
    this.socket.emit('recomplete-friend-sub-item',data);
  } //recompleteSubItem



  public sendRequest = (data) => {
    this.socket.emit('send-request', data);
  }//end sendRequest

  public acceptRequest = (data) => {
    this.socket.emit('accept-request', data);
  }//end acceptRequest

  public getusers = (data) => {
    this.socket.emit('get-users', data);
  }//end getUsers

  public rejectRequest = (data) => {
    this.socket.emit('reject-request', data);
  }//end rejectRequest

  public unfriend = (data) => {
    this.socket.emit('unfriend', data);
  }//end unfriend

  public undo = (userId)=>{
    let data ={
      userId : userId
    }
    console.log('in undo socket service');
    this.socket.emit('undo',data);
  }//end undo

  public searchPeople = (name) => {
    this.socket.emit('search-user', name);
  }//end search people






}
