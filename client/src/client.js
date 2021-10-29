import axios from 'axios'
import { io } from 'socket.io-client'

const client = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:3000`
})

export default client

export function getSocket (ns = '') {
  return io(`${location.protocol}//${location.hostname}:3000${ns}`, { transports: [ 'websocket' ] })
}

export async function addTorrent (magnetURI) {
  const data = new FormData()

  if (magnetURI) {
    data.append('magnetURI', magnetURI)
  }

  const response = await client.post('/api/downloads', data)
  return response.data
}
