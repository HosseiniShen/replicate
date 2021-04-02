/**
 * select element
 * @param element 
 */
export default function select (element: HTMLElement): string {
  let selectedText: string = '';
  const nodeName = element.nodeName;

  if (nodeName === 'SELECT') {
    element.focus();
    selectedText = (<HTMLSelectElement>element).value;
  } else if (nodeName === 'INPUT' || nodeName === 'TEXTAREA') {
    const value: string = (<HTMLInputElement>element).value

    element.focus();
    (<HTMLInputElement>element).setSelectionRange(0, value.length);
    selectedText = value;
  } else {
    if (element.hasAttribute('contenteditable')) {
      element.focus();
    }

    const selection: Selection | null = window.getSelection();
    const range: Range = document.createRange();
    
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    selectedText = selection.toString();
  }

  return selectedText
}
