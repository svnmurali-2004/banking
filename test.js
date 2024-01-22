const express=require("express")
const app=express("express")
const {Mongoclient}=require("mongodb")
const uri=require("./app_uri")
let client;
let session;
const dbConnect=()=>{
    try{
        client=new Mongoclient(uri)
        client.connect()
        client.db("bank").collection("accounts")
        
        
    }
}