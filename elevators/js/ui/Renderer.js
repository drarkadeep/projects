/**
 * Renderer — draws the building cross-section on a <canvas>.
 * Renders floors, waiting passengers, elevators, and direction indicators.
 */
export class Renderer {
  /**
   * @param {string} canvasId - DOM ID of the canvas element
   */
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this._resizeObserver = null;
    this._setupResize();

    // Color tokens (matching CSS custom properties)
    this.colors = {
      bg: 'hsl(225, 25%, 10%)',
      floorLine: 'hsla(0, 0%, 100%, 0.06)',
      floorLabel: 'hsl(220, 10%, 50%)',
      elevatorIdle: 'hsl(185, 80%, 55%)',
      elevatorMoving: 'hsl(215, 90%, 60%)',
      elevatorDoorOpen: 'hsl(155, 70%, 50%)',
      elevatorShaft: 'hsla(225, 20%, 15%, 0.5)',
      passengerNormal: 'hsl(40, 90%, 60%)',
      passengerMedium: 'hsl(25, 85%, 55%)',
      passengerUrgent: 'hsl(0, 75%, 60%)',
      passengerRiding: 'hsl(265, 75%, 65%)',
      textLight: 'hsl(0, 0%, 85%)',
      textDim: 'hsl(220, 10%, 45%)',
      arrowUp: 'hsl(155, 70%, 50%)',
      arrowDown: 'hsl(0, 75%, 60%)',
    };

