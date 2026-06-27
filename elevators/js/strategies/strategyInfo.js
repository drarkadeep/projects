/**
 * Human-readable descriptions for each scheduling strategy.
 * Used by StrategyModal to explain algorithm behavior in the UI.
 */
export const STRATEGY_INFO = {
  scan: {
    key: 'scan',
    name: 'SCAN',
    alias: 'Elevator Algorithm',
    summary: 'Sweeps in one direction, servicing every request along the way, then reverses at the furthest pending floor.',
    howItWorks: [
      'Keeps moving in the current direction (up or down) and stops at each floor with a hall call or in-car destination.',
      'When no more requests remain ahead, reverses and sweeps back through requests in the opposite direction.',
      'Defaults to moving up when the elevator is idle.',
    ],
    strengths: [
      'Predictable, fair sweep pattern — no floor waits indefinitely during a pass.',
      'Good throughput in steady mixed traffic.',
      'Simple to reason about and widely used in real elevator systems.',
    ],
    tradeoffs: [
      'May travel past nearby requests to reach the furthest one in the current direction.',
      'Less efficient than LOOK when requests are clustered away from the sweep extremes.',
    ],
    bestFor: 'Balanced workloads where you want consistent, direction-based service.',
  },

  look: {
    key: 'look',
    name: 'LOOK',
    alias: 'Optimized SCAN',
    summary: 'Like SCAN, but reverses as soon as there are no more requests ahead — no empty runs to the top or bottom.',
    howItWorks: [
      'Travels in the current direction, stopping at each pending floor along the way.',
      'Reverses immediately when nothing remains in that direction — unlike SCAN, it does not continue to a physical extreme.',
      'Defaults to moving up when idle.',
    ],
    strengths: [
      'Fewer wasted floor traversals than SCAN.',
      'Still maintains a directional sweep, which limits starvation.',
      'Often the best single-elevator compromise between efficiency and fairness.',
    ],
    tradeoffs: [
      'Direction changes more often when traffic is scattered.',
      'Does not globally optimize for the nearest floor on every decision.',
    ],
    bestFor: 'Single-elevator buildings with varied traffic where movement efficiency matters.',
  },

  fcfs: {
    key: 'fcfs',
    name: 'FCFS',
    alias: 'First-Come, First-Served',
    summary: 'Serves requests strictly in arrival order — the oldest waiting passenger always gets priority.',
    howItWorks: [
      'In-car destinations (cab calls) are handled first, in the order passengers boarded.',
      'Hall calls are answered by finding the earliest-spawned waiting passenger across all floors.',
      'The elevator may reverse direction frequently to honor chronological order.',
    ],
    strengths: [
      'Strictly fair by arrival time — no passenger is permanently skipped.',
      'Easy to understand and audit.',
      'Cab-call priority keeps riders already inside from being delayed.',
    ],
    tradeoffs: [
      'Can produce long, inefficient travel paths (lots of back-and-forth).',
      'Higher average wait and transit times compared to directional algorithms.',
    ],
    bestFor: 'Scenarios where fairness by queue order matters more than movement efficiency.',
  },

  sstf: {
    key: 'sstf',
    name: 'SSTF',
    alias: 'Shortest Seek Time First',
    summary: 'Always heads to the nearest pending floor — hall call or in-car destination — regardless of direction.',
    howItWorks: [
      'Collects all pending targets (cab calls and hall calls) each tick.',
      'Picks the floor with the smallest distance from the elevator\'s current position.',
      'Repeats greedily — no commitment to a sweep direction.',
    ],
    strengths: [
      'Minimizes immediate travel distance on every decision.',
      'Strong average wait times in low-to-moderate traffic.',
      'Responsive to nearby calls.',
    ],
    tradeoffs: [
      'Distant floors can starve when closer calls keep arriving.',
      'Frequent direction reversals increase wear and feel less predictable to passengers.',
    ],
    bestFor: 'Light traffic or when minimizing the next hop distance is the top priority.',
  },

  zone: {
    key: 'zone',
    name: 'Zone',
    alias: 'Multi-Elevator Heuristic',
    summary: 'Divides the building into vertical zones — each elevator primarily serves its own slice of floors.',
    howItWorks: [
      'Splits floors evenly across elevators (e.g. E1 → floors 0–4, E2 → floors 5–9).',
      'Delivers in-car passengers first (nearest destination), then hall calls inside its zone.',
      'Helps outside its zone only when no closer elevator is available, preventing idle cars.',
      'With a single elevator, behaves like nearest-floor (SSTF) routing.',
    ],
    strengths: [
      'Scales well to multiple elevators by reducing overlap and contention.',
      'Keeps cars geographically anchored, cutting cross-building deadheading.',
      'Fallback rules prevent deadlock when all cars think another is closer.',
    ],
    tradeoffs: [
      'Zone boundaries can be suboptimal if traffic is unevenly distributed.',
      'Less effective with only one elevator (degenerates to SSTF).',
    ],
    bestFor: 'Multi-elevator buildings where geographic partitioning improves coordination.',
  },

  coordinated: {
    key: 'coordinated',
    name: 'Coordinated LOOK',
    alias: 'Dynamic Hall Call Dispatcher',
    summary: 'Dynamically assigns each hall call to the elevator that can reach it fastest, then sweeps using LOOK.',
    howItWorks: [
      'Computes a real-time service cost for each elevator relative to every active hall call.',
      'Cost factors in physical distance, moving direction, path alignment, and current passenger load.',
      'Each hall call is exclusively assigned to the elevator with the lowest calculated cost.',
      'Elevators sweep their assigned calls and cab calls using the LOOK strategy, ignoring unassigned calls.',
    ],
    strengths: [
      'Highly efficient and responsive — prevents multiple elevators from chasing the same call.',
      'Adapts dynamically to real-time elevator positions and passenger demand.',
      'Maintains LOOK directional fairness to prevent starvation.',
    ],
    tradeoffs: [
      'Higher computational overhead due to real-time path cost calculations on every tick.',
      'Requires global information about all active elevators and calls.',
    ],
    bestFor: 'Multi-elevator buildings with high, unpredictable traffic patterns where coordination is key.',
  },
};

/** Ordered list of strategy keys for navigation in the modal */
export const STRATEGY_ORDER = ['scan', 'look', 'fcfs', 'sstf', 'zone', 'coordinated'];
