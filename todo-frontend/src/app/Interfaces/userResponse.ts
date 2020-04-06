import {User} from './../Interfaces/user';
export interface UserResponse {
    error:Boolean,
    message:string,
    status:Number,
    data:{
        users:Array<User>,
        userCount:Number

    }
    

}