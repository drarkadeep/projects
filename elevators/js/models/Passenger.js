/**
 * Passenger class represents a person in the simulation.
 * 
 * Think of this class as a "data card" for each person who walks into the building.
 * It tracks their entire journey: where they start, where they want to go,
 * when they arrived at the floor, when they boarded, and when they reached their destination.
 * 
 * By tracking these timestamps, we can calculate statistics like "average wait time"
 * and "transit time" which help us evaluate which elevator strategy is best!
 */
export class Passenger {
  // A static counter to assign a unique ID to every single passenger.
  // "static" means this variable belongs to the class itself, not any single passenger.
  static _nextId = 0;

  /**
   * @param {number} spawnFloor - The floor where the passenger appears (0-indexed, e.g., 0 is Ground Floor)
   * @param {number} destinationFloor - The floor the passenger wants to reach
   * @param {number} spawnTick - The simulation step/tick when this passenger was spawned
   */
  constructor(spawnFloor, destinationFloor, spawnTick) {
    this.id = Passenger._nextId++; // Assign ID and increment the counter for the next passenger
    this.spawnFloor = spawnFloor;
    this.destinationFloor = destinationFloor;
    this.spawnTick = spawnTick;     // Timestamp: Tick when the passenger appeared
    this.boardTick = null;          // Timestamp: Tick when they stepped inside an elevator (null = not boarded yet)
    this.arrivalTick = null;        // Timestamp: Tick when they reached their destination (null = still traveling)
    this.elevatorId = null;         // The ID of the elevator they are riding (null = waiting on a floor)
    this.state = 'waiting';         // Current state: 'waiting' | 'boarding' | 'riding' | 'arrived'
  }

  /**
   * Getter: Calculates how many ticks the passenger spent waiting on the floor.
   * If they haven't boarded yet, it returns null.
   */
  get waitTime() {
    return this.boardTick !== null ? this.boardTick - this.spawnTick : null;
  }

  /**
   * Getter: Calculates how many ticks the passenger spent riding inside the elevator.
   * If they haven't arrived yet, it returns null.
   */
  get transitTime() {
    return this.arrivalTick !== null ? this.arrivalTick - this.boardTick : null;
  }

  /**
   * Getter: Calculates the total time from spawning to arrival (waiting + transit).
   * If they haven't arrived yet, it returns null.
   */
  get totalTime() {
    return this.arrivalTick !== null ? this.arrivalTick - this.spawnTick : null;
  }

  /**
   * Getter: Tells us if the passenger is going UP or DOWN.
   * We compare the destination floor to the spawn floor to figure this out.
   */
  get direction() {
    return this.destinationFloor > this.spawnFloor ? 'up' : 'down';
  }

  /**
   * Helper function to reset the ID counter back to 0.
   * We call this whenever we restart or reset the simulation.
   */
  static resetIdCounter() {
    Passenger._nextId = 0;
  }
}

