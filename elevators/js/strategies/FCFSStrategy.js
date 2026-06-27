import { StrategyInterface } from './StrategyInterface.js';

/**
 * FCFS (First-Come, First-Served) Strategy.
 * 
 * Think of this like a traditional ticket queue (FIFO — First In, First Out).
 * The elevator serves requests strictly in the order they were made, regardless
 * of distance. If a call comes from Floor 9, and then Floor 1, it will travel to
 * Floor 9 first, then back down to Floor 1, even if it has to pass Floor 1 along the way.
 * 
 * Although it is "fair" chronologically, it is highly inefficient for elevator movement
 * and results in lots of wasted travel distance.
 */
export class FCFSStrategy extends StrategyInterface {
  get name() { return 'FCFS'; }

  getNextFloor(elevator, hallCalls, cabCalls, building) {
    // Priority 1: If there are passengers INSIDE the elevator (cab calls),
    // deliver the passenger who boarded first (at index 0).
    if (cabCalls.length > 0) {
      return cabCalls[0];
    }

    // Priority 2: If the elevator is empty, find the hall call with the earliest-spawned waiting passenger.
    if (hallCalls.length > 0) {
      let earliestPassenger = null;

      for (const call of hallCalls) {
        const floor = building.floors[call.floor];
        for (const passenger of floor.waitingPassengers) {
          // Compare spawn ticks to find the oldest request in the building
          if (earliestPassenger === null || passenger.spawnTick < earliestPassenger.spawnTick) {
            earliestPassenger = passenger;
          }
        }
      }

      if (earliestPassenger) {
        return earliestPassenger.spawnFloor; // Head to the floor of that passenger
      }
    }

    return null; // Nothing to do — stay idle
  }
}

