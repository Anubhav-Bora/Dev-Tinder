const mongoose = require("mongoose");
const connectionRequestSchema=new mongoose.Schema(
    {
        fromUserId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        toUserId:
        {
            type:mongoose.Schema.Types.ObjectId,
            required:true,
        },
        status:
        {
            type:String,
            required:true,
            enum:{
                values:["ignored","interested","accepted","rejected"],
                message:`{VALUE} is incorrect status type`,
            },
        },
    },
    {
        timestamps:true,
    }

);

connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save",async function(){
    const connectionRequest=this;
    //if userId and toUserId are same then throw error
    if(connectionRequest.fromUserId.toString()===connectionRequest.toUserId.toString()){
        throw new Error("You cannot send request to yourself");
    }
    next()
})

const connectionRequest= new mongoose.model("connectionRequest",connectionRequestSchema);
module.exports=connectionRequest;