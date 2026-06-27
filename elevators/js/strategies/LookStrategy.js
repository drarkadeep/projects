import { StrategyInterface } from './StrategyInterface.js';

/**
 * LOOK Strategy (Optimized SCAN).
 * 
 * Think of this like a smart shuttle bus. Like SCAN, it moves in one direction
 * (e.g. UP) serving all requests. However, unlike SCAN, which travels all the
 * way to the top floor of the building before reversing, LOOK reverses immediately
 * when it sees that there are no more requests remaining ahead of it in the current direction.
 * 
 * This cuts down on empty runs to the physical limits of the building, saving time
 * and travel distance.
 */
export class LookStrategy extends StrategyInterface {
  get name() { return 'LOOK'; }

  getNextFloor(elevator, hallCalls, cabCalls, building) {
    // Unique list of all requested floors (hall buttons and passengers inside)
    const hallFloors = hallCalls.map(c => c.floor);
    const allTargets = [...new Set([...cabCalls, ...hallFloors])];

    if (allTargets.length === 0) return null;

    // Use current direction or default to UP
    const dir = elevator.direction === 'idle' ? 'up' : elevator.direction;

    if (dir === 'up') {
      // 1. Gather all targets ABOVE the elevator and sort ascending
      const above = allTargets
        .filter(f => f > elevator.currentFloor)
        .sort((a, b) => a - b);

      if (above.length > 0) return above[0]; // Continue moving UP

      // 2. If no more targets above, reverse and find highest target BELOW us
      const below = allTargets
        .filter(f => f < elevator.currentFloor)
        .sort((a, b) => b - a);

      return below.length > 0 ? below[0] : null; // Head DOWN
    }

    // If moving 'down'
    const below = allTargets
      .filter(f => f < elevator.currentFloor)
      .sort((a, b) => b - a);

    if (below.length > 0) return below[0]; // Continue moving DOWN

    // If no more targets below, reverse and find lowest target ABOVE us
    const above = allTargets
      .filter(f => f > elevator.currentFloor)
      .sort((a, b) => a - b);

    return above.length > 0 ? above[0] : null; // Head UP
  }
}

