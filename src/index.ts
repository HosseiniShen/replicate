import EventEmitter from './lib/emitter'
import { ActionEnum } from './enum/action'
import { getAttributeValue } from './utils'
import select from './lib/select';

interface ReplicateOptions {
  text?: Function;
  action?: Function;
  target?: Function;
}

/**
 * @description Replicate
 */
class Replicate extends EventEmitter {
  private text: Function;
  private action: Function;
  private target: Function;
  private selectedContent: string;

  constructor (trigger: Element, options: ReplicateOptions) {
    super()

    const { text, action, target } = options
    this.text = typeof text === 'function' ? text : (trigger: HTMLElement) => getAttributeValue(trigger, 'text')
    this.action = typeof action === 'function' ? action : (trigger: HTMLElement) => getAttributeValue(trigger, 'action')
    this.target = typeof target === 'function' ? target : (trigger: HTMLElement) => getAttributeValue(trigger, 'target')

    this.listen(trigger)
  }

  /**
   * Initial listener
   * @param trigger 
   */
  listen (trigger: Element) {
    if (trigger) {
      trigger.addEventListener('click', e => this.clickListener(e))
    }
  }

  /**
   * Cabllback
   * @param e 
   */
  clickListener (e: Event) {
    const trigger = e.target

    const text = this.text(trigger)
    const action = this.action(trigger)
    const target = document.querySelector(this.target(trigger))

    if (text) {
      this.selectFake(text, action)
    } else if (target) {
      this.selectTarget(target, action)
    }
  }

  /**
   * Select a fake element
   * @param text 
   * @param action 
   */
  selectFake (text: string, action: ActionEnum) {
    let element = this.createFakeElement(text)
    document.body.appendChild(element)
    this.selectedContent = select(element)
    this.copyText(action)
    document.body.removeChild(element)
  }

  /**
   * Select target element
   * @param target 
   * @param action 
   */
  selectTarget (target: HTMLElement, action: ActionEnum) {
    this.selectedContent = select(target)
    this.copyText(action)
  }

  /**
   * Copy selected content
   * @param action 
   */
  copyText (action: ActionEnum) {
    let succeeded: boolean = false
    let err = null
    try {
      succeeded = document.execCommand(action)
    } catch (error) {
      err = error
    }
    this.handleResult(succeeded, err)
  }

  /**
   * Emit a event
   * @param succeeded 
   * @param error 
   */
  handleResult (succeeded, error: Error | null) {
    this.emit(succeeded ? 'success' : 'error', {
      error,
      text: this.selectedContent,
    })
  }

  /**
   * Create fake input element
   * @param text 
   * @returns 
   */
  createFakeElement (text: string): HTMLElement {
    let ele = document.createElement('input')
    const isRTL = document.documentElement.dir === 'rtl'
    ele.style.position = 'absolute'
    ele.style[ isRTL ? 'right' : 'left' ] = '-9999px'
    ele.value = text
    return ele
  }

  /**
   * Returns the support of the given action
   * @param actions 
   * @returns 
   */
  static isSupported (actions: string[] = [ ActionEnum.COPY, ActionEnum.CUT ]) {
    let supported: boolean = !!document.queryCommandSupported

    if (!supported) return supported

    return actions.every(action => document.queryCommandSupported(action))
  }

}

export default Replicate