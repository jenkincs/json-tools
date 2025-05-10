import { JsonNode } from '../types'

interface Difference {
  path: string
  type: 'added' | 'removed' | 'changed'
  oldValue?: any
  newValue?: any
}

export function parseJsonToTree(json: any, path: string = ''): JsonNode[] {
  if (json === null) {
    return [{
      key: path,
      value: null,
      type: 'null',
      path
    }]
  }

  if (Array.isArray(json)) {
    return json.map((item, index) => ({
      key: `${path}[${index}]`,
      value: item,
      type: typeof item === 'object' ? (Array.isArray(item) ? 'array' : 'object') : typeof item as any,
      children: typeof item === 'object' ? parseJsonToTree(item, `${path}[${index}]`) : undefined,
      path: `${path}[${index}]`
    }))
  }

  if (typeof json === 'object') {
    return Object.entries(json).map(([key, value]) => ({
      key,
      value,
      type: typeof value === 'object' ? (Array.isArray(value) ? 'array' : 'object') : typeof value as any,
      children: typeof value === 'object' ? parseJsonToTree(value, path ? `${path}.${key}` : key) : undefined,
      path: path ? `${path}.${key}` : key
    }))
  }

  return [{
    key: path,
    value: json,
    type: typeof json as any,
    path
  }]
}

export function findDifferences(obj1: any, obj2: any, path: string = ''): Difference[] {
  const differences: Difference[] = []

  if (typeof obj1 !== typeof obj2) {
    differences.push({
      path,
      type: 'changed',
      oldValue: obj1,
      newValue: obj2
    })
    return differences
  }

  if (typeof obj1 !== 'object' || obj1 === null || obj2 === null) {
    if (obj1 !== obj2) {
      differences.push({
        path,
        type: 'changed',
        oldValue: obj1,
        newValue: obj2
      })
    }
    return differences
  }

  if (Array.isArray(obj1)) {
    if (!Array.isArray(obj2)) {
      differences.push({
        path,
        type: 'changed',
        oldValue: obj1,
        newValue: obj2
      })
      return differences
    }

    const maxLength = Math.max(obj1.length, obj2.length)
    for (let i = 0; i < maxLength; i++) {
      if (i >= obj1.length) {
        differences.push({
          path: `${path}[${i}]`,
          type: 'added',
          newValue: obj2[i]
        })
      } else if (i >= obj2.length) {
        differences.push({
          path: `${path}[${i}]`,
          type: 'removed',
          oldValue: obj1[i]
        })
      } else {
        differences.push(...findDifferences(obj1[i], obj2[i], `${path}[${i}]`))
      }
    }
    return differences
  }

  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)])
  for (const key of allKeys) {
    const newPath = path ? `${path}.${key}` : key
    if (!(key in obj1)) {
      differences.push({
        path: newPath,
        type: 'added',
        newValue: obj2[key]
      })
    } else if (!(key in obj2)) {
      differences.push({
        path: newPath,
        type: 'removed',
        oldValue: obj1[key]
      })
    } else {
      differences.push(...findDifferences(obj1[key], obj2[key], newPath))
    }
  }

  return differences
}

export function flattenObject(obj: any, prefix: string = ''): any {
  return Object.keys(obj).reduce((acc: any, key: string) => {
    const pre = prefix.length ? `${prefix}.` : ''
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], pre + key))
    } else {
      acc[pre + key] = obj[key]
    }
    return acc
  }, {})
}

export function processValue(value: any): any {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'object') {
    return JSON.stringify(value)
  }
  return value
}

export function processData(data: any): any {
  if (Array.isArray(data)) {
    return data.map(item => processData(item))
  }
  if (typeof data === 'object' && data !== null) {
    const processed: any = {}
    for (const [key, value] of Object.entries(data)) {
      processed[key] = processData(value)
    }
    return processed
  }
  return processValue(data)
} 