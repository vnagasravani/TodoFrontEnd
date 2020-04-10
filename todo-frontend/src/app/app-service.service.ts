import { Injectable } from '@angular/core';
import {HttpClientModule,HttpParams, HttpClient} from '@angular/common/http'
import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import {User} from './../../../Interfaces/user'

@Injectable({
  providedIn: 'root'
})
export class AppServiceService {

  constructor(private http:HttpClient) { }
  private url = "/api";

  signUp(data):Observable<any>{
    const params = new HttpParams().
    set('firstName',data.firstName)
    .set('lastName',data.lastName)
    .set('email',data.email)
    .set('mobileNumber',data.mobileNumber)
    .set('password',data.password)
  
  
    return this.http.post(`${this.url}/signup`,params);

  }//end signup

  public getCountryNames(){
    return this.http.get('../assets/CountryList.json');
  
  }//end getCountryNames
  
  public getCountryNumbers(){
    return this.http.get('../assets/CountryCodes.json');
  }//end getCountryNumbers

  public getAllUsers(pageValue, limit):Observable<any>{
    const params = new HttpParams()
    .set('pageValue',pageValue)
    .set('limit',limit)
    .set('authToken',Cookie.get('AuthToken'));
    return this.http.post(this.url+'/all',params);

  }//end getAllUsers

  public getUser():Observable<any> {
    return this.http.get(this.url+'/user/'+Cookie.get('userId'));
  }//end getUser


 public login(data):Observable<any>{
      const params = new HttpParams().
      set('email',data.email)
      .set('password',data.password);
      return this.http.post(this.url+'/login',params);

  }//end login

  public logout(): Observable<any> {
    const params = new HttpParams()
    .set('authToken', Cookie.get('AuthToken'))
    .set('userId',Cookie.get('userId'))
     return this.http.post(`${this.url}/out`, params);

  } // end logout function

  public forgotPassword (email):Observable<any>{
    console.log('in app service0',email);
    const params = new HttpParams()
    .set('email',email);
    return this.http.post(this.url+'/resetpassword',params);
  }//end forgotPassword

  public resetPassword (rpassword , newpassword):Observable<any>{
    const params = new HttpParams()
    .set('recoveryPassword',rpassword)
    .set('password',newpassword);
    return this.http.post(this.url+'/updatepassword',params);
  }//end resetPassword

  public getTodos (id) :Observable<any>{
    const params = new HttpParams()
    .set('authToken',Cookie.get('AuthToken'))
    .set('userId',id);
    return this.http.post (this.url+'/gettodos',params );
  }//end getTodos

  public getCompleteTodos (id) :Observable<any>{
    const params = new HttpParams()
    .set('authToken',Cookie.get('AuthToken'))
    .set('userId',id);
    return this.http.post (this.url+'/getctodos',params );
  }//end getCompleteTodos

  public getFriendRequests () :Observable<any>{
    const params = new HttpParams()
    .set('authToken',Cookie.get('AuthToken'))
    .set('userId',Cookie.get('userId'));
    return this.http.post (this.url+'/getrequests',params );
  }// end getFriendsRequests

  public getUserInfo(){
    return JSON.parse(localStorage.getItem('userInfo'));
  }//end getUserInfo

  public setUserInfo(data){
    localStorage.setItem('userInfo',JSON.stringify(data))
  }//end setuserInfo

}
