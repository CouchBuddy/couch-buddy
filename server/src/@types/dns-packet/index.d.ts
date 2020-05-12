// Type definitions for dns-packet 1.1.1
// Project: https://github.com/mafintosh/multicast-dns
// Definitions by: Iain McGinniss <https://github.com/iainmcgin>

declare module 'dns-packet' {

/**
 * The currently defined set of DNS record types.
 */
type RecordType =
    'A'
    | 'AAAA'
    | 'AFSDB'
    | 'APL'
    | 'AXFR'
    | 'CAA'
    | 'CDNSKEY'
    | 'CDS'
    | 'CERT'
    | 'CNAME'
    | 'DNAME'
    | 'DHCID'
    | 'DLV'
    | 'DNSKEY'
    | 'DS'
    | 'HINFO'
    | 'HIP'
    | 'IXFR'
    | 'IPSECKEY'
    | 'KEY'
    | 'KX'
    | 'LOC'
    | 'MX'
    | 'NAPTR'
    | 'NS'
    | 'NSEC'
    | 'NSEC3'
    | 'NSEC3PARAM'
    | 'NULL'
    | 'OPT'
    | 'PTR'
    | 'RRSIG'
    | 'RP'
    | 'SIG'
    | 'SOA'
    | 'SRV'
    | 'SSHFP'
    | 'TA'
    | 'TKEY'
    | 'TLSA'
    | 'TSIG'
    | 'TXT'
    | 'URI';

export interface Question {
    type: RecordType;
    name: string;
}

export interface SrvData {
    port: number;
    target: string;
    priority?: number;
    weight?: number;
}

export interface HInfoData {
    cpu: string;
    os: string;
}

export interface BaseAnswer<T, D> {
    type: T;
    name: string;
    ttl?: number;
    data: D;
}

/**
 * Record types for which the library will provide a string in the data field.
 */
type StringRecordType =
    'A'
    | 'AAAA'
    | 'CNAME'
    | 'DNAME'
    | 'PTR';

/**
 * Record types for which the library does not attempt to process the data
 * field.
 */
type OtherRecordType =
    'AFSDB'
    | 'APL'
    | 'AXFR'
    | 'CAA'
    | 'CDNSKEY'
    | 'CDS'
    | 'CERT'
    | 'DHCID'
    | 'DLV'
    | 'DNSKEY'
    | 'DS'
    | 'HIP'
    | 'IXFR'
    | 'IPSECKEY'
    | 'KEY'
    | 'KX'
    | 'LOC'
    | 'MX'
    | 'NAPTR'
    | 'NS'
    | 'NSEC'
    | 'NSEC3'
    | 'NSEC3PARAM'
    | 'NULL'
    | 'OPT'
    | 'RRSIG'
    | 'RP'
    | 'SIG'
    | 'SOA'
    | 'SSHFP'
    | 'TA'
    | 'TKEY'
    | 'TLSA'
    | 'TSIG'
    | 'TXT'
    | 'URI';

type StringAnswer = BaseAnswer<StringRecordType, string>;
type SrvAnswer = BaseAnswer<'SRV', SrvData>;
type HInfoAnswer = BaseAnswer<'HINFO', HInfoData>;
type BufferAnswer = BaseAnswer<OtherRecordType, Buffer>;

type Answer = StringAnswer
    | SrvAnswer
    | HInfoAnswer
    | BufferAnswer;

export interface Packet {
    /**
     * Whether the packet is a query or a response. This field may be
     * omitted if it is clear from the context of usage what type of packet
     * it is.
     */
    type?: 'query' | 'response';

    id?: number;

    /**
     * A bit-mask combination of zero or more of:
     * {@link AUTHORITATIVE_ANSWER},
     * {@link TRUNCATED_RESPONSE},
     * {@link RECURSION_DESIRED},
     * {@link RECURSION_AVAILABLE},
     * {@link AUTHENTIC_DATA},
     * {@link CHECKING_DISABLED}.
     */
    flags?: number;
    questions?: Question[];
    answers?: Answer[];
    additionals?: Answer[];
    authorities?: Answer[];
}

export const AUTHORITATIVE_ANSWER: number
export const TRUNCATED_RESPONSE: number
export const RECURSION_DESIRED: number
export const RECURSION_AVAILABLE: number
export const AUTHENTIC_DATA: number
export const CHECKING_DISABLED: number

export function encode(package: Packet, buf?: Buffer, offset?: number): Buffer
export function decode(buf: Buffer, offset?: number): Packet
export function encodingLength(packet: Packet): number
}
