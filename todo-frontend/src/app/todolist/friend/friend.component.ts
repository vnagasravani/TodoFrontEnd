import { Component, OnInit } from '@angular/core';
import { AppServiceService } from 'src/app/app-service.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { SocketserviceService } from 'src/app/socketservice.service';
import { User } from '../../../../../Interfaces/user';
import { trigger, transition, style, animate } from '@angular/animations';

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
 // public displayedUsers = [];
  public searchedUsers = [];
  public loading = true;
  public searchingValue = '';
  public pageValue = 0;
  public limit = 8;
  public Usercount;
  public searching = false;
  


  constructor(private AppService : AppServiceService , 
              private toastr:ToastrService,
              private router : Router,
              private socketService : SocketserviceService,
              private spinner: NgxSpinnerService

             ) { }


  ngOnInit() {
    this.spinner.show();
    this.getUsers(this.pageValue,this.limit);
    this.getUser();
    this.acceptedRequest();
    this.rejectedRequest();
    this.errOccured();
    this.unfriendAck();
    

  }

  // public getDisplayedUsers = ()=>{
  //   console.log(this.users[0].userId)
  //   console.log('userdetails userId',Cookie.get('userId'));
  //   for(let i=0; i<this.users.length;i++) {
  //     console.log(this.users[i].userId)
    
  //    let user:User = this.users[i] ;
  //     if( Cookie.get('userId') != user.userId)
  //     {
  //       this.displayedUsers.push(this.users[i]);

  //     }
  //   }
  //   console.log('after splicing',this.displayedUsers);
   
  // }



  public checkRequestSent = (user)=>{
   
    if(this.userDetails && this.userDetails.friendList && this.userDetails.friendList.findIndex(friend=>friend.id===user.userId && friend.active===false)==-1)
    return false;
    return true;
  }

  public checkFriend = (user)=>{
    if(this.userDetails && this.userDetails.friendList && this.userDetails.friendList.findIndex(friend=>friend.id===user.userId && friend.active===true)==-1)
    return false;
    return true;

  }

  public getUser = () =>{
  this.AppService.getUser().subscribe(
    (data)=>{
      this.userDetails = data.data;
      console.log('user details',this.userDetails);
  })
  }

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
              
              this.Usercount = data.data.userCount;
              console.log('usercount',this.Usercount);
              this.users.splice(this.users.findIndex(user => user.userId === Cookie.get('userId')), 1)
             }
             else
         {
           this.toastr.error(data.message);
        }

   }
 )

}




  // public getUsers = (pageValue, limit) => {
  //   this.AppService.getAllUsers(pageValue, limit).subscribe(
  //     (data) => {
        
  //       if (data.status == 200) {
  //         this.loading = false;
  //         this.users = data.data.users;
  //         console.log('all users',this.users);
  //         this.users.splice(this.users.findIndex(user => user.userId === Cookie.get('userId')), 1)
          
          
  //         console.log('after splicing',this.users);
  //         this.Usercount = data.data.userCount;
  //        }
  //        else if(data.status==300){
  //         this.toastr.error('unauthorized access');
  //         this.router.navigate(['/login']);
  //        }
  //        else
  //       {
  //         this.toastr.error(data.message);
  //       }
  //     },
  //     (err) => {
  //       console.log(err);
  //       this.toastr.error('some error occured');
  //     });
  // }//end getUsers

  public sendRequest = (user)=>{
    let data = {
      senderId : Cookie.get('userId'),
      senderName:Cookie.get('userName'),
      recieverId :user.userId,
      recieverName : user.userName
    }
    console.log('send request',user);
   this.socketService.sendRequest(data);
   this.socketService.sendRequestResponse().subscribe(
     (data)=>{
      this.userDetails = data;
       console.log(data);
     }
   )
  }

  public errOccured = () =>{
    this.socketService.errOccured().subscribe(
      (data)=>{
        this.toastr.warning(data.message );
        console.log(data.data);
      }
    )
  }

  public acceptedRequest = () =>{
    this.socketService.acceptedRequest().subscribe(
      (data)=>{
         console.log(data);
         let i = this.userDetails.friendList.findIndex(user=>user.id == data.recieverId);
         this.userDetails.friendList[i].active = true;
         console.log(this.userDetails);

      }
    )
  }

  public rejectedRequest = () =>{
    this.socketService.rejectedRequest().subscribe(
      (data)=>{
        console.log(data);
         let i = this.userDetails.friendList.findIndex(user=>user.id == data.recieverId);
         this.userDetails.friendList.splice(i,1);
        
      }
    )
  }

  public unfriend = (user)=>{
    let data = {
      userId :Cookie.get('userId'),
      friendId : user.userId
    }
    this.socketService.unfriend(data);
    this.socketService.unfriendResponse().subscribe(
      (data)=>{
        this.userDetails = data;
       console.log('unfriend response',data);
      }
    )
  }

  public unfriendAck = ()=>{
    this.socketService.unfriendAck().subscribe(
      (data)=>{
        console.log('unfriendAck',data);
        this.userDetails = data;
      }
    )
  }

  public search = () => {
    console.log('in search',this.searchingValue);
    this.searching = true;
    //this.searchingValue = this.searchInput.nativeElement.value + data.key;
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
