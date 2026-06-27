import { Floor } from './Floor.js';
import { Elevator } from './Elevator.js';

/**
 * Building class represents the overall simulation container.
 * 
 * Think of it as the parent "world" object that instantiates and links
 * all the Floor objects and Elevator objects together based on configuration.
 */
export class Building {
  /**
   * @param {object} config - Simulation configuration settings
   * @param {number} config.numFloors - How many floors are in the building
   * @param {number} config.elevatorCount - Number of elevator cars active
   * @param {number} config.elevatorCapacity - Capacity of each elevator car
   * @param {number} config.elevatorSpeed - Speed of the elevators
   * @param {number} config.doorDuration - Door open time
   */
  constructor(config) {
    this.numFloors = config.numFloors;

    // Create the floors list
    this.floors = [];
    for (let i = 0; i < config.numFloors; i++) {
      // Create a Floor object for each level. We use 0-indexed values
      // (Floor 0 is ground floor, Floor 9 is the tenth floor, etc.)
      this.floors.push(new Floor(i));
    }

    // Create the elevators list
    this.elevators = [];
    for (let i = 0; i < config.elevatorCount; i++) {
      // Initialize each elevator car, passing configuration parameters
      this.elevators.push(new Elevator(
        i, // id (0, 1, 2...)
        config.elevatorCapacity,
        config.elevatorSpeed,
        config.doorDuration,
        config.numFloors
      ));
    }
  }

  /**
   * Checks all floors and gathers active hall requests.
   * A "hall call" is when a passenger stands in the lobby/hall and presses the UP or DOWN button.
   * 
   * @returns {Array<{floor: number, direction: string}>} List of active hall calls
   */
  getHallCalls() {
    const calls = [];
    for (const f of this.floors) {
      if (f.upCallActive) {
        calls.push({ floor: f.floorNumber, direction: 'up' });
      }
      if (f.downCallActive) {
        calls.push({ floor: f.floorNumber, direction: 'down' });
      }
    }
    return calls;
  }
}

