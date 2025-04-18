export function formatClipboardValue(value: any) {
  if (!value) return ''
  if (typeof value == 'object' || Array.isArray(value)) {
    return JSON.stringify(value)
  }
  return value
}

export const copyToClipboard = (str: string, callback = () => {}) => {
  const focused = window.document.hasFocus()
  if (focused) {
    window.navigator?.clipboard?.writeText(str).then(callback)
  } else {
    console.warn('Unable to copy to clipboard')
  }
}
