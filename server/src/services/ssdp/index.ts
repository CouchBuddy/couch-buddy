import axios from 'axios'
import { Buffer } from 'buffer'
import dgram from 'dgram'
import xml,{ X2jOptions } from 'fast-xml-parser'
import he from 'he'
import { Namespace } from 'socket.io'
import { inject, singleton } from 'tsyringe'
import { URL } from 'url'

import SSDPResponse from './SsdpResponse'
import Service from '../Service'
import SocketIoService from '../socket-io'
import { ensureTrailingSlash } from '../../utils'
import { VideoItem } from '../../types'

interface DeviceInfo {
  id: string
  name: string
  location: string
  baseURL: string
  contentDirectory: any
}

const XML_PARSER_OPTS: Partial<X2jOptions> = {
  ignoreAttributes: false,
  attrValueProcessor: (val: string, attrName: string) => he.decode(val, {isAttributeValue: true}),
  tagValueProcessor : (val: string, tagName: string) => he.decode(val)
}

// Definition from http://www.upnp.org/specs/av/UPnP-av-ContentDirectory-v1-Service.pdf section 2.7.6
const RE_PROTOCOL_INFO = /:\*:(.+):\*$/

const UPNP_CONTAINERS = [ 'object.container', 'object.container.storageFolder', 'object.container.videoContainer']
const UPNP_VIDEO_ITEMS = [ 'object.item.videoItem', 'object.item.videoItem.movie' ]

@singleton()
export default class Discovery extends Service {
  devices: { [usn: string]: DeviceInfo } = {}

  private client: dgram.Socket
  private socketIo: Namespace

  constructor (@inject(SocketIoService) socketIoService: SocketIoService) {
    super()
    this.socketIo = socketIoService.io.of('/ssdp')
  }

  async init (): Promise<void> {
    this.socketIo.on('connection', (socket) => {
      socket.emit('devices:all', this.devices)
    })

    this.scan()
  }

  async destroy (): Promise<void> {
    this.socketIo.removeAllListeners()

    if (this.client) {
      return new Promise((resolve) => {
        this.client.close(resolve)
      })
    }
  }

  scan () {
    this.client = dgram.createSocket('udp4')

    const messageLines = [
      'M-SEARCH * HTTP/1.1',
      'HOST:239.255.255.250:1900',
      'ST:upnp:rootdevice',
      'MX:2',
      'MAN:"ssdp:discover"'
    ]
    const message = Buffer.from(messageLines.join('\r\n') + '\r\n')

    this.client.send(message, 1900, '239.255.255.250')

    this.client.on('message', async (msg) => {
      const response = new SSDPResponse(msg.toString())
      console.log('Device found', response.headers)

      try {
        const deviceInfo = await this.getDeviceInfo(response.getHeader('Location'))

        if (deviceInfo.contentDirectory) {
          this.socketIo.emit('devices:new', deviceInfo)
          this.devices[deviceInfo.id] = deviceInfo
        }
      } catch {}
    })
  }

  async getDeviceInfo (url: string): Promise<DeviceInfo> {
    const response = await axios.get(url)
    const deviceDescription = xml.parse(response.data, XML_PARSER_OPTS)

    const u = new URL(url)
    /**
     * Service base URL, it's always with a trailing slash
     */
    const baseURL: string = ensureTrailingSlash(deviceDescription.root.URLBase || `${u.protocol}//${u.host}`)

    const contentDirectory = deviceDescription.root.device.serviceList.service
      .find((service: any) => service.serviceType === 'urn:schemas-upnp-org:service:ContentDirectory:1')

    return {
      id: deviceDescription.root.device.UDN,
      name: deviceDescription.root.device.friendlyName,
      location: url,
      baseURL,
      contentDirectory
    }
  }

