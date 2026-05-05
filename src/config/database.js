const mongoose=require('mongoose');

const DBconnect=async()=>{
    await mongoose.connect(
        "mongodb://Anubhav:Anubhav12345@cluster0-shard-00-00.6kbcx.mongodb.net:27017,cluster0-shard-00-01.6kbcx.mongodb.net:27017,cluster0-shard-00-02.6kbcx.mongodb.net:27017/DevTinder?ssl=true&replicaSet=atlas-zqlbo9-shard-0&authSource=admin&retryWrites=true&w=majority"
    )
}

module.exports=DBconnect;

