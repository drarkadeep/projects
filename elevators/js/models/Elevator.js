/**
 * Elevator class represents a single elevator car.
 * 
 * Think of it as a state machine. A state machine has a set of states,
 * and rules for switching between them.
 * 
 * The elevator cycle is:
 * idle -> moving -> door-opening -> door-open -> door-closing -> idle
 * 
 * It also tracks metrics like stops made, idle time, and distance travelled (traversed).
 */
export class Elevator {
  /**
   * @param {number} id - Unique number for this elevator (0, 1, 2...)
   * @param {number} capacity - Maximum passenger load allowed
   * @param {number} speed - Number of floors this elevator moves per simulation tick
   * @param {number} doorDuration - Ticks the door stays open for boarding
   * @param {number} totalFloors - Total floors in the building
   */
  constructor(id, capacity, speed, doorDuration, totalFloors) {
    this.id = id;
    this.capacity = capacity;
    this.speed = speed;
    this.doorDuration = doorDuration; // Configurable duration
    this.totalFloors = totalFloors;

    // Movement & Routing State
    this.currentFloor = 0;          // Start at Ground floor (0)
    this.targetFloor = null;        // The floor we are headed to (null means none)
    this.direction = 'idle';        // 'up' | 'down' | 'idle'
    this.state = 'idle';            // 'idle' | 'moving' | 'door-opening' | 'door-open' | 'door-closing'
    this.doorTimer = 0;             // Countdown: Ticks remaining before doors close
    this.passengers = [];           // Array of Passenger objects currently inside this elevator
    this.destinationQueue = [];     // Target floors planned to visit (used by strategies)

    // Drawing helper
    this.visualPosition = 0.0;      // Fractional floor value (e.g. 2.5 is halfway between 2nd and 3rd floors) for smooth animations

    // Analytics / Performance Metrics
    this.totalFloorsTraversed = 0;  // Cumulative distance travelled
    this.totalStops = 0;            // Number of times doors opened
    this.idleTicks = 0;             // Number of ticks spent doing nothing
  }

  /**
   * Getter: Returns true if the elevator has reached its capacity limit.
   */
  get isFull() {
    return this.passengers.length >= this.capacity;
  }

  /**
   * Getter: Returns true if there are no passengers inside this elevator.
   */
  get isEmpty() {
    return this.passengers.length === 0;
  }

  /**
   * Getter: Returns the current passenger count.
   */
  get load() {
    return this.passengers.length;
  }

  /**
   * Resets the elevator back to Ground floor, empty, and idle.
   * Called when resetting the simulation config.
   */
  reset() {
    this.currentFloor = 0;
    this.targetFloor = null;
    this.direction = 'idle';
    this.state = 'idle';
    this.doorTimer = 0;
    this.passengers = [];
    this.destinationQueue = [];
    this.visualPosition = 0.0;
    
    // Reset performance counters
    this.totalFloorsTraversed = 0;
    this.totalStops = 0;
    this.idleTicks = 0;
  }
}

