import axios from 'axios'

let urls = {
  test: `${process.env.NEXT_PUBLIC_URL}`,
  development: `${process.env.NEXT_PUBLIC_URL}`,
  production: `${process.env.NEXT_PUBLIC_URL}`,
}

const api = axios.create({
  baseURL: urls[process.env.NODE_ENV],
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
})

export default api
