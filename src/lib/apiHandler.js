import { verify } from './jwt-helper'
import ApiKey from '../models/apikey'
import dbConnect from "../utils/dbConnect"

dbConnect()

const apiHandler = (handler) => async (req, res) => {
    const token = req.headers?.authorization?.replace('Bearer ', '')

    //unauthorized - missing access token
    if (!token) return res.status(401).json({ message: 'Unauthorized access!'})

    const decoded = verify(token)
    const _apiKey = await ApiKey.find({ apikey: decoded.apikey })
    
    //unauthorized - invalid api key return
    if (!_apiKey) return res.status(401).json({ message: 'Invalid API key!'})

    return handler(req, res);
}

export { apiHandler };