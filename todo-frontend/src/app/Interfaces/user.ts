export interface User {
    userId: String,
    userName: String,
    firstName: String,
    lastName: String,
    country:String,
    email: String,
    mobileNumber: String,
    groupsList: Array<String>
    createdOn: String,
    friendList : [{
        id:String,
        name:String,
        active:Boolean
    }]

}