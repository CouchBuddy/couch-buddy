const RE_HTTP_HEADER_STATUS = /(\w+)\/\d{1}\.\d{1} (\d+) .*/
const RE_HTTP_HEADER_LINE = /^([^\:\s]+)\s*\:\s*(.*)/

export default class SSDPResponse {
  headers: { [key: string]: string } = {}
  status: number
  type: string

  constructor (rawResponse: string) {
    this.parseHttpResponse(rawResponse)
  }

  getHeader (name: string): string | undefined {
    return this.headers[name.toLocaleLowerCase()]
  }

  private parseHttpResponse = (rawResponse: string): void => {
    const lines = rawResponse.split(/\r?\n/)

    const httpHeader = lines.shift().match(RE_HTTP_HEADER_STATUS)
    if (!httpHeader) {
      throw new Error('Bad response status: \n' + rawResponse)
    }

    this.type = httpHeader[1]
    this.status = parseInt(httpHeader[2])

    for (const headerLine of lines) {
      if (!headerLine) { continue }

      const m = headerLine.match(RE_HTTP_HEADER_LINE)

      if (!m) {
        console.warn('Bad header format', headerLine)
        continue
      }

      this.headers[m[1].toLocaleLowerCase()] = m[2]
    }
  }
}
