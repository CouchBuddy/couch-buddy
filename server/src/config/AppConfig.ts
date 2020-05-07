export default interface AppConfig {
  readonly nodeEnv: string;
  readonly isProduction: boolean;

  readonly dbSqlitePath: string;

  /**
   * Directory where media files are stored, the path is absolute
   */
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
