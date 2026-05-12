const mongoose=require('mongoose');

const DBconnect=async()=>{
    await mongoose.connect(process.env.DATABASE_URL)
}

module.exports=DBconnect;
