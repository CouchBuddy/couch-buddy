import axios from 'axios'
import io from '../../server/node_modules/socket.io-client'

export default axios.create({
  baseURL: `${location.protocol}//${location.hostname}:3000`
})

export const socket = io(`${location.protocol}//${location.hostname}:3001`)
