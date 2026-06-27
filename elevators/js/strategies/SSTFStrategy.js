import { StrategyInterface } from './StrategyInterface.js';

/**
 * SSTF (Shortest Seek Time First) Strategy.
 * 
 * Think of this like a greedy taxi driver. The elevator constantly scans all requests
 * (both passengers inside and people waiting in halls) and always chooses to go to
 * the floor closest to its current position, ignoring direction.
 * 
 * E.g., if the elevator is on Floor 4, and there are requests on Floor 5 and Floor 9,
 * it will choose Floor 5 because the distance is only 1 floor (distance 1 < distance 5).
 * 
 * - Strength: Excellent average wait times in light traffic because it's always responsive.
 * - Weakness: "Passenger Starvation". If the elevator stays busy shuttling people between Floors 1 and 3,
 *   a call from Floor 10 might be ignored indefinitely (starved) because there is always a closer call.
 */
export class SSTFStrategy extends StrategyInterface {
  get name() { return 'SSTF'; }

  getNextFloor(elevator, hallCalls, cabCalls, building) {
    const hallFloors = hallCalls.map(c => c.floor);
    // Combine all unique target floors
    const allTargets = [...new Set([...cabCalls, ...hallFloors])];

    if (allTargets.length === 0) return null;

    // Find the floor with the minimum absolute distance from our current position
    let closest = null;
    let minDist = Infinity;

    for (const floor of allTargets) {
      const dist = Math.abs(floor - elevator.currentFloor);
      if (dist < minDist) {
        minDist = dist;
        closest = floor;
      }
    }

    return closest;
  }
}

