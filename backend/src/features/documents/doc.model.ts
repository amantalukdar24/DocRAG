import {Schema,model,Types} from "mongoose";

interface docSchemaI{
    publicId:string,path:string,uploadedBy:Types.ObjectId
}
const docSchema=new Schema<docSchemaI>({
    publicId:{
        type:String,
        required:true,
    },
    path:{
        type:String,
        required:true,
    },
    uploadedBy:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true,
    }
},{
        timestamps:true
    });

const DOC=model<docSchemaI>("doc",docSchema);

export default DOC;