const express=require('express')
const mongoose=require('mongoose')
const jwt=require('jsonwebtoken')
const cors=require('cors')
const middleware=require('./middleware')
const Registeruser=require('./model')
const app=express();
const PORT=9909;
mongoose.connect("mongodb+srv://kirankumarnaga7:Nkiran07@cluster0.oq3jdss.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>{
    console.log('Mongodb connected successfully')
})
app.use(cors({origin:'*'}))
app.use(express.json());
app.post('/Register',async(req,res)=>{
    try{
      const{username,email,password,confirmpassword}=req.body;
      let exist=await Registeruser.findOne({email});
      if(email){
        res.status(400).send('user already existed')
      }
      if(password !== confirmpassword){
        res.status(400).send("passwords are not matching")
      }

      let newUser=new Registeruser({
        username,
        email,
        password,
        confirmpassword
      })
      await newUser.save();
      res.status(200).send('Register Successfully')
    }
    catch(err){
        console.log(err)
        return res.status(500).send('internal error')
    }
})
app.post('/Login',async(req,res)=>{
    try{
        const{email,password}=req.body;
        let exist=await Registeruser.findOne({email})
        if(!exist){
            return res.status(400).send('user not found')
        }
        if(exist.password !== password){
            return res.status(400).send('password not matched')
        }
        let payload={
            user:{
                id:exist.id
            }
        }
        jwt.sign(payload,'jwtsecret',{expiresIn:300000},
            (err,token)=>{
             if(err) throw err;
             return res.json({token})
        })
    }
    catch(err){
        console.log(err)
    }
})
app.get('/myprofile',middleware,async(req,res)=>{
    try{
        let exist=await Registeruser.findById(req.user.id)
        if(!exist){
            return res.status(400).send('user not found');
        } 
        res.json(exist)
    }catch(err){
        console.log(err)
        return res.status(400).send('server error')
    }
})
app.listen(PORT,()=>{
    console.log(`server started at${PORT}`);
})