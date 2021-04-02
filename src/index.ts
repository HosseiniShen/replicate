import EventEmitter from './lib/emitter'

interface ReplicateOptions {

}

/**
 * @description Replicate
 */
class Replicate extends EventEmitter {
  private trigger: HTMLElement | HTMLCollection;

  constructor (trigger: HTMLElement | HTMLCollection, options) {
    super()
    
    this.listen(trigger)
  }

  listen (trigger: HTMLElement | HTMLCollection) {
    trigger.addEventListener('click', e => this.clickListener(e))
  }

  clickListener (e: Event) {

  }
}
