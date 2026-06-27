import { StrategyInterface } from './StrategyInterface.js';

/**
 * SCAN Strategy (often called the "Elevator Algorithm").
 * 
 * Think of this like a street sweeper or a shuttle bus. It starts going in one
 * direction (e.g. UP), and continues going UP, picking up and dropping off
 * anyone along the way, until it has handled the furthest request in that direction.
 * Only then does it reverse direction and start sweeping DOWN, serving all requests
 * in that direction.
 * 
 * This strategy is highly predictable and prevents passenger starvation (no floor is left
 * waiting forever, because the sweep eventually reaches them).
 */
export class ScanStrategy extends StrategyInterface {
  get name() { return 'SCAN'; }

  getNextFloor(elevator, hallCalls, cabCalls, building) {
    // Collect all unique floor numbers that have an active call (either hall button or inside cab button)
    const hallFloors = hallCalls.map(c => c.floor);
    const allTargets = [...new Set([...cabCalls, ...hallFloors])];

    // If nobody needs anything, the elevator stays idle.
    if (allTargets.length === 0) return null;

    // Default direction is 'up' when we start moving from idle
    const dir = elevator.direction === 'idle' ? 'up' : elevator.direction;

    if (dir === 'up') {
      // 1. Find all target floors that are ABOVE the elevator's current position,
      // and sort them in ascending order (lowest first, e.g. Floor 3, then 5, then 8)
      const above = allTargets
        .filter(f => f > elevator.currentFloor)
        .sort((a, b) => a - b);

      if (above.length > 0) {
        return above[0]; // Head to the closest target above us
      }

      // 2. If there are no targets above us, we reverse direction and start looking BELOW us,
      // sorting descending (highest first, e.g. Floor 4, then 2, then 0)
      const below = allTargets
        .filter(f => f < elevator.currentFloor)
        .sort((a, b) => b - a);

      if (below.length > 0) {
        return below[0]; // Start sweeping down
      }

      // Edge case fallback: if target is exactly current floor
      return allTargets[0];
    }

    // If moving 'down'
    const below = allTargets
      .filter(f => f < elevator.currentFloor)
      .sort((a, b) => b - a);

    if (below.length > 0) {
      return below[0]; // Head to the closest target below us
    }

    // No targets below us, reverse direction and sweep UP
    const above = allTargets
      .filter(f => f > elevator.currentFloor)
      .sort((a, b) => a - b);

    if (above.length > 0) {
      return above[0]; // Start sweeping up
    }

    return allTargets[0];
  }
}

