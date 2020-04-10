import { Component, OnInit } from '@angular/core';
import { AppServiceService } from 'src/app/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { SocketserviceService } from 'src/app/socketservice.service';
import { User } from '../../../../../Interfaces/user';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-friend',
  templateUrl: './friend.component.html',
  styleUrls: ['./friend.component.css'],
  animations: [
    trigger('users', [
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
export class FriendComponent implements OnInit {

  public users:Array<User> = [];
  public userDetails ;
  public friendRequests = [];
  public searchedUsers = [];
  public loading = true;
  public searchingValue = '';
  public pageValue = 0;
  public limit = 8;
  public Usercount;
  public searching = false;
  public accept:Subscription;
  public reject:Subscription;
  public err:Subscription;
  public unfriendSub: Subscription;
  public unfriendAckSub:Subscription;
  public sendSub: Subscription;
  public time;
  
  


  constructor(private AppService : AppServiceService , 
              private toastr:ToastrService,
              private router : Router,
              private socketService : SocketserviceService,
              private spinner: NgxSpinnerService

             ) { }


  ngOnInit() {
    this.isLoggedOut();
    this.spinner.show();
    this.getUsers(this.pageValue,this.limit);
    this.getUser();
    this.acceptedRequest();
    this.rejectedRequest();
    this.errOccured();
    this.unfriendAck();
    
  }

  ngOnDestroy(){

    if(this.accept)
    this.accept.unsubscribe();

    if(this.reject)
    this.reject.unsubscribe();

    if(this. unfriendSub)
    this. unfriendSub.unsubscribe();

    if(this.unfriendAckSub)
    this.unfriendAckSub.unsubscribe();

    if(this.sendSub)
    this.sendSub.unsubscribe();
    
    if(this.err)
    this.err.unsubscribe();

    if(this.time)
    clearInterval(this.time);
    
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


  public checkRequestSent = (user)=>{
    if(this.userDetails && this.userDetails.friendList && this.userDetails.friendList.findIndex(friend=>friend.id===user.userId && friend.active===false)==-1)
    return false;
    return true;
  }//end checkRequestSent

  public checkFriend = (user)=>{
    if(this.userDetails && this.userDetails.friendList && this.userDetails.friendList.findIndex(friend=>friend.id===user.userId && friend.active===true)==-1)
    return false;
    return true;
  }//end checkFriend

  public getUser = () =>{
  this.AppService.getUser().subscribe(
    (data)=>{
      this.userDetails = data.data;
      console.log('user details',this.userDetails);
  },
  (err)=>{
    this.router.navigate(['/error']);
  })
  }//end getUser

public getUsers = (pageValue, limit)=>{
  let data = {
    pageValue:pageValue,
    limit:limit
  }

 this.socketService.getusers(data);
 this.socketService.getUsersResponse().then(
   (data)=>{
     console.log('getuser responses is called ')
    if (data.status == 200) {
              this.loading = false;

              
              
              this.users = data.data.users;
              console.log(data.data.users.length,this.users.length);
              
              this.Usercount = data.data.userCount;
              console.log('usercount',this.Usercount);
              let index = this.users.findIndex(user => user.userId === Cookie.get('userId'))
              if(index != -1)
              {
              let obj =  this.users.splice(index, 1);
              console.log('removed user',obj);
              }
            
              console.log(data.data.users,this.users.length);
             }
             else
         {
           this.toastr.error(data.message);
        }

   }
 )

}//end getUsers

  public sendRequest = (user)=>{
    let data = {
      senderId : Cookie.get('userId'),
      senderName:Cookie.get('userName'),
      recieverId :user.userId,
      recieverName : user.userName
    }
    console.log('send request',user);
   this.socketService.sendRequest(data);
  this.sendSub = this.socketService.sendRequestResponse().subscribe(
     (data)=>{
      this.userDetails = data;
       console.log(data);
     }
   )
  }//end sendRequest

  public errOccured = () =>{
  this.err =  this.socketService.errOccured().subscribe(
      (data)=>{
        this.toastr.warning(data.message );
        console.log(data.data);
      }
    )
  }//end errOccured

  public acceptedRequest = () =>{
  this.accept =  this.socketService.acceptedRequest().subscribe(
      (data)=>{
         console.log(data);
         let i = this.userDetails.friendList.findIndex(user=>user.id == data.recieverId);
         this.userDetails.friendList[i].active = true;
         console.log(this.userDetails);
      }
    )
  }//end acceptedRequest

  public rejectedRequest = () =>{
   this.reject =  this.socketService.rejectedRequest().subscribe(
      (data)=>{
        console.log(data);
         let i = this.userDetails.friendList.findIndex(user=>user.id == data.recieverId);
         this.userDetails.friendList.splice(i,1);  
      }
    )
  }//end  rejectedRequest

  public unfriend = (user)=>{
    let data = {
      userId :Cookie.get('userId'),
      friendId : user.userId
    }
    this.socketService.unfriend(data);
  this.unfriendSub =  this.socketService.unfriendResponse().subscribe(
      (data)=>{
        this.userDetails = data;
       console.log('unfriend response',data);
      }
    )
  }//end unfriend

  public unfriendAck = ()=>{
   this.unfriendAckSub =  this.socketService.unfriendAck().subscribe(
      (data)=>{
        console.log('unfriendAck',data);
        this.userDetails = data;
      }
    )
  }//end  unfriendAck 

  public search = () => {
    console.log('in search',this.searchingValue);
    this.searching = true;
    this.socketService.searchPeople(this.searchingValue);
    this.searchResult();
  } //end search


  public searchResult = () => {
    this.socketService.searchedResult().subscribe(
      (data) => {
        this.searchedUsers = data.filter(user=>user.userId != Cookie.get('userId'));
        console.log(this.searchedUsers);
       }); 
  }//end searchresult

  public unsearch = ()=>{
   this.searchingValue = '';
   this.searchedUsers=[];
   this.searching = false;
  }//end unsearch

  public getNextPages = () => {
    this.pageValue++;
    this.getUsers(this.pageValue, this.limit);
  }//end getnextpages

  public getPrevPages = () => {
    this.pageValue--;
    this.getUsers(this.pageValue, this.limit);
  }//end getprevpages

  public checkNext = () => {
    if (((this.pageValue + 1) * this.limit) >= this.Usercount) {
      return true;
    }
    else
      return false;
  }//end checknext

}
