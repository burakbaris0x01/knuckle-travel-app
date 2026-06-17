const jwt = require('jsonwebtoken')
const fs = require('fs')
const privateKey = fs.readFileSync('data/private.key')
const publicKey = fs.readFileSync('data/public.key')
const {accessTokenOptions, refreshTokenOptions} = require('../options/jwt')
const User = require('../model/user')
const { accessCookieOptions, authCookieOptions, clearCookieOptions } = require('../utils/cookieOptions')

const handleRefreshToken = async (req, resp, next)=>{

  // IF JWT EXISTS BUT NOT VALID LOOK FOR THE REFRESH TOKEN
  if (req.JWTexists && !req.JWTverified){
    if (!req.cookies.refreshToken) {
      resp.clearCookie('Authorization', clearCookieOptions);
      return next()
    }

    const refreshToken = req.cookies.refreshToken.split(' ')[1]
    if (!refreshToken) {
      resp.clearCookie('refreshToken', clearCookieOptions);
      resp.clearCookie('Authorization', clearCookieOptions);
      return next()
    }

    // TRY TO VERIFY THE REFRESH JWT TOKEN
    let refreshTokenCheck;
    try{
      refreshTokenCheck = jwt.verify(refreshToken,publicKey)
    }catch(err){
      // IF THE REFRESH TOKEN IS UNVALID, CLEAR CLIENT SIDE COOKIES
      resp.clearCookie('refreshToken', clearCookieOptions);
      resp.clearCookie('Authorization', clearCookieOptions); 
      return next()
    }

    // IF REFRESH JWT IS VERIFIED, CHECK THE DATABASE IF 
    // THAT REFRESH TOKEN IS ATTACHED TO THE USER.
    const match = await User.findOne({ refreshTokens: { "$in" : [refreshToken]} }).lean()
    if (!match){ 
      // IF THE REFRESH JWT IS VERIFIED BUT NOT FOUND IN THE DATABASE, 
      // IT MEANS IT IS USED BEFORE. THEREFORE CLEAR CLIENT SIDE COOKIES.
      resp.clearCookie('refreshToken', clearCookieOptions);
      resp.clearCookie('Authorization', clearCookieOptions);

      // Delete all refresh tokens.
      await User.updateOne(
        { 'username': refreshTokenCheck.username },
        { refreshTokens: [] }
      );
      req.reuse=true
      return next()}  
    
    // IF THE REFRESH JWT IS VERIFIED AND FOUND IN THE DATABASE, 
    // IT MEANS USER IS ALLOWED TO GENERATE A NEW ACCESS TOKEN WITH IT.
    
    //GENERATE NEW ACCESS JWT.
    const accessToken = jwt.sign({'username':match.username},privateKey,accessTokenOptions)

    // GENERATE NEW REFRESH JWT.
    const newRefreshToken = jwt.sign({'username':match.username},privateKey,refreshTokenOptions)
   
    // PUSH THE NEW REFRESH TOKEN TO THE DATABASE.
    await User.updateOne(
      { '_id': match._id },
      { $push: { "refreshTokens": newRefreshToken} }
    );

    // PULL THE OLD REFRESH TOKEN FROM THE DATABASE.
    await User.updateOne(
      { '_id': match._id },
      { $pull: { "refreshTokens": refreshToken} }
    );

    // THESE METHODS ARE CALLED TOKEN ROTATION AND REUSE DETECTION. 
    // IT IS THE BEST PRACTICE ACCORDING TO 0Auth.
    // IT IS HIGHLY UNLIKELY FOR REFRESH TOKEN TO GET STOLEN, BUT IF IT DOES, 
    // NO REFRESH TOKEN IS ALLOWED FOR A NEW ACCESS TOKEN GENERATION TWICE.
    
    //SET NEW ACCESS TOKEN TO THE CLIENT....
    resp.cookie('Authorization', 'Bearer '+accessToken, accessCookieOptions)

    //SET NEW REFRESH TOKEN TO THE CLIENT.
    resp.cookie('refreshToken', 'Bearer '+newRefreshToken, authCookieOptions)    

    //REDIRECT USER BACK TO THE ORIGINAL REQUEST. SINCE TOKENS ARE FRESH, THIS TIME ACCESS TOKEN 
    //WILL BE VERIFIED.
    return resp.redirect(302,req.originalUrl)
    }
  return next()
}
module.exports = handleRefreshToken
