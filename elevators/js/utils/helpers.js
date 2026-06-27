/**
 * Helper utility functions used across the elevator simulator.
 */

/**
 * Returns a random integer between min and max (inclusive).
 * Uses Javascript's built-in Math.random() [which produces a decimal between 0 and 1).
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamps a number to keep it within a minimum and maximum boundary.
 * Useful to prevent cars from going below the ground floor or above the roof floor.
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear Interpolation (lerp) formula: a + (b - a) * t.
 * 
 * Think of it as a smooth slider between point 'a' and point 'b'.
 * - If t = 0, we are at 'a'.
 * - If t = 1, we are at 'b'.
 * - If t = 0.5, we are exactly halfway between them.
 * 
 * The rendering system uses this to smoothly draw elevators gliding between floors,
 * rather than having them teleport instantly from one floor block to another.
 */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Formats a decimal number to a fixed amount of decimal digits.
 * E.g., formatNumber(1.2345, 2) returns the string "1.23".
 */
export function formatNumber(n, decimals = 1) {
  return n.toFixed(decimals);
}

/**
 * Helper to remove any duplicate items from an array.
 * Uses ES6 "Set" which mathematically stores only unique values.
 */
export function uniqueArray(arr) {
  return [...new Set(arr)];
}

/**
 * Seeded PRNG — Mulberry32 algorithm.
 * 
 * In standard computer science, Math.random() is "non-deterministic" — it returns a completely
 * different random number sequence every time the page loads.
 * 
 * If we want to compare SCAN vs. LOOK vs. FCFS fairly, they MUST be tested on the exact same
 * sequence of passengers. If SCAN got lucky with very few spawns and FCFS got hit by a huge rush,
 * the comparison table would be unfair!
 * 
 * A "seeded" random number generator takes a starting integer (the seed, e.g., 42) and uses
 * mathematical transformations to generate a sequence of decimals that *look* completely random,
 * but are actually 100% deterministic (reproducible). If you pass seed 42, it will produce the
 * exact same sequence of numbers every single run.
 * 
 * @param {number} seed - Integer seed value
 * @returns {() => number} - A function that acts like Math.random() but is deterministic
 */
export function createSeededRandom(seed) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

