/**
 * Floor class represents a single floor in our building.
 * 
 * Think of it as a waiting room. It maintains a list of passengers who are
 * currently waiting on this floor. It also keeps track of whether the "UP"
 * or "DOWN" request buttons (hall calls) on the wall are illuminated.
 */
export class Floor {
  /**
   * @param {number} floorNumber - The index of this floor (e.g. 0 for Ground, 1 for 1st Floor, etc.)
   */
  constructor(floorNumber) {
    this.floorNumber = floorNumber;
    this.waitingPassengers = [];  // List of Passenger objects waiting on this floor
    this.upCallActive = false;    // Is the 'UP' arrow button on the wall pressed/lit?
    this.downCallActive = false;  // Is the 'DOWN' arrow button on the wall pressed/lit?
  }

  /**
   * Adds a new passenger to this floor's waiting room queue.
   * When they arrive, we automatically press the corresponding UP/DOWN button on the wall.
   * @param {import('./Passenger.js').Passenger} passenger
   */
  addPassenger(passenger) {
    this.waitingPassengers.push(passenger);
    if (passenger.direction === 'up') this.upCallActive = true;
    if (passenger.direction === 'down') this.downCallActive = true;
  }

  /**
   * Removes a passenger from the queue. This is called when they successfully
   * step inside an elevator car. We then recalculate if the wall buttons should stay lit.
   * @param {number} passengerId
   */
  removePassenger(passengerId) {
    this.waitingPassengers = this.waitingPassengers.filter(p => p.id !== passengerId);
    this._recalcCalls();
  }

  /**
   * Recalculates the wall light states.
   * E.g. if the 'UP' button was lit, but the last person going UP just boarded,
   * we turn off the 'UP' light since nobody else on this floor wants to go UP.
   * 
   * "some()" checks if at least one item in the array meets the condition.
   */
  _recalcCalls() {
    this.upCallActive = this.waitingPassengers.some(p => p.direction === 'up');
    this.downCallActive = this.waitingPassengers.some(p => p.direction === 'down');
  }

  /**
   * Clears the waiting room. Useful when resetting the simulation back to clean state.
   */
  clear() {
    this.waitingPassengers = [];
    this.upCallActive = false;
    this.downCallActive = false;
  }
}

