import Extension from '../models/Extension'

export async function install (packageName: string): Promise<Extension> {
  throw new Error("Please implement npm install")
}
