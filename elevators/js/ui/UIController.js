import { formatNumber } from '../utils/helpers.js';
import { STRATEGY_INFO, STRATEGY_ORDER } from '../strategies/strategyInfo.js';

/**
 * UIController — wires all DOM elements to the simulation engine and renderer.
 * Handles: slider/select binding, button controls, stat updates, mode switching.
 */
export class UIController {
  /**
   * @param {import('../config.js').ConfigManager} configManager
   * @param {import('../engine/SimulationEngine.js').SimulationEngine} engine
   * @param {import('../utils/EventBus.js').EventBus} eventBus
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {import('./ChartManager.js').ChartManager} chartManager
   * @param {import('./StrategyModal.js').StrategyModal} strategyModal
   */
  constructor(configManager, engine, eventBus, renderer, chartManager, strategyModal) {
    this.config = configManager;
    this.engine = engine;
    this.eventBus = eventBus;
    this.renderer = renderer;
    this.chartManager = chartManager;
    this.strategyModal = strategyModal;
  }

  /** Initialize all UI bindings */
  init() {
    this._bindSliders();
    this._bindSelects();
    this._bindStrategyInfo();
    this._bindButtons();
    this._bindModeSwitch();
    this._bindEventBus();
    this._updateElevatorCards();
    this._syncPlaybackButtons();
  }

  // ─── Slider Bindings ────────────────────────────────────────

  _bindSliders() {
    const sliders = [
      { id: 'slider-floors', valueId: 'value-floors', key: 'numFloors', parse: parseInt },
      { id: 'slider-elevators', valueId: 'value-elevators', key: 'elevatorCount', parse: parseInt },
      { id: 'slider-capacity', valueId: 'value-capacity', key: 'elevatorCapacity', parse: parseInt },
      { id: 'slider-speed', valueId: 'value-speed', key: 'elevatorSpeed', parse: parseInt },
      { id: 'slider-door', valueId: 'value-door', key: 'doorDuration', parse: parseInt },
      { id: 'slider-spawn-rate', valueId: 'value-spawn-rate', key: 'spawnRate', parse: parseFloat, format: v => v.toFixed(2) },
      { id: 'slider-batch-ticks', valueId: 'value-batch-ticks', key: 'batchTicks', parse: parseInt },
      { id: 'slider-sim-speed', valueId: 'value-sim-speed', key: 'interactiveSpeed', parse: parseInt },
    ];

    for (const slider of sliders) {
      const input = document.getElementById(slider.id);
      const display = document.getElementById(slider.valueId);
      if (!input || !display) continue;

      input.addEventListener('input', () => {
        const val = slider.parse(input.value);
        this.config.update(slider.key, val);
        display.textContent = slider.format ? slider.format(val) : val;
      });

      // These values are captured by the building/spawner at initialization.
      // Rebuild after the user finishes adjusting the control so the visible
      // simulation always matches the displayed configuration.
      if (!['batchTicks', 'interactiveSpeed'].includes(slider.key)) {
        input.addEventListener('change', () => this._restartForConfiguration());
      }
    }
  }

  // ─── Select Bindings ────────────────────────────────────────

  _bindSelects() {
    // Distribution
    const distSelect = document.getElementById('select-distribution');
    distSelect.addEventListener('change', () => {
      this.config.update('spawnDistribution', distSelect.value);
      this._restartForConfiguration();
    });

    // Strategy
    const stratSelect = document.getElementById('select-strategy');
    stratSelect.addEventListener('change', () => {
      this.engine.setStrategy(stratSelect.value);
      this._syncStrategyLinks(stratSelect.value);
    });
  }

  _bindStrategyInfo() {
    const stratSelect = document.getElementById('select-strategy');
    const infoBtn = document.getElementById('btn-strategy-info');
    const linksContainer = document.getElementById('strategy-links');

    infoBtn.addEventListener('click', () => {
      this.strategyModal.open(stratSelect.value);
    });

    linksContainer.innerHTML = STRATEGY_ORDER.map((key) => {
      const info = STRATEGY_INFO[key];
      return `<button type="button" class="strategy-link" data-strategy="${key}">${info.name}</button>`;
    }).join('');

    linksContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-strategy]');
      if (!btn) return;
      this.strategyModal.open(btn.dataset.strategy);
    });

    this._syncStrategyLinks(stratSelect.value);
  }

  _syncStrategyLinks(activeKey) {
    document.querySelectorAll('.strategy-link').forEach((btn) => {
      btn.classList.toggle('strategy-link-active', btn.dataset.strategy === activeKey);
    });
  }

  // ─── Button Bindings ────────────────────────────────────────

  _bindButtons() {
    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');
    const btnStep = document.getElementById('btn-step');
    const btnReset = document.getElementById('btn-reset');
    const btnBatchCompare = document.getElementById('btn-batch-compare');

    btnPlay.addEventListener('click', () => {
      if (this.engine.isPaused) {
        this.engine.resume();
      } else {
        this.engine.start();
      }
      this._syncPlaybackButtons();
    });

    btnPause.addEventListener('click', () => {
      this.engine.pause();
      this._syncPlaybackButtons();
    });

    btnStep.addEventListener('click', () => {
      this.engine.step();
      this._syncPlaybackButtons();
    });

    btnReset.addEventListener('click', () => {
      this._restartForConfiguration();
    });

    btnBatchCompare.addEventListener('click', () => {
      btnBatchCompare.disabled = true;
      btnBatchCompare.textContent = '⏳ Running...';

      // Use setTimeout to let the UI update before the sync batch runs
      setTimeout(async () => {
        try {
          const results = await this.engine.runBatchComparison();
          this.chartManager.showComparison(results);
        } finally {
          btnBatchCompare.disabled = false;
          btnBatchCompare.textContent = '🔬 Compare All Strategies';
        }
      }, 50);
    });
  }

  // ─── Mode Switch ────────────────────────────────────────────

  _bindModeSwitch() {
    const modeSelect = document.getElementById('select-mode');
    const batchTicksGroup = document.getElementById('batch-ticks-group');
    const interactiveSpeedGroup = document.getElementById('interactive-speed-group');
    const batchControls = document.getElementById('batch-controls');

    const updateMode = () => {
      const mode = modeSelect.value;
      this.config.update('simulationMode', mode);

      if (mode === 'batch') {
        batchTicksGroup.style.display = '';
        interactiveSpeedGroup.style.display = 'none';
        batchControls.style.display = '';
      } else {
        batchTicksGroup.style.display = 'none';
        interactiveSpeedGroup.style.display = '';
        batchControls.style.display = 'none';
      }
    };

    modeSelect.addEventListener('change', () => {
      updateMode();
      this._restartForConfiguration();
    });
    updateMode(); // Set initial state
  }

  // ─── EventBus Listeners ─────────────────────────────────────

  _bindEventBus() {
    this.eventBus.on('tick', ({ tick, metrics }) => {
      this._updateStats(metrics);
      this._updateElevatorCards();
      this.chartManager.update(metrics);
      document.getElementById('tick-counter').textContent = tick;
    });

    this.eventBus.on('simulation-complete', ({ metrics }) => {
      this._updateStats(metrics);
      this._syncPlaybackButtons();
    });

    this.eventBus.on('simulation-reset', () => {
      document.getElementById('tick-counter').textContent = '0';
    });
  }

  // ─── Stats Updates ──────────────────────────────────────────

  _updateStats(metrics) {
    document.getElementById('stat-avg-wait').textContent = formatNumber(metrics.avgWaitTime);
    document.getElementById('stat-max-wait').textContent = metrics.maxWaitTime;
    document.getElementById('stat-avg-transit').textContent = formatNumber(metrics.avgTransitTime);
    document.getElementById('stat-total-passengers').textContent = metrics.totalPassengers;
    document.getElementById('stat-waiting').textContent = metrics.waitingCount;
    document.getElementById('stat-delivered').textContent = metrics.arrivedCount;
    document.getElementById('stat-total-distance').textContent = formatNumber(metrics.totalDistance, 0);
    document.getElementById('stat-distance-per-spawn').textContent = formatNumber(metrics.distancePerSpawn, 2);
  }

  _resetStats() {
    document.getElementById('stat-avg-wait').textContent = '0.0';
    document.getElementById('stat-max-wait').textContent = '0';
    document.getElementById('stat-avg-transit').textContent = '0.0';
    document.getElementById('stat-total-passengers').textContent = '0';
    document.getElementById('stat-waiting').textContent = '0';
    document.getElementById('stat-delivered').textContent = '0';
    document.getElementById('stat-total-distance').textContent = '0';
    document.getElementById('stat-distance-per-spawn').textContent = '0.00';
    document.getElementById('tick-counter').textContent = '0';
  }

  /** Reinitialize state after a configuration change or explicit reset. */
  _restartForConfiguration() {
    this.engine.reset();
    this.renderer.resetVisuals();
    this.renderer.render(this.engine.building, this.engine.currentTick);
    this.chartManager.reset();
    this._resetStats();
    this._updateElevatorCards();
    this._syncPlaybackButtons();
  }

  /** Keep playback controls consistent across interactive and batch runs. */
  _syncPlaybackButtons() {
    const activelyRunning = this.engine.isRunning && !this.engine.isPaused;
    const isBatch = this.config.get('simulationMode') === 'batch';

    document.getElementById('btn-play').disabled = activelyRunning;
    document.getElementById('btn-pause').disabled = !activelyRunning || isBatch;
    document.getElementById('btn-step').disabled = activelyRunning;
  }

  // ─── Elevator Status Cards ──────────────────────────────────

  _updateElevatorCards() {
    const container = document.getElementById('elevator-status-cards');
    if (!this.engine.building) {
      container.innerHTML = '';
      return;
    }

    const elevators = this.engine.building.elevators;
    let html = '';

    for (const e of elevators) {
      const stateClass = e.state.replace(/[- ]/g, '-');
      const dirIcon = e.direction === 'up' ? '▲' : e.direction === 'down' ? '▼' : '●';
      const dirLabel = e.direction === 'idle' ? 'Idle' : e.direction.toUpperCase();

      html += `
        <div class="elevator-card">
          <div class="elevator-card-info">
            <div class="elevator-card-title">Elevator ${e.id + 1}</div>
            <div class="elevator-card-detail">
              Floor ${e.currentFloor} ${dirIcon} · ${e.load}/${e.capacity} pax
            </div>
          </div>
          <span class="badge badge-${stateClass}">${e.state}</span>
        </div>`;
    }

    container.innerHTML = html;
  }
}
