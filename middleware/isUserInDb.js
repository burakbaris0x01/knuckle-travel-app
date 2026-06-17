const User = require('../model/user')
const path = require('path')
const { clearCookieOptions } = require('../utils/cookieOptions')
const isUserInDb = async(req, resp, next)=>{

  req.isUserInDb = true;

  //IF THE ACCESS JWT IS VERIFIED TRY TO FIND THE RELATED 
  //USER IN THE DATABASE.
  if (req.JWTverified == true){
    const userName = req.username

    //IF TOKEN IS VERIFIED BUT THE RELATED USER IS NOT IN THE DATABASE 
    //IT MEANS THE USER'S ACCOUNT HAD BEEN DELETED AFTER THE TOKEN 
    //CREATION. THEREFORE CLEAR ALL THE JWT COOKIES.
    if (await User.findOne({username:userName})==null){
      req.isUserInDb = false;
      resp.clearCookie('Authorization', clearCookieOptions);
      resp.clearCookie('refreshToken', clearCookieOptions);
      return resp.render(path.join(__dirname,'..','views','error'),{
      title:"User seems to be deleted, refresh the page."
      })
    }
  }else{req.isUserInDb = false}
  next()
}
module.exports = isUserInDb
