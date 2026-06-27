/**
 * Default simulation configuration and ConfigManager.
 */

export const DEFAULTS = {
  numFloors: 10,                    // 2..50
  elevatorCount: 1,                 // 1..12
  elevatorCapacity: 8,              // 1..20
  elevatorSpeed: 1,                 // floors per tick: 1, 2, 3, 4 (integers only)
  doorDuration: 3,                  // ticks the door stays open
  spawnRate: 0.3,                   // expected new passengers per tick across the whole building
  spawnDistribution: 'uniform',     // 'uniform' | 'poisson' | 'morning-peak' | 'evening-peak'
  strategy: 'scan',                 // 'fcfs' | 'scan' | 'look' | 'sstf' | 'zone' | 'coordinated'
  simulationMode: 'interactive',    // 'interactive' | 'batch'
  batchTicks: 2000,                 // total ticks for batch mode
  interactiveSpeed: 200,            // ms per tick in interactive mode
};

/**
 * ConfigManager — manages current configuration with defaults.
 */
export class ConfigManager {
  constructor() {
    this.current = { ...DEFAULTS };
  }

  update(key, value) {
    this.current[key] = value;
  }

  reset() {
    this.current = { ...DEFAULTS };
  }

  get(key) {
    return this.current[key];
  }

  getAll() {
    return { ...this.current };
  }
}
