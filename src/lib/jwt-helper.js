const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET

const sign = async (apikey) => {
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + (60 * 60)

    return jwt.sign({  exp, apikey }, secret)

}

const verify = async (token) => {
   return jwt.verify(token, secret);
}

export  { sign, verify }