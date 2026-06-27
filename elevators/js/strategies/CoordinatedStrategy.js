import { StrategyInterface } from './StrategyInterface.js';

/**
 * Coordinated LOOK Strategy (Dynamic Group Control).
 * 
 * Think of this as a smart central dispatcher system. In real skyscrapers,
 * we don't want all 4 elevators rushing to the 5th floor when one person presses
 * the UP button. That would waste energy and travel distance.
 * 
 * Instead, this strategy calculates a "cost score" for every elevator car for
 * every single active hall call.
 * 
 * - The cost function factors in:
 *   1. Distance: how far the car is from the caller.
 *   2. Heading: is the car already moving towards the caller (good!) or moving away (bad!)?
 *   3. Direction: is the car moving in the same direction the caller wants to go?
 *   4. Load: is the car full (cannot board) or already carrying passengers?
 * 
 * The car with the lowest cost is dynamically "assigned" to that call.
 * Each elevator then runs the LOOK sweep strategy ONLY on its inside passengers (cab calls)
 * and its assigned hall calls.
 */
export class CoordinatedStrategy extends StrategyInterface {
  get name() { return 'Coordinated LOOK'; }

  getNextFloor(elevator, hallCalls, cabCalls, building) {
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1: For every active hall call, calculate which elevator is the best fit
    // ─────────────────────────────────────────────────────────────────────────
    const assignedHallCalls = [];

    for (const call of hallCalls) {
      let bestElevator = null;
      let minCost = Infinity;

      for (const e of building.elevators) {
        // Start with physical floor distance as our baseline cost
        let cost = Math.abs(e.currentFloor - call.floor);

        // Check if this elevator is heading towards the call's floor
        const elevatorHeadingToCall = (e.direction === 'up' && e.currentFloor <= call.floor) ||
                                      (e.direction === 'down' && e.currentFloor >= call.floor);
        const matchingDirection = (e.direction === call.direction);

        if (e.direction === 'idle') {
          // Idle cars have no penalty since they can immediately depart
        } else if (elevatorHeadingToCall && matchingDirection) {
          // Best scenario: elevator is moving towards the caller and going the same direction.
          // No extra penalty added.
        } else if (elevatorHeadingToCall && !matchingDirection) {
          // Elevator is heading towards them, but is moving in the opposite direction.
          // It must finish its sweep before serving them, so we add a penalty.
          cost += building.numFloors;
        } else {
          // Worst scenario: call is behind the elevator or it is moving away.
          // It must finish its entire trip first. High penalty.
          cost += building.numFloors * 2;
        }

        // Apply a massive penalty if the elevator is full (it cannot pick up anyone else)
        if (e.isFull) {
          cost += 1000;
        } else {
          // Small penalty based on current passenger load to spread out the work
          cost += e.load * 0.5;
        }

        // Keep track of the elevator with the lowest overall cost score
        if (cost < minCost) {
          minCost = cost;
          bestElevator = e;
        }
      }

      // If the elevator calling this function (us) was chosen as the best fit,
      // we add this call to our checklist.
      if (bestElevator && bestElevator.id === elevator.id) {
        assignedHallCalls.push(call);
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 2: Run standard LOOK sweeps on our cab calls + assigned hall calls
    // ─────────────────────────────────────────────────────────────────────────
    const hallFloors = assignedHallCalls.map(c => c.floor);
    const allTargets = [...new Set([...cabCalls, ...hallFloors])];

    if (allTargets.length === 0) return null;

    const dir = elevator.direction === 'idle' ? 'up' : elevator.direction;

    if (dir === 'up') {
      const above = allTargets
        .filter(f => f > elevator.currentFloor)
        .sort((a, b) => a - b);

      if (above.length > 0) return above[0]; // Keep sweeping UP

      // No more requests above us, reverse and sweep DOWN
      const below = allTargets
        .filter(f => f < elevator.currentFloor)
        .sort((a, b) => b - a);

      return below.length > 0 ? below[0] : null;
    }

    // If direction is DOWN
    const below = allTargets
      .filter(f => f < elevator.currentFloor)
      .sort((a, b) => b - a);

    if (below.length > 0) return below[0]; // Keep sweeping DOWN

    // No more requests below us, reverse and sweep UP
    const above = allTargets
      .filter(f => f > elevator.currentFloor)
      .sort((a, b) => a - b);

    return above.length > 0 ? above[0] : null;
  }
}

