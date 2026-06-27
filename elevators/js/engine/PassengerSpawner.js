import { Passenger } from '../models/Passenger.js';

/**
 * PassengerSpawner class generates new passengers in our simulation.
 * 
 * In real buildings, traffic isn't completely random. We have rush hours:
 * - In the morning, everyone spawns on the Ground Floor and wants to go up to their offices.
 * - In the evening, everyone spawns on their office floors and wants to go down to the Ground Floor to leave.
 * - In the middle of the day, traffic is more evenly distributed.
 * 
 * This class calculates the chance of someone appearing on a floor, and if they do,
 * picks their destination floor based on the chosen distribution profile (Uniform, Poisson, Peak).
 */
export class PassengerSpawner {
  /**
   * @param {import('../models/Building.js').Building} building - The building reference to spawn passengers in
   * @param {object} config - Configuration object (tells us spawnRate and spawnDistribution)
   * @param {import('../utils/EventBus.js').EventBus} eventBus - Bus to emit spawn events so the UI updates
   * @param {Passenger[]} allPassengers - Reference to the simulation's master tracking list
   * @param {() => number} randomFn - A random number generator function (defaults to Math.random, customizable for seeded batch runs)
   */
  constructor(building, config, eventBus, allPassengers, randomFn = Math.random) {
    this.building = building;
    this.config = config;
    this.eventBus = eventBus;
    this.allPassengers = allPassengers;
    this.random = randomFn;
  }

  /**
   * Main entry point called on every tick (step) of the simulation.
   * We iterate through each floor and roll a "virtual dice" to see if a passenger appears.
   * @param {number} currentTick - The current step counter
   */
  spawnPassengers(currentTick) {
    for (const floor of this.building.floors) {
      // Step A: Calculate the mathematical probability of spawning a passenger on this specific floor
      const probability = this._calculateSpawnProbability(floor, currentTick);
      
      // Step B: Roll the dice! If our random decimal [0, 1) is less than the probability, we spawn a passenger.
      // E.g., if probability is 0.1, we have a 10% chance of spawning one.
      if (this.random() < probability) {
        // Step C: Pick where this passenger wants to go
        const destFloor = this._pickDestination(floor.floorNumber, currentTick);
        if (destFloor === null) continue; // Skip if no valid floor could be chosen

        // Step D: Create the Passenger object and register it
        const passenger = new Passenger(floor.floorNumber, destFloor, currentTick);
        floor.addPassenger(passenger);             // Place them on their starting floor queue
        this.allPassengers.push(passenger);        // Add them to the global analytics list
        
        // Notify the rest of the application (like the renderer or sound) that a passenger has spawned
        this.eventBus.emit('passenger-spawned', { passenger, floor });
      }
    }
  }

  /**
   * Clamp probability helper. Ensures our calculated rate is a valid probability between 0 and 1.
   */
  _floorSpawnProbability(floorRate) {
    return Math.min(floorRate, 1.0);
  }

  /**
   * Calculate a baseline per-floor spawn rate.
   * If building-wide we expect 0.3 passengers per tick, and there are 10 floors,
   * the base per-floor rate is 0.3 / 10 = 0.03 passengers per tick.
   */
  _perFloorRate(multiplier = 1) {
    const numFloors = Math.max(1, this.config.numFloors);
    return (this.config.spawnRate / numFloors) * multiplier;
  }

  /**
   * Computes the spawn probability based on the selected pattern.
   */
  _calculateSpawnProbability(floor, tick) {
    const dist = this.config.spawnDistribution;

    switch (dist) {
      case 'uniform':
        // Standard distribution: every floor has an equal, constant chance of spawning a passenger.
        return this._floorSpawnProbability(this._perFloorRate());

      case 'poisson': {
        // Poisson distribution models events that happen independently at a constant average rate.
        // It provides a more natural, clumpy arrival pattern than pure uniform chance.
        // Probability of at least 1 passenger spawning = 1 - e^(-lambda)
        const lambda = this._perFloorRate();
        return this._floorSpawnProbability(1 - Math.exp(-lambda));
      }

      case 'morning-peak':
        // Simulate a morning rush hour (from tick 0 to 500)
        if (tick <= 500) {
          // Ground floor (0) gets 3x the normal spawn rate because people are arriving at work.
          if (floor.floorNumber === 0) {
            return this._floorSpawnProbability(this._perFloorRate(3));
          }
          // Upper office floors have very little spawn activity (0.2x rate)
          return this._floorSpawnProbability(this._perFloorRate(0.2));
        }
        // After tick 500, revert back to normal uniform rates.
        return this._floorSpawnProbability(this._perFloorRate());

      case 'evening-peak':
        // Simulate an evening rush hour (from tick 0 to 500)
        if (tick <= 500) {
          // Upper floors get 3x the normal rate because people are leaving their desks.
          if (floor.floorNumber > 0) {
            return this._floorSpawnProbability(this._perFloorRate(3));
          }
          // Ground floor has almost no spawn activity (0.2x rate)
          return this._floorSpawnProbability(this._perFloorRate(0.2));
        }
        // After tick 500, revert back to normal uniform rates.
        return this._floorSpawnProbability(this._perFloorRate());

      default:
        return this._floorSpawnProbability(this._perFloorRate());
    }
  }

  /**
   * Decide which floor a spawning passenger wants to travel to.
   */
  _pickDestination(currentFloor, tick) {
    const numFloors = this.config.numFloors;
    if (numFloors <= 1) return null;

    const dist = this.config.spawnDistribution;

    // Evening-peak logic: passengers on upper floors are heading home, so they all go to the Ground floor (0).
    if (dist === 'evening-peak' && tick <= 500 && currentFloor > 0) {
      return 0;
    }

    // Morning-peak logic: passengers spawning on the Ground floor are heading to work.
    // They are biased towards higher floors in the building.
    if (dist === 'morning-peak' && tick <= 500 && currentFloor === 0) {
      // Weighted Random Selection:
      // We give the top half of the building 3x the weight of the lower half,
      // representing a rush to high-rise corporate offices.
      const midFloor = Math.floor(numFloors / 2);
      const weights = [];
      let totalWeight = 0;

      for (let f = 0; f < numFloors; f++) {
        if (f === currentFloor) {
          weights.push(0); // A passenger cannot go to the floor they are already on!
          continue;
        }
        const w = f >= midFloor ? 3 : 1;
        weights.push(w);
        totalWeight += w;
      }

      // Pick a random number between 0 and the sum of all weights
      let r = this.random() * totalWeight;
      for (let f = 0; f < numFloors; f++) {
        r -= weights[f];
        if (r <= 0) return f;
      }
      return numFloors - 1; // Fallback
    }

    // Default: completely random floor (other than the current floor).
    let dest;
    do {
      dest = Math.floor(this.random() * numFloors);
    } while (dest === currentFloor);
    return dest;
  }
}
