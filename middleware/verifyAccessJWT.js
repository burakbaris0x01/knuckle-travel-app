
const jwt = require('jsonwebtoken')
const fs = require('fs')
const publicKey = fs.readFileSync('data/public.key')

const verifyAccessJWT = (req, resp, next)=>{
  req.JWTverified=false
  req.JWTexists=false;
  const cookies = req.cookies

  // CHECK IF THERE IS ANY ACCESS JWT FOR AUTH
  if (cookies.Authorization){
    req.JWTexists=true;
    const token = cookies.Authorization.split(' ')[1]
    // IF JWT ACCESS TOKEN EXISTS, CHECK IF IT IS EXPIRED OR VALID
    try {
      const decoded = jwt.verify(token, publicKey)
      req.JWTverified = true
      req.decoded = decoded
      req.username = decoded.username
    } catch (err) {
      req.JWTverified = false
    }
  }
  return next()
}

module.exports = verifyAccessJWT
