export default class AppConfig {
  readonly nodeEnv: string;

  get isDevelopment () { return this.nodeEnv === 'development' }
  get isProduction () { return this.nodeEnv === 'production' }
  get isTest () { return this.nodeEnv === 'test' }

  readonly dbSqlitePath: string;

  /**
   * Directory where media files are stored, the path is absolute
   */
  readonly uploadsDir: string;
  readonly mediaDir: string;
  readonly omdbApiKey?: string;
  readonly openSubtitlesUa?: string;
  readonly tmdbApiKey?: string;

  /**
   * Server port
   */
  readonly port: number;

  /**
   * WebSocket port
   */
  readonly wsPort: number;
}