    // Smooth visual positions for elevators (lerped)
    this._elevatorVisuals = {};
    this._lastBuilding = null;
    this._lastTick = 0;
  }

  /** Setup ResizeObserver to keep canvas sized to its container */
  _setupResize() {
    const container = this.canvas.parentElement;

    const resize = () => {
      const rect = this.canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.scale(dpr, dpr);
      this._width = rect.width;
      this._height = rect.height;

      if (this._lastBuilding) {
        this.render(this._lastBuilding, this._lastTick);
      }
    };

    this._resizeObserver = new ResizeObserver(resize);
    this._resizeObserver.observe(this.canvas);
    resize();
  }

  /**
   * Main render call — draws entire building state.
   * @param {import('../models/Building.js').Building} building
   * @param {number} currentTick
   */
  render(building, currentTick) {
    if (!building) return;

    this._lastBuilding = building;
    this._lastTick = currentTick;

    const ctx = this.ctx;
    const W = this._width;
    const H = this._height;

    // Clear
    ctx.clearRect(0, 0, W, H);

    const numFloors = building.numFloors;
    const numElevators = building.elevators.length;

    // Layout calculations
    const padding = { top: 20, bottom: 30, left: 40, right: 20 };
    const drawW = W - padding.left - padding.right;
    const drawH = H - padding.top - padding.bottom;
    const floorH = drawH / numFloors;

    // Columns: [floor labels | passenger queue | elevator shafts...]
    const queueW = Math.min(drawW * 0.35, 150);
    const shaftAreaW = drawW - queueW;
    const shaftW = Math.max(20, Math.min(shaftAreaW / numElevators, 60));
    const shaftGap = Math.max(2, Math.min(10, (shaftAreaW - shaftW * numElevators) / Math.max(1, numElevators + 1)));

    // Y coordinate for a floor (floor 0 at bottom)
    const floorY = (floorNum) => padding.top + drawH - (floorNum + 1) * floorH;

    // Draw floor lines and labels
    this._drawFloors(ctx, building, padding, drawW, floorH, floorY, numFloors);

    // Draw waiting passengers
    this._drawWaitingPassengers(ctx, building, currentTick, padding, queueW, floorH, floorY);

    // Draw elevator shafts and cars
    const shaftStartX = padding.left + queueW + shaftGap;
    this._drawElevators(ctx, building, currentTick, shaftStartX, shaftW, shaftGap, floorH, floorY, padding);
  }

  /** Draw floor lines and labels */
  _drawFloors(ctx, building, padding, drawW, floorH, floorY, numFloors) {
    const labelInterval = floorH < 12 ? 5 : floorH < 18 ? 2 : 1;

    for (let i = 0; i < numFloors; i++) {
      const y = floorY(i) + floorH;

      // Floor line
      ctx.strokeStyle = this.colors.floorLine;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + drawW, y);
      ctx.stroke();

      // Floor label
      if (i % labelInterval === 0 || i === numFloors - 1) {
        ctx.fillStyle = this.colors.floorLabel;
        ctx.font = `${Math.max(8, Math.min(11, floorH * 0.55))}px Inter, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${i}`, padding.left - 8, floorY(i) + floorH / 2);
      }
    }
  }

  /** Draw a passenger badge with destination floor number */
  _drawPassengerBadge(ctx, x, y, radius, destinationFloor, color, { urgent = false, currentTick = 0 } = {}) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    if (urgent) {
      ctx.beginPath();
      ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(0, 75%, 60%, ${0.3 + 0.2 * Math.sin(currentTick * 0.2)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.font = `bold ${Math.max(6, Math.min(radius * 1.35, 10))}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(destinationFloor), x, y);
  }

  /** Color a waiting passenger by how long they've been waiting */
  _passengerWaitColor(waitTicks) {
    if (waitTicks < 15) return this.colors.passengerNormal;
    if (waitTicks < 40) return this.colors.passengerMedium;
    return this.colors.passengerUrgent;
  }

  /** Draw passengers waiting at each floor */
  _drawWaitingPassengers(ctx, building, currentTick, padding, queueW, floorH, floorY) {
    const badgeR = Math.min(8, floorH * 0.22);
    const badgeSpacing = badgeR * 2.4;
    const maxBadgesPerRow = Math.max(1, Math.floor((queueW - 10) / badgeSpacing));
    const rowSpacing = badgeSpacing * 0.9;
    const maxRows = Math.max(1, Math.floor(Math.max(floorH - 2, rowSpacing) / rowSpacing));
    const visibleLimit = maxBadgesPerRow * maxRows;

    for (const floor of building.floors) {
      const passengers = floor.waitingPassengers;
      if (passengers.length === 0) continue;

      const baseX = padding.left + 5;
      const baseY = floorY(floor.floorNumber) + floorH / 2;

      const visibleCount = Math.min(passengers.length, visibleLimit);
      const visibleRows = Math.ceil(visibleCount / maxBadgesPerRow);
      const firstRowY = baseY - ((visibleRows - 1) * rowSpacing) / 2;

      for (let i = 0; i < visibleCount; i++) {
        const row = Math.floor(i / maxBadgesPerRow);
        const col = i % maxBadgesPerRow;
        const x = baseX + col * badgeSpacing + badgeR;
        const y = firstRowY + row * rowSpacing;

        const waitTicks = currentTick - passengers[i].spawnTick;
        const color = this._passengerWaitColor(waitTicks);

        this._drawPassengerBadge(ctx, x, y, badgeR, passengers[i].destinationFloor, color, {
          urgent: waitTicks > 40,
          currentTick,
        });
      }

      // Count badge if too many passengers to render
      if (passengers.length > visibleLimit) {
        ctx.fillStyle = this.colors.textLight;
        ctx.font = `bold ${Math.max(7, Math.min(10, floorH * 0.55))}px Inter, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`+${passengers.length - visibleLimit}`, padding.left + queueW - 4, baseY);
      }
    }
  }

  /** Draw elevator shafts and cars */
  _drawElevators(ctx, building, currentTick, shaftStartX, shaftW, shaftGap, floorH, floorY, padding) {
    for (const elevator of building.elevators) {
      const shaftX = shaftStartX + elevator.id * (shaftW + shaftGap);

      // Initialize visual position if needed
      if (this._elevatorVisuals[elevator.id] === undefined) {
        this._elevatorVisuals[elevator.id] = elevator.currentFloor;
      }

      // Symbolic rendering follows the simulation exactly. Rendering used to
      // interpolate forever in a global animation loop, which wasted work and
      // could leave the car visually behind its real floor when paused.
      this._elevatorVisuals[elevator.id] = elevator.currentFloor;
      const visualFloor = this._elevatorVisuals[elevator.id];

      // Draw shaft background
      const shaftTop = padding.top;
      const shaftBot = padding.top + (this._height - padding.top - padding.bottom);
      ctx.fillStyle = this.colors.elevatorShaft;
      ctx.fillRect(shaftX, shaftTop, shaftW, shaftBot - shaftTop);

      // Draw elevator car
      const carH = Math.max(4, Math.min(floorH * 0.72, 38));
      const carY = padding.top + (this._height - padding.top - padding.bottom) - (visualFloor + 1) * floorH + (floorH - carH) / 2;

      // Car color by state
      let carColor;
      switch (elevator.state) {
        case 'moving':
          carColor = this.colors.elevatorMoving;
          break;
        case 'door-open':
        case 'door-opening':
          carColor = this.colors.elevatorDoorOpen;
          break;
        case 'door-closing':
          carColor = 'hsl(40, 90%, 60%)';
          break;
        default:
          carColor = this.colors.elevatorIdle;
      }

      // Car glow
      ctx.shadowColor = carColor;
      ctx.shadowBlur = elevator.state === 'door-open' ? 12 + 4 * Math.sin(currentTick * 0.3) : 6;

      // Draw car rectangle
      const carPad = 3;
      ctx.fillStyle = carColor;
      ctx.beginPath();
      ctx.roundRect(shaftX + carPad, carY, shaftW - carPad * 2, carH, 4);
      ctx.fill();

      ctx.shadowBlur = 0;

      // Passengers inside car — each badge shows their destination floor
      if (elevator.passengers.length > 0) {
        const badgeR = Math.min(7, carH * 0.2, (shaftW - carPad * 2) / 5);
        const badgeSpacing = badgeR * 2.2;
        const maxPerRow = Math.max(1, Math.floor((shaftW - carPad * 2) / badgeSpacing));
        const rowSpacing = badgeSpacing * 0.95;
        const maxRows = Math.max(1, Math.floor((carH - 4) / rowSpacing));
        const visibleLimit = maxPerRow * maxRows;
        const visibleCount = Math.min(elevator.passengers.length, visibleLimit);
        const visibleRows = Math.ceil(visibleCount / maxPerRow);
        const gridW = (Math.min(visibleCount, maxPerRow) - 1) * badgeSpacing;
        const gridH = (visibleRows - 1) * rowSpacing;
        const startX = shaftX + shaftW / 2 - gridW / 2;
        const startY = carY + carH / 2 - gridH / 2;

        for (let i = 0; i < visibleCount; i++) {
          const row = Math.floor(i / maxPerRow);
          const col = i % maxPerRow;
          const x = startX + col * badgeSpacing;
          const y = startY + row * rowSpacing;

          this._drawPassengerBadge(
            ctx, x, y, badgeR,
            elevator.passengers[i].destinationFloor,
            this.colors.passengerRiding,
          );
        }

        if (elevator.passengers.length > visibleLimit) {
          ctx.fillStyle = this.colors.textLight;
          ctx.font = `bold ${Math.max(6, badgeR)}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(`+${elevator.passengers.length - visibleLimit}`, shaftX + shaftW / 2, carY + carH - badgeR - 2);
        }
      }

      // Direction arrow
      if (elevator.state === 'moving') {
        const arrowX = shaftX + shaftW / 2;
        const arrowY = elevator.direction === 'up' ? carY - 6 : carY + carH + 6;
        ctx.fillStyle = elevator.direction === 'up' ? this.colors.arrowUp : this.colors.arrowDown;
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(elevator.direction === 'up' ? '▲' : '▼', arrowX, arrowY);
      }

      // Elevator label at bottom
      ctx.fillStyle = this.colors.textDim;
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(`E${elevator.id + 1}`, shaftX + shaftW / 2, shaftBot + 4);
    }
  }

  /** Reset visual positions (e.g., on simulation reset) */
  resetVisuals() {
    this._elevatorVisuals = {};
  }
}
