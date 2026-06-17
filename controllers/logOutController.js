
// CONTROLLER OF THE /logout ENDPOINT

const User = require('../model/user')
const path = require('path');
const { clearCookieOptions } = require('../utils/cookieOptions')

const getReq = async (req, resp) => {
    try{
      const refreshToken = req.cookies.refreshToken.split(' ')[1]
      const accessToken = req.cookies.Authorization.split(' ')[1]
      // CLEAR CLIENT SIDE COOKIES.
      resp.clearCookie('refreshToken', clearCookieOptions);
      resp.clearCookie('Authorization', clearCookieOptions);  
      const match = await User.findOne({ refreshTokens: { "$in" : [refreshToken]} }).lean()
      
      // REMOVE THE REFRESH TOKEN FROM THE DATABASE AFTER LOGOUT 
      // PART OF THE REUSE DETECTION MECHANISM.
      if (match){
        await User.updateOne(
          { '_id': match._id },
          { $pull: { "refreshTokens": refreshToken} }
        );
      }  
      resp.render(path.join(__dirname,'..','views','index'),{
        title:"Logged out!"
      })
  
    }catch(err){
      
      return resp.render(path.join(__dirname,'..','views','index'),{
        title:"You are not logged in!"
      })
  
    }

}
module.exports = {
  getReq
}
