/**
 * get attribute value
 * @param element 
 * @param suffix 
 */
export function getAttributeValue (element: HTMLElement, suffix: string) {
  const dataKey = `replicate${ suffix.replace(/^[a-z]{1}/, (k) => k.toUpperCase()) }`
  return element.dataset[dataKey]
}