  async getDeviceVideoItems (device: DeviceInfo): Promise<VideoItem[]> {
    const controlURL = device.baseURL + device.contentDirectory.controlURL
    const scpdURL = device.baseURL + device.contentDirectory.SCPDURL

    try {
      console.log('GET', scpdURL)
      const service = xml.parse((await axios.get(scpdURL)).data, XML_PARSER_OPTS)

      if (!service.scpd) {
        console.error('This device doesnt have an scpd', service)
        return []
      }

      const hasBrowseAction = service.scpd.actionList.action.find((action: any) => action.name === 'Browse')
      if (!hasBrowseAction) {
        console.error('This device doesn\'t have a Browse action')
        return []
      }
    } catch (e) {
      console.error('Error listing ContentDirectory services', e)
      return []
    }

    const allVideos = await this.searchVideoItems(controlURL)
    if (!allVideos.length) {
      console.error('This device doesn\'t contain any video')
      return []
    }

    return allVideos
  }

  /**
   * Search an object with `upnp:class` of type `object.container.videoContainer`.
   * It searches in all subdirectories and may return undefined if none is found
   *
   * @param controlURL URL to the SOAP control endpoint
   * @param objectId The object ID of the directory where to start the scan. If none is
   *  provided, it starts from root.
   */
  private async searchVideoItems (controlURL: string, objectId = '0'): Promise<VideoItem[]> {
    let videos: VideoItem[] = []
    const dirContent = await this.actionBrowseDirectory(controlURL, objectId)

    if (dirContent.container) {
      const containers = Array.isArray(dirContent.container)
        ? dirContent.container
        : [ dirContent.container ]

      // Go deeper in the tree, but search only containers
      for (const dir of containers.filter((container: any) => UPNP_CONTAINERS.includes(container['upnp:class']))) {
        videos = videos.concat(await this.searchVideoItems(controlURL, dir['@_id']))
      }
    }

    if (dirContent.item) {
      const items = Array.isArray(dirContent.item)
        ? dirContent.item
        : [ dirContent.item ]

      for (const item of items) {
        if (UPNP_VIDEO_ITEMS.includes(item['upnp:class'])) {
          videos.push(this.videoItemToObject(item))
        }
      }
    }

    return videos
  }

  private async actionBrowseDirectory (controlURL: string, objectId: string): Promise<any> {
    const response = await this.sendSOAPRequest(controlURL, 'ContentDirectory:1', 'Browse', {
      ObjectID: objectId,
      BrowseFlag: 'BrowseDirectChildren',
      Filter: '*',
      StartingIndex: 0,
      RequestedCount: 0,
      SortCriteria: ''
    })

    return xml.parse(response.Result, XML_PARSER_OPTS)['DIDL-Lite']
  }

  private videoItemToObject (item: any) {
    const m = item.res['@_protocolInfo'].match(RE_PROTOCOL_INFO)
    const mimeType = (m && m[1] && m[1] !== '*') ? m[1] : undefined

    return {
      externalId: item['@_id'],
      title: '' + item['dc:title'],
      url: item.res['#text'],
      size: parseInt(item.res['@_size']),
      duration: item.res['@_duration'],
      resolution: item.res['@_resolution'],
      mimeType
    }
  }

  private async sendSOAPRequest (controlURL: string, type: string, action: string, args: any) {
    const argsXml = Object.entries(args).map(([ k, v ]) => `<${k}>${v}</${k}>`)

    const data = `<s:Envelope
      xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"
      s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"
    >
      <s:Body>
        <u:${action} xmlns:u="urn:schemas-upnp-org:service:${type}">
          ${argsXml}
        </u:${action}>
      </s:Body>
    </s:Envelope>`

    try {
      const response = await axios.post(controlURL, data, {
        headers: {
          'Content-Type': 'text/xml',
          SOAPACTION: `urn:schemas-upnp-org:service:${type}#${action}`
        }
      })

      return xml.parse(response.data, XML_PARSER_OPTS)['s:Envelope']['s:Body'][`u:${action}Response`]
    } catch (e) {
      console.error('Error sending SOAP request', e)
    }
  }
}
