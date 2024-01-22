const express=require('express')
const app=express("express")
const {MongoClient}=require("mongodb")
const uri=require('./app_uri')
const cors=require('cors')
const fs=require('fs')
const ObjectId=require('mongodb').ObjectId
const path=require("path")
app.use(cors())
app.use(express.json())
const client=new MongoClient(uri)
let session;
client.connect().then(console.log("connected to cluster"))

//
const nodemailer=require('nodemailer')
const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
    user:"codebox012@gmail.com",
    pass:"icuy enlb pgld gsuc"}
})
//
const mailoptions=(str,receiveremail)=>{return {
    from:"codebox012@gmail.com",
    to:receiveremail,
    subject:"test",
    text:"successfully mailed\n"+str+"THANKYOU FOR CHOOSING THE SVNM BANK  \n"
    }}//
const accounts=client.db("bank").collection("accounts")
        console.log("connected to accounts")
       const transactions=client.db("bank").collection("transactions")
       console.log("connected to transactions")
app.post("/gettransaction",async(req,res)=>{
        
        
        session=client.startSession()
        session.startTransaction()
        
       const data=req.body
            let transactionUpdate;
            let status="success";
            let senderUpdate
            try{
                const receiverUpdate=await accounts.updateOne({name:data.receiver},{$inc:{balance:parseInt(data.amount)}},{upsert:false,session});
                if(receiverUpdate.modifiedCount===0){
                    status="failed"
                }else{
                senderUpdate=await accounts.updateOne({name:data.sender},{$inc:{balance:-parseInt(data.amount)}},{session,upsert:false});
                }
                transactionUpdate=await transactions.insertOne({...data,timestamp:new Date(),status:status},{session})
                await session.commitTransaction()
                console.log(receiverUpdate);
                console.log(senderUpdate)
                console.log(transactionUpdate)
                const result=await transactions.findOne({_id:transactionUpdate.insertedId})
                console.log(result)
                try{
                const email=`transaction id :${result._id}\n
                sender :${result.sender}\n
                receiver :${result.receiver}\n
                transaction amount :${result.amount}\n
                transaction status :${status}\n`
                const receiveremail=await accounts.findOne({name:data.sender},{email:1})  
                transporter.sendMail(mailoptions(email,receiveremail.email),(err,info)=>{
                    if(err){
                        console.log(err)
                    }else{
                        console.log("mailsent successfully")
                        console.log(response.info)
                    }
                })
                res.send({...result,"status":status});}catch(err){
                    console.log(err)
                }
            }catch(err){
                await session.abortTransaction()
                console.log("transaction failed")
                res.send({"status":"failed"})
            }finally{
                await session.endSession()
            }
            
        }
        );
app.get("/downloadReceipt/:tid",async(req,res)=>{
        const fileurl=req.params.tid +".txt"
        const ele=req.params.tid
        const data=await transactions.findOne({_id:new ObjectId(ele)})
        console.log(data)
        const stringdata=`transaction id :${data._id}\nsender :${data.sender}\nreceiver :${data.receiver}\ntransction amount:${data.amount}\nStatus :${data.status}`
        fs.writeFile(fileurl,stringdata,(err)=>{
            if (err) {
                console.error('Error writing file:', err);
            } else {
                console.log('File written successfully.');
                res.download(fileurl,(err)=>{console.log(err);res.status(500)})
            }
        });
        
        
})
//get balance page client side
app.get("/getbalance",async(req,res)=>{
    const htmlfile=path.join(__dirname,"getbalance.html")
    res.sendFile(htmlfile)
})
//getbalance server side
app.post("/getBalance",async(req,res)=>{
    console.log("getBalance server side running successfully")
    const data=req.body;
    const bal=await accounts.findOne({"name":data.name})
    console.log({"name":bal.name,"bal":bal.balance})
    res.send({"name":bal.name,"bal":bal.balance})

})

