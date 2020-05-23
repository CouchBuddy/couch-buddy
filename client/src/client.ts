import axios from 'axios'
import io from '../../server/node_modules/socket.io-client'

let client = axios.create({
  baseURL: `${location.protocol}//${location.hostname}:3000`
})

export default client

export function setServerUrl (baseURL: string) {
  client = axios.create({ baseURL })
}

export function getSocket (ns = '') {
  return io(`${location.protocol}//${location.hostname}:3000${ns}`)
}

export async function addTorrent (magnetURI: string) {
  const data = new FormData()

  if (magnetURI) {
    data.append('magnetURI', magnetURI)
  }

  const response = await client.post('/api/downloads', data)
  return response.data
}
