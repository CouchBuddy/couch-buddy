import axios from 'axios'
import { Packet } from 'dns-packet'
import xml,{ X2jOptions } from 'fast-xml-parser'
import he from 'he'
import Mdns, { MulticastDns } from 'multicast-dns'

import Service from './Service'

interface VideoItem {
  externalId: string | number
  title: string
  url: string
  size?: number
  duration?: string
  resolution?: string
  mimeType?: string
}

const XML_PARSER_OPTS: Partial<X2jOptions> = {
  ignoreAttributes: false,
  attrValueProcessor: (val: string, attrName: string) => he.decode(val, {isAttributeValue: true}),
  tagValueProcessor : (val: string, tagName: string) => he.decode(val)
}

// Definition from http://www.upnp.org/specs/av/UPnP-av-ContentDirectory-v1-Service.pdf section 2.7.6
const RE_PROTOCOL_INFO = /:\*:(.+):\*$/

export default class Discovery extends Service {
  mdns: MulticastDns;

  async init (): Promise<void> {
    this.mdns = Mdns({ loopback: false })

    this.mdns.on('response', this.responseHandler)
  }

  async destroy (): Promise<void> {
    return new Promise((resolve, reject) =>
      this.mdns.destroy((err) => {
        if (err) { return reject(err) }
        resolve()
      })
    )
  }

  scan () {
    console.log('Scan started')

    this.mdns.query({
      questions:[{
        name: '_services._dns-sd._udp',
        type: 'PTR'
      }]
    }, (e) => {
      if (e) {
        console.log('Error sending query', e)
      }
    })
  }

  async parseDevice (url: string): Promise<VideoItem[]> {
    const response = await axios.get(url)
    const deviceDescription = xml.parse(response.data, XML_PARSER_OPTS)

    const baseURL: string = deviceDescription.root.URLBase

    const contentDirectory = deviceDescription.root.device.serviceList.service
      .find((service: any) => service.serviceType === 'urn:schemas-upnp-org:service:ContentDirectory:1')

    if (!contentDirectory) { return [] }

    const controlURL: string = baseURL + contentDirectory.controlURL
    const service = xml.parse((await axios.get(baseURL + contentDirectory.SCPDURL)).data, XML_PARSER_OPTS)

    const hasBrowseAction = service.scpd.actionList.action.find((action: any) => action.name === 'Browse')
    if (!hasBrowseAction) {
      console.error('This device doesn\'t have a Browse action')
      return []
    }

    const videoContainer = await this.searchVideoContainer(controlURL)
    if (!videoContainer) {
      console.error('This device doesn\'t have a video container')
      return []
    }

    // List all videos
    const allVideoItems = await this.actionBrowseDirectory(controlURL, videoContainer['@_id'])

    const videos: VideoItem[] = allVideoItems.item.map((item: any) => {
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
    })

    return videos
  }

  /**
   * Search an object with `upnp:class` of type `object.container.videoContainer`.
   * It searches in all subdirectories and may return undefined if none is found
   *
   * @param controlURL URL to the SOAP control endpoint
   * @param objectId The object ID of the directory where to start the scan. If none is
   *  provided, it starts from root.
   */
  async searchVideoContainer (controlURL: string, objectId = '0'): Promise<any | undefined> {
    const dirContent = await this.actionBrowseDirectory(controlURL, objectId)

    // Find a videoContainer object
    console.log('found', dirContent.container.map((c: any) => c['dc:title'] + ' - ' + c['upnp:class']))
    const videoContainer = dirContent.container.find((dir: any) => dir['upnp:class'] === 'object.container.videoContainer')

    if (videoContainer) {
      return videoContainer
    } else {
      // Go deeper in the tree, but search only containers
      for (const dir of dirContent.container.filter((container: any) => container['upnp:class'] === 'object.container')) {
        const videoContainer = await this.searchVideoContainer(controlURL, dir['@_id'])
        if (videoContainer) { return videoContainer }
      }
      return undefined
    }
  }

  async actionBrowseDirectory (controlURL: string, objectId: string): Promise<any> {
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

  async sendSOAPRequest (controlURL: string, type: string, action: string, args: any) {
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

    const response = await axios.post(controlURL, data, {
      headers: {
        'Content-Type': 'text/xml',
        SOAPACTION: `urn:schemas-upnp-org:service:${type}#${action}`
      }
    })

    return xml.parse(response.data, XML_PARSER_OPTS)['s:Envelope']['s:Body'][`u:${action}Response`]
  }

  responseHandler (query: Packet) {
    for (const answer of query.answers) {
      console.log('<A>', answer)
    }
  }
}