//login verification method
app.post("/blogin",async(req,res)=>{
    const data=req.body;
    data.balance=500;
    try{
    const cnt=await accounts.countDocuments({name:data.name})
    if (cnt===0){
    const response=await accounts.insertOne(data);
    console.log("account created successfully")
    res.send({...response,"status":"success"})}else{
        res.send({status:"failed account already exists"})
    }}
    catch(err){
        console.log("error in the blogin block")
        console.log(err);
        res.send({status:"error in database"})
    }
    
    

})
//account information download method 
app.get("/downloads/accounts/:accountinfo",async(req,res)=>{
    let accountinfo=req.params.accountinfo;
    let response=await accounts.findOne({_id:new ObjectId(accountinfo)})
    let res_str=`account id :${response._id}\n accountholder name :${response.name}\naccount balance :${response.balance}\naccount type :${response.type}`
    let filename=accountinfo+".txt"
    fs.writeFile(filename,res_str,(err)=>{
        if(err){
            console.log("error occured in line 131")
        }else{
            res.download(filename,(err)=>{console.log(err)})
        }
    })
});

app.post("/isLogin",async(req,res)=>{
    let data=req.body
    console.log(data)
    if (data)
    {
        console.log("islogin fetching")
        const response=await accounts.findOne({"name":data.name,password:data.password})
        console.log(response)
        if (response===null){
            res.send({login:"false"})
        }else{
            console.log("sent")
            res.send({login:"true"})
        }
    }
})
//signup page
app.get("/signup",async(req,res)=>{
    const htmlfile=path.join(__dirname,"signup.html")
    res.sendFile(htmlfile)
})
app.get("/",(req,res)=>{
    let htmlfile=path.join(__dirname,"login.html")
    res.sendFile(htmlfile)
})
app.get("/transaction", (req, res) => {
    // Your logic to handle requests to /transaction.html goes here
    res.sendFile(path.join(__dirname, "transaction.html"));
});
app.get("/home",(async(req,res)=>{
    const htmlfile=path.join(__dirname,"home.html")
    res.sendFile(htmlfile)
}))
app.listen(5000,console.log("listening at 5000 successfully"));

/*const {MongoClient} =require("mongodb")
const express=require("express")
const app=express("express")
const uri=require("./app_uri.js");
console.log(uri);
const client =new MongoClient(uri);
const session=client.startSession();
const accounts= client.db("bank").collection("accounts");
const transactions=client.db("bank").collection("transactions")
let sender="murali";
let receiver="tharak";

const dbconnect=async()=>{
    try{
        await client.connect();
        console.warn("successfull connection");
        const transactionResults=await session.withTransaction(async ()=>{
            try{
                console.log("transaction started")
            const senderUpdate= await accounts.updateOne({"name":sender},{$inc:{balance:-100}},{session}).then(console.log("sender updated"));
            console.log(senderUpdate)
            const receiverUpdate=await accounts.updateOne({"name":"tharak"},{$inc:{balance:100}},{session});
            const transaction =await transactions.insertOne({"sender":sender,"receiver":receiver,"amount":100},{session});
            console.log(receiverUpdate)
                console.log(senderUpdate)
                console.log(transaction)
            return true
            }catch(err){
                await session.abortTransaction();
                console.error("error is generated",err);
                return false

            }finally{
        
                await session.endSession()
        
            }
        })
        console.log(transactionResults)
        if(transactionResults){
            console.log("transaction successfull")
        }else{console.log("failed transaction")}
       
    }catch(err){
        console.error(`error is generated :${err}`);
        
    }
}
const main=async()=>{
    try{
        await dbconnect();
        //console.log((await client.db("accounts")).find({"products":"InvestmentStock"}).toArray())
    }catch(err){
        console.log("error is occcured",err);

    }
    finally{
        
        client.close();
    }
}

main();
app.post("/gettransaction",async(req,res)=>{
    const data=req.body
    accounts.updateOne({name:data.receiver},{$inc:{amount:data.amount}})
    accounts.updateOne({name:data.sender},{$inc:{amount:-data.amount}})
    transactions.insertOne({"sender":data.sender,"receiver":data.receiver,"amount":100});
    console.log("success")
    res.send("successful")
})
app.listen(5000,console.log("listening at 5000"))
*/