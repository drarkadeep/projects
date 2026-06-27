/**
 * ChartManager — creates and updates Chart.js charts for analytics.
 * Manages: wait-time line chart, passengers line chart, strategy comparison bar chart.
 */
export class ChartManager {
  /**
   * @param {import('../utils/EventBus.js').EventBus} eventBus
   * @param {import('./StrategyModal.js').StrategyModal} strategyModal
   */
  constructor(eventBus, strategyModal) {
    this.eventBus = eventBus;
    this.strategyModal = strategyModal;
    this.waitTimeChart = null;
    this.passengersChart = null;
    this.comparisonChart = null;

    // Data buffers (sample every N ticks to avoid chart lag)
    this.sampleInterval = 5;
    this._waitTimeData = { labels: [], avgWait: [], maxWait: [] };
    this._passengerData = { labels: [], waiting: [], riding: [], arrived: [] };

    // Common chart styling
    this._chartColors = {
      grid: 'hsla(220, 10%, 65%, 0.08)',
      tick: 'hsl(220, 10%, 55%)',
      legendText: 'hsl(0, 0%, 85%)',
      cyan: 'hsl(185, 80%, 55%)',
      blue: 'hsl(215, 90%, 60%)',
      purple: 'hsl(265, 75%, 65%)',
      green: 'hsl(155, 70%, 50%)',
      amber: 'hsl(40, 90%, 60%)',
      red: 'hsl(0, 75%, 60%)',
      pink: 'hsl(330, 80%, 65%)',
    };
  }

  /** Initialize all charts */
  init() {
    this._createWaitTimeChart();
    this._createPassengersChart();
  }

  /**
   * Update charts with new metrics (called each tick from UIController).
   * @param {object} metrics - from SimulationEngine.getMetrics()
   */
  update(metrics) {
    if (metrics.currentTick % this.sampleInterval !== 0) return;

    const label = metrics.currentTick;

    // Wait time chart
    this._waitTimeData.labels.push(label);
    this._waitTimeData.avgWait.push(metrics.avgWaitTime);
    this._waitTimeData.maxWait.push(metrics.maxWaitTime);

    // Keep last 200 data points for performance
    if (this._waitTimeData.labels.length > 200) {
      this._waitTimeData.labels.shift();
      this._waitTimeData.avgWait.shift();
      this._waitTimeData.maxWait.shift();
    }

    this.waitTimeChart.data.labels = this._waitTimeData.labels;
    this.waitTimeChart.data.datasets[0].data = this._waitTimeData.avgWait;
    this.waitTimeChart.data.datasets[1].data = this._waitTimeData.maxWait;
    this.waitTimeChart.update('none'); // Skip animation for perf

    // Passengers chart
    this._passengerData.labels.push(label);
    this._passengerData.waiting.push(metrics.waitingCount);
    this._passengerData.riding.push(metrics.ridingCount);
    this._passengerData.arrived.push(metrics.arrivedCount);

    if (this._passengerData.labels.length > 200) {
      this._passengerData.labels.shift();
      this._passengerData.waiting.shift();
      this._passengerData.riding.shift();
      this._passengerData.arrived.shift();
    }

    this.passengersChart.data.labels = this._passengerData.labels;
    this.passengersChart.data.datasets[0].data = this._passengerData.waiting;
    this.passengersChart.data.datasets[1].data = this._passengerData.riding;
    this.passengersChart.data.datasets[2].data = this._passengerData.arrived;
    this.passengersChart.update('none');
  }

  /** Reset chart data */
  reset() {
    this._waitTimeData = { labels: [], avgWait: [], maxWait: [] };
    this._passengerData = { labels: [], waiting: [], riding: [], arrived: [] };

    if (this.waitTimeChart) {
      this.waitTimeChart.data.labels = [];
      this.waitTimeChart.data.datasets.forEach(d => d.data = []);
      this.waitTimeChart.update('none');
    }

    if (this.passengersChart) {
      this.passengersChart.data.labels = [];
      this.passengersChart.data.datasets.forEach(d => d.data = []);
      this.passengersChart.update('none');
    }
  }

