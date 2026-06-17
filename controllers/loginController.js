
// CONTROLLER OF THE /login ENDPOINT

const path = require('path')
const User = require('../model/user')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const jwtOptions = require('../options/jwt.js')
const { accessCookieOptions, authCookieOptions } = require('../utils/cookieOptions')
const privateKey = fs.readFileSync('data/private.key')

const getReq = async (req,resp)=>{
    if(req.isUserInDb == true){
        return resp.render(path.join(__dirname,'..','views','index'),{
            // IF ALREADY LOGGED-IN, SENT A WELCOME MESSAGE.
            title: `Welcome back ${req.username}`
        })
    }
    // RENDER LOGIN PAGE IF NOT LOGGED-IN.
    return resp.render(path.join(__dirname,'..','views','login'))
}

const postReq = async (req,resp)=>{
    if (req.isUserInDb == true){return resp.send({"status":"ok","message":"Already logged in."})}
    const username = req.body.username;
    const password = req.body.password;

    // CHECK THE PASSWORD OF THE CORRESPONDING USERNAME.
    const user = await User.findOne({ username }).lean()
    if(!user || !await bcrypt.compare(password, user.password)){
      // UNAUTHORIZED IF WRONG PASSWORD.
      resp.status(401).json({"status": 'error', "message": 'Invalid password.'})
      return
    }

    // GENERATE A FRESH ACCESS-REFRESH JSON WEB TOKEN PAIR FOR THE CLIENT.
    const accessTokenOptions=jwtOptions.accessTokenOptions
    const refreshTokenOptions=jwtOptions.refreshTokenOptions
    const accessToken = jwt.sign({'username':username},privateKey,accessTokenOptions)
    const refreshToken = jwt.sign({'username':username},privateKey,refreshTokenOptions)

    // SEND THE COOKIES TO THE CLIENT SIDE.
    resp.cookie('refreshToken', 'Bearer '+refreshToken, authCookieOptions)
    resp.cookie('Authorization', 'Bearer '+accessToken, accessCookieOptions)   
  
    // PUSH THE FRESH REFRESH TO THE DATABASE FOR LATER 
    // TOKEN ROTATION AND REUSE DETECTION.
    await User.updateOne(
        { '_id': user._id },
        { $push: { "refreshTokens": refreshToken} }
      );
    return resp.send({"status":"ok","message":"Logged IN!"})
    
}
module.exports = {getReq, postReq}
