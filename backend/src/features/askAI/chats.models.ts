import { Schema,model,Types } from "mongoose";


interface chatI{
    question:string,
    answer:string,
    docId:Types.ObjectId
}
const chatSchema=new Schema<chatI>({
    question:{
        type:String,
        required:true,
    },
    answer:{
        type:String,
        required:true
    },
    docId:{
        type:Schema.Types.ObjectId,
        ref:"doc"
    }

},{
    timestamps:true
});
const CHATS=model<chatI>("chat",chatSchema);

export default CHATS;