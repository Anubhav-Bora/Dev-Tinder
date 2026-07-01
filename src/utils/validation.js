const validator=require("validator");

const validateUserData=(req)=>{
const {firstName,lastName,emailId,password}=req.body;
if(!firstName || !lastName || !emailId || !password){
    return {isValid:false,message:"All fields are required"};
}
else if(!validator.isEmail(emailId)){
    return {isValid:false,message:"Invalid email format"};
}
else if(!validator.isStrongPassword(password)){
    return {isValid:false,message:"Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols"};
}
else{
    return {isValid:true,message:"Validation successful"};
}
}

const validateProfileEdit = (req)=>{
    const allowedFields=["firstName","lastName","emailId","about","photoUrl","gender","age","skills"]; 

    const isEditAllowed = Object.keys(req.body).every(field => allowedFields.includes(field));
    return isEditAllowed;


}

module.exports={validateUserData,validateProfileEdit};