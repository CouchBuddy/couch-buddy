export default abstract class Service {
  abstract init (): Promise<void>;
  abstract destroy (): Promise<void>;
}
