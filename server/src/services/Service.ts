export default abstract class Service {
  abstract async init (): Promise<void>;
  abstract async destroy (): Promise<void>;
}
