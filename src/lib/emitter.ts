type EventName = string | symbol;

/**
 * tiny event emitter
 */
export default class EventEmitter {
  private eventMap: Map<EventName, Function[]>;

  constructor () {
    this.eventMap = new Map()
  }

  /**
   * 监听
   * @param eventName 
   * @param callback 
   * @returns 
   */
  on (eventName: EventName, callback: Function) {
    const { eventMap } = this
    let listeners = eventMap.get(eventName)
    if (!listeners) {
      eventMap.set(eventName, [])
      listeners = eventMap.get(eventName)
    }

    listeners.push(callback)
    return this
  }

  /**
   * off
   * @param eventName 
   * @param callback 
   * @returns 
   */
  off (eventName: EventName, callback: Function) {
    const { eventMap } = this
    const listeners = eventMap[eventName]
    if (!listeners) return this

    if (!callback) {
      eventMap.delete(eventName)
      return this
    }

    const index = listeners.findIndex(i => i === callback || i.origin === callback)
    if (index >= 0) {
      listeners.splice(index, 1)
    }
    return this
  }

  /**
   * once
   * @param eventName 
   * @param callback 
   */
  once (eventName: EventName, callback: Function) {
    const listener = (...args) => {
      this.off(eventName, listener)
      callback.apply(this, args)
    }
    listener.origin = callback
    this.on(eventName, listener)
  }

  /**
   * emit
   * @param eventName 
   * @param args 
   * @returns 
   */
  emit (eventName: EventName, ...args: unknown[]) {
    const listeners = this.eventMap.get(eventName)
    if (!listeners || !listeners.length) return

    const _listeners = listeners.slice()
    for (let i = 0; i < _listeners.length; i++) {
      _listeners[i].apply(this, args)
    }

    return this
  }
}
