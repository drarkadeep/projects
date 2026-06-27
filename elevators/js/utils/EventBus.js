/**
 * EventBus class is a simple Publish-Subscribe (Pub/Sub) event system.
 * 
 * Think of it like a radio station and radio listeners.
 * 
 * In this application, we want to separate the core math/physics engine from the UI code
 * (this is called "decoupling"). 
 * - The SimulationEngine does not need to know that we are drawing on a <canvas> or 
 *   showing HTML cards. It just runs the ticks.
 * - When something interesting happens (e.g. a passenger boards an elevator), the engine
 *   broadcasts (publishes) an event: e.g. "passenger-boarded".
 * - Any UI component that wants to react to this event can tune in (subscribe) to hear it
 *   and update the screen accordingly.
 */
export class EventBus {
  constructor() {
    // A dictionary holding lists of callback functions.
    // Key: Event name (e.g., 'tick'), Value: Array of callback functions to trigger.
    this._listeners = {};
  }

  /**
   * Subscribe (listen) to a specific radio station channel (event).
   * @param {string} event - The name of the event to listen to
   * @param {Function} callback - The function to execute when the event occurs
   */
  on(event, callback) {
    // If we haven't seen this event type before, initialize an empty list for it
    if (!this._listeners[event]) {
      this._listeners[event] = [];
    }
    this._listeners[event].push(callback);
  }

  /**
   * Unsubscribe (stop listening) from a specific event channel.
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    if (!this._listeners[event]) return;
    // Filter out the callback to remove it from the subscription list
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
  }

  /**
   * Broadcast (emit) an event. This triggers all the callback functions registered for it.
   * @param {string} event - The name of the event to broadcast
   * @param {*} data - The payload/details about what happened
   */
  emit(event, data) {
    if (!this._listeners[event]) return;
    // Loop through and call every function that is listening to this channel
    for (const cb of this._listeners[event]) {
      cb(data);
    }
  }

  /**
   * Clear all subscriptions. Useful when resetting the application.
   */
  clear() {
    this._listeners = {};
  }
}