  /**
   * Display batch comparison results.
   * @param {Object<string, object>} results - Map of strategy name → metrics
   */
  showComparison(results) {
    const section = document.getElementById('batch-comparison-section');
    section.style.display = '';

    const strategyNames = Object.keys(results);
    const labels = strategyNames.map(n => n.toUpperCase());

    const avgWaits = strategyNames.map(n => results[n].avgWaitTime);
    const maxWaits = strategyNames.map(n => results[n].maxWaitTime);
    const avgTransits = strategyNames.map(n => results[n].avgTransitTime);

    // Destroy previous chart if exists
    if (this.comparisonChart) {
      this.comparisonChart.destroy();
    }

    const canvas = document.getElementById('chart-comparison');
    this.comparisonChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Avg Wait',
            data: avgWaits,
            backgroundColor: this._chartColors.amber + '99',
            borderColor: this._chartColors.amber,
            borderWidth: 1,
          },
          {
            label: 'Max Wait',
            data: maxWaits,
            backgroundColor: this._chartColors.red + '99',
            borderColor: this._chartColors.red,
            borderWidth: 1,
          },
          {
            label: 'Avg Transit',
            data: avgTransits,
            backgroundColor: this._chartColors.purple + '99',
            borderColor: this._chartColors.purple,
            borderWidth: 1,
          },
        ],
      },
      options: {
        ...this._commonOptions(),
        plugins: {
          ...this._commonOptions().plugins,
          title: {
            display: false,
          },
        },
      },
    });

    // Build comparison table
    this._buildComparisonTable(results);
  }

  // ─── Private ────────────────────────────────────────────────

  _createWaitTimeChart() {
    const canvas = document.getElementById('chart-wait-time');
    this.waitTimeChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Avg Wait',
            data: [],
            borderColor: this._chartColors.amber,
            backgroundColor: this._chartColors.amber + '20',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 1.5,
          },
          {
            label: 'Max Wait',
            data: [],
            borderColor: this._chartColors.red,
            backgroundColor: 'transparent',
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 1,
            borderDash: [4, 2],
          },
        ],
      },
      options: this._commonOptions(),
    });
  }

  _createPassengersChart() {
    const canvas = document.getElementById('chart-passengers');
    this.passengersChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Waiting',
            data: [],
            borderColor: this._chartColors.amber,
            backgroundColor: this._chartColors.amber + '15',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 1.5,
          },
          {
            label: 'Riding',
            data: [],
            borderColor: this._chartColors.purple,
            backgroundColor: this._chartColors.purple + '15',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 1.5,
          },
          {
            label: 'Arrived',
            data: [],
            borderColor: this._chartColors.green,
            backgroundColor: 'transparent',
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 1,
          },
        ],
      },
      options: this._commonOptions(),
    });
  }

  _commonOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: this._chartColors.legendText,
            font: { family: 'Inter', size: 10 },
            boxWidth: 10,
            padding: 8,
          },
        },
        tooltip: {
          backgroundColor: 'hsl(225, 20%, 15%)',
          titleColor: 'hsl(0, 0%, 95%)',
          bodyColor: 'hsl(220, 10%, 75%)',
          borderColor: 'hsla(0, 0%, 100%, 0.1)',
          borderWidth: 1,
          cornerRadius: 6,
          titleFont: { family: 'Inter', size: 11 },
          bodyFont: { family: 'Inter', size: 10 },
          padding: 8,
        },
      },
      scales: {
        x: {
          ticks: {
            color: this._chartColors.tick,
            font: { family: 'Inter', size: 9 },
            maxTicksLimit: 8,
          },
          grid: { color: this._chartColors.grid },
        },
        y: {
          ticks: {
            color: this._chartColors.tick,
            font: { family: 'Inter', size: 9 },
          },
          grid: { color: this._chartColors.grid },
          beginAtZero: true,
        },
      },
    };
  }

  /** Build an HTML comparison table below the chart */
  _buildComparisonTable(results) {
    const container = document.getElementById('comparison-table-container');
    const strategies = Object.keys(results);

    // Find best (min) values for highlighting
    const bestAvgWait = Math.min(...strategies.map(s => results[s].avgWaitTime));
    const bestMaxWait = Math.min(...strategies.map(s => results[s].maxWaitTime));
    const bestAvgTransit = Math.min(...strategies.map(s => results[s].avgTransitTime));
    const bestDelivered = Math.max(...strategies.map(s => results[s].arrivedCount));
    const bestDistance = Math.min(...strategies.map(s => results[s].totalDistance));
    const bestDistPerSpawn = Math.min(...strategies.map(s => results[s].distancePerSpawn));

    let html = `<table class="comparison-table">
      <thead>
        <tr>
          <th>Strategy</th>
          <th>Avg Wait</th>
          <th>Max Wait</th>
          <th>Avg Transit</th>
          <th>Delivered</th>
          <th>Distance</th>
          <th>Dist/Spawn</th>
        </tr>
      </thead>
      <tbody>`;

    for (const name of strategies) {
      const m = results[name];
      const avgWaitClass = m.avgWaitTime === bestAvgWait ? ' class="best-value"' : '';
      const maxWaitClass = m.maxWaitTime === bestMaxWait ? ' class="best-value"' : '';
      const avgTransitClass = m.avgTransitTime === bestAvgTransit ? ' class="best-value"' : '';
      const deliveredClass = m.arrivedCount === bestDelivered ? ' class="best-value"' : '';
      const distanceClass = m.totalDistance === bestDistance ? ' class="best-value"' : '';
      const distPerSpawnClass = m.distancePerSpawn === bestDistPerSpawn ? ' class="best-value"' : '';

      html += `<tr>
        <td>${name.toUpperCase()}<button type="button" class="strategy-info-btn" data-strategy="${name}" title="Strategy details" aria-label="Open ${name.toUpperCase()} details">ℹ</button></td>
        <td${avgWaitClass}>${m.avgWaitTime.toFixed(1)}</td>
        <td${maxWaitClass}>${m.maxWaitTime}</td>
        <td${avgTransitClass}>${m.avgTransitTime.toFixed(1)}</td>
        <td${deliveredClass}>${m.arrivedCount}</td>
        <td${distanceClass}>${m.totalDistance.toFixed(0)}</td>
        <td${distPerSpawnClass}>${m.distancePerSpawn.toFixed(2)}</td>
      </tr>`;
    }

    html += '</tbody></table>';
    container.innerHTML = html;

    container.querySelectorAll('.strategy-info-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.strategyModal.open(btn.dataset.strategy);
      });
    });
  }
}
