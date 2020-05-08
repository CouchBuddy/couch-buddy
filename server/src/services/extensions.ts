import Extension from '../models/Extension'

export const allExtensions: ExtensionModule[] = []

export async function init () {
  const extensions = await Extension.find({ where: { enabled: true } })

  for (const ext of extensions) {
    allExtensions.push({
      name: ext.name,
      search: require(ext.path).search
    })
  }
}

interface ExtensionModule {
  name: string;
  search(query: string): any[];
}
