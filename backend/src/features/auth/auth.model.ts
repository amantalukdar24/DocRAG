import { model,Schema } from "mongoose";
interface USERI{
    name:string,
    email:string,
    password:string,
}

const userModel=new Schema<USERI>({
     name:{
        type:String,
        required:true,
},
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        requires:true,
    }
},{
    timestamps:true
});
const USER=model<USERI>("user",userModel);

export default USER;