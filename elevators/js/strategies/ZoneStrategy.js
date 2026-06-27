import { StrategyInterface } from './StrategyInterface.js';

/**
 * Zone Strategy.
 * 
 * Think of this like dividing a school building or office tower into sections,
 * and assigning a specific elevator car to serve only that section.
 * E.g., Elevator 1 handles Floors 0–4, while Elevator 2 handles Floors 5–9.
 * 
 * - Strength: Great for buildings with multiple elevators because it divides the work
 *   and prevents cars from clumping together or trying to answer the same far-away calls.
 * - Rules:
 *   1. Deliver inside passengers (cab calls) first.
 *   2. Answer hall calls that are within this elevator's designated floor range.
 *   3. If idle, help out other zones, but only if no other elevator is closer.
 */
export class ZoneStrategy extends StrategyInterface {
  get name() { return 'Zone'; }

  getNextFloor(elevator, hallCalls, cabCalls, building) {
    const numElevators = building.elevators.length;
    const numFloors = building.numFloors;

    // Calculate the size of each zone and this car's floor boundary
    const zoneSize = Math.ceil(numFloors / numElevators);
    const zoneStart = elevator.id * zoneSize;
    const zoneEnd = Math.min(zoneStart + zoneSize - 1, numFloors - 1);

    // Priority 1: Drop off passengers already inside this car (closest first)
    if (cabCalls.length > 0) {
      return this._closestFloor(elevator.currentFloor, cabCalls);
    }

    // Priority 2: Answer hall calls originating INSIDE this car's primary zone
    const zoneCalls = hallCalls.filter(
      c => c.floor >= zoneStart && c.floor <= zoneEnd
    );
    if (zoneCalls.length > 0) {
      return this._closestFloor(
        elevator.currentFloor,
        zoneCalls.map(c => c.floor)
      );
    }

    // Priority 3: Help with calls outside our zone, but only if we are the closest elevator.
    if (hallCalls.length > 0) {
      const unclaimedFloors = hallCalls
        .filter(call => {
          for (const other of building.elevators) {
            if (other.id === elevator.id) continue;
            // If another elevator is physically closer to the call than us, let them handle it.
            if (
              Math.abs(other.currentFloor - call.floor) <
              Math.abs(elevator.currentFloor - call.floor)
            ) {
              return false;
            }
          }
          return true; // We are the closest car to this call
        })
        .map(c => c.floor);

      if (unclaimedFloors.length > 0) {
        return this._closestFloor(elevator.currentFloor, unclaimedFloors);
      }

      // Fallback: Answer ANY active call.
      // This prevents a deadlock where all cars think another is closer, so they all wait.
      return this._closestFloor(
        elevator.currentFloor,
        hallCalls.map(c => c.floor)
      );
    }

    return null; // Idle
  }

  /**
   * Helper function: Finds the floor number in the array that is closest to our position.
   */
  _closestFloor(current, floors) {
    return floors.reduce((best, f) =>
      Math.abs(f - current) < Math.abs(best - current) ? f : best
    );
  }
}

