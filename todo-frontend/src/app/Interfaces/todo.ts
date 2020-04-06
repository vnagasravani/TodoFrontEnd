export interface Todo {
    todoId: string,
    userId: string,
    userName: string,
    todoTitle: string,
    itemList:
     [
        {
            itemId:string,
            itemName: string,
            itemComplete: Boolean,
            subItemList: [
                {
                    subItemId: string,
                    subItemName: string,
                    subItemComplete: Boolean,
                }]
        }],
    complete:Boolean,
    createdOn: Date   

}