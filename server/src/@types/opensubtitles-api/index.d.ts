// Type definitions for opensubtitles-api
// Project: https://github.com/vankasteelj/opensubtitles-api/
// Definitions by: Luca Faggianelli <https://github.com/lucafaggianelli>

/// <reference types="node" />

declare module 'opensubtitles-api' {
  export default class OpenSubtitles {
    constructor (userAgent: string)

    /**
     * Search for subtitles
     * @param params information about the video to be subtitled
     */
    search (params: SearchParams): SearchResults
  }

  type Extension = 'srt' | 'sub' | 'smi' | 'txt' | 'ssa' | 'ass' | 'mpl'

  /**
   * @param extensions Accepted extensions, defaults to 'srt'
   * @param sublanguageid Desired subtitle lang, ISO639-3 langcode, defaults to 'all'
   * @param hash Size + 64bit checksum of the first and last 64k
   * @param path Absolute path to the video file, it allows to automatically calculate 'hash'
   * @param filesize Total size, in bytes
   * @param filename The video file name. Better if extension is included
   * @param season If TV Episode
   * @param episode If TV Episode
   * @param imdbid IMDB id with or without leading 'tt'
   * @param fps Number of frames per sec in the video
   * @param query Text-based query, this is not recommended
   * @param limit Number of subtitles to return for each language, can be 'best', 'all' or an arbitrary number. Defaults to 'best'
   */
  interface SearchParams {
    extensions?: Extension | Extension[];
    sublanguageid?: string | string[];
    hash?: string;
    path?: string;
    filesize?: number;
    filename?: string;
    season?: number;
    episode?: number;
    imdbid?: string | number;
    fps?: number;
    query?: string;
    limit?: number;
  }

  interface Subtitles {
    downloads: number;
    encoding: string;
    id: number;
    lang: string;
    langName: string;
    score: number;
    url: string;
    filename: string;
  }

  type SearchResults = { [ lang: string ]: Subtitles }
}
