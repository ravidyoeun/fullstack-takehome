type GenericCellProps = {
  value: unknown
}

const isIsoDateString = (value: string) => {
  // Lightweight ISO-ish detection
  return !Number.isNaN(Date.parse(value)) && /[T ]/.test(value)
}

export const GenericCell = ({ value }: GenericCellProps) => {
  if (value === null || value === undefined) return <span className="text-gray-400">—</span>

  if (typeof value === 'number') {
    return <span>{value.toLocaleString()}</span>
  }

  if (typeof value === 'boolean') {
    return <span>{value ? 'Yes' : 'No'}</span>
  }

  if (value instanceof Date) {
    return <span>{value.toLocaleString()}</span>
  }

  if (typeof value === 'string') {
    if (isIsoDateString(value)) {
      return <span>{new Date(value).toLocaleString()}</span>
    }
    return <span>{value}</span>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400">—</span>
    return <span>{value.join(', ')}</span>
  }

  // Fallback stringify for objects
  return <span>{String(value)}</span>
}
