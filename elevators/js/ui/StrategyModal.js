import { STRATEGY_INFO, STRATEGY_ORDER } from '../strategies/strategyInfo.js';

/**
 * StrategyModal — displays detailed feature explanations for scheduling algorithms.
 */
export class StrategyModal {
  constructor() {
    this.modal = document.getElementById('strategy-modal');
    this.titleEl = document.getElementById('modal-strategy-title');
    this.aliasEl = document.getElementById('modal-strategy-alias');
    this.summaryEl = document.getElementById('modal-strategy-summary');
    this.howEl = document.getElementById('modal-strategy-how');
    this.strengthsEl = document.getElementById('modal-strategy-strengths');
    this.tradeoffsEl = document.getElementById('modal-strategy-tradeoffs');
    this.bestForEl = document.getElementById('modal-strategy-best-for');
    this.prevBtn = document.getElementById('modal-strategy-prev');
    this.nextBtn = document.getElementById('modal-strategy-next');

    this._currentKey = null;
    this._bindEvents();
  }

  /** Open the modal for a given strategy key */
  open(strategyKey) {
    const info = STRATEGY_INFO[strategyKey];
    if (!info) return;

    this._currentKey = strategyKey;
    this._render(info);

    this.modal.hidden = false;
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    this.modal.querySelector('.modal-close').focus();
  }

  close() {
    this.modal.hidden = true;
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  _bindEvents() {
    this.modal.querySelector('.modal-backdrop').addEventListener('click', () => this.close());
    this.modal.querySelector('.modal-close').addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (this.modal.hidden) return;
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this._navigate(-1);
      if (e.key === 'ArrowRight') this._navigate(1);
    });

    this.prevBtn.addEventListener('click', () => this._navigate(-1));
    this.nextBtn.addEventListener('click', () => this._navigate(1));
  }

  _navigate(delta) {
    const idx = STRATEGY_ORDER.indexOf(this._currentKey);
    if (idx === -1) return;
    const nextIdx = (idx + delta + STRATEGY_ORDER.length) % STRATEGY_ORDER.length;
    this.open(STRATEGY_ORDER[nextIdx]);
  }

  _render(info) {
    this.titleEl.textContent = info.name;
    this.aliasEl.textContent = info.alias;
    this.summaryEl.textContent = info.summary;
    this.howEl.innerHTML = this._listHtml(info.howItWorks);
    this.strengthsEl.innerHTML = this._listHtml(info.strengths);
    this.tradeoffsEl.innerHTML = this._listHtml(info.tradeoffs);
    this.bestForEl.textContent = info.bestFor;
  }

  _listHtml(items) {
    return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
  }
}
