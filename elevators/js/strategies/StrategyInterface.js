/**
 * StrategyInterface — base class for elevator scheduling strategies.
 * All strategies must extend this and implement getNextFloor().
 */
export class StrategyInterface {
  /**
   * Determine the next floor an elevator should move to.
   *
   * @param {import('../models/Elevator.js').Elevator} elevator - The elevator requesting a decision
   * @param {Array<{floor: number, direction: string}>} hallCalls - Pending hall calls
   * @param {number[]} cabCalls - Destination floors of passengers inside the elevator
   * @param {import('../models/Building.js').Building} building - Full building state
   * @returns {number|null} - Next floor to go to, or null to idle
   */
  getNextFloor(elevator, hallCalls, cabCalls, building) {
    throw new Error('Strategy.getNextFloor() must be implemented by subclass');
  }

  /** Human-readable name of this strategy */
  get name() {
    throw new Error('Strategy.name must be implemented by subclass');
  }
}
