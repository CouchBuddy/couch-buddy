// Type definitions for srt-to-vtt
// Project: https://github.com/mafintosh/srt-to-vtt
// Definitions by: Luca Faggianelli <https://github.com/lucafaggianelli>

/// <reference types="node" />

declare module 'srt-to-vtt' {
  import Pumpify from 'pumpify'

  export default function (): Pumpify
}
