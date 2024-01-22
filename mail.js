const nodemailer=require('nodemailer')
const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
    user:"codebox012@gmail.com",
    pass:"icuy enlb pgld gsuc"}
})
const mailoptions=(str)=>{return {
from:"codebox012@gmail.com",
to:'svnmurali1@gmail.com',
subject:"test",
text:"successfully mailed\n"+str
}}
transporter.sendMail(mailoptions,(err,info)=>{
    if(err){
        console.log("error occured",err)
    }else{
        console.log("mailsent :",info.response)
    }
})
module.exports()