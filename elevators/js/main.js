/**
 * main.js — Application bootstrap.
 * Creates all core instances and wires them together.
 */

import { ConfigManager } from './config.js';
import { EventBus } from './utils/EventBus.js';
import { SimulationEngine } from './engine/SimulationEngine.js';
import { UIController } from './ui/UIController.js';
import { Renderer } from './ui/Renderer.js';
import { ChartManager } from './ui/ChartManager.js';
import { StrategyModal } from './ui/StrategyModal.js';

// 1. Create shared instances
const configManager = new ConfigManager();
const eventBus = new EventBus();

// 2. Create simulation engine
const engine = new SimulationEngine(configManager, eventBus);

// 3. Create UI components
const renderer = new Renderer('simulation-canvas');
const strategyModal = new StrategyModal();
const chartManager = new ChartManager(eventBus, strategyModal);
const uiController = new UIController(configManager, engine, eventBus, renderer, chartManager, strategyModal);

// 4. Initialize everything
engine.init();
chartManager.init();
uiController.init();

// 5. Initial render
renderer.render(engine.building, 0);

// 6. Render only when simulation state changes. The old perpetual animation
// loop redrew a paused canvas 60 times per second and made long sessions and
// embedded browsers needlessly expensive.
eventBus.on('tick', ({ tick, building }) => renderer.render(building, tick));
eventBus.on('simulation-reset', () => renderer.render(engine.building, 0));
eventBus.on('simulation-complete', () => renderer.render(engine.building, engine.currentTick));
