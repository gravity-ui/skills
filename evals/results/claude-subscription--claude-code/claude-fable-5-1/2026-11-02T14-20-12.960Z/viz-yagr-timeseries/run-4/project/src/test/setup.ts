/**
 * Заглушки браузерных API, которых нет в jsdom, но которые нужны uPlot/Yagr:
 * 2D-контекст canvas, ResizeObserver и ненулевые размеры элементов.
 */
import {cleanup} from '@testing-library/react';
import {afterEach} from 'vitest';

// Без `globals: true` Testing Library не регистрирует cleanup сама.
afterEach(cleanup);

class ResizeObserverStub {
  static instances: ResizeObserverStub[] = [];
  observed = new Set<Element>();
  constructor(public callback: ResizeObserverCallback) {
    ResizeObserverStub.instances.push(this);
  }
  observe(target: Element) {
    this.observed.add(target);
  }
  unobserve(target: Element) {
    this.observed.delete(target);
  }
  disconnect() {
    this.observed.clear();
  }
}

Object.defineProperty(globalThis, 'ResizeObserver', {value: ResizeObserverStub, configurable: true});

Object.defineProperty(window, 'matchMedia', {
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
  configurable: true,
});

const context2dStub = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === 'measureText') {
        return () => ({width: 10});
      }
      if (prop === 'getImageData') {
        return () => ({data: new Uint8ClampedArray(4)});
      }
      return () => undefined;
    },
    set() {
      return true;
    },
  },
);

class Path2DStub {
  moveTo() {}
  lineTo() {}
  arc() {}
  rect() {}
  closePath() {}
  addPath() {}
  bezierCurveTo() {}
  quadraticCurveTo() {}
}
Object.defineProperty(globalThis, 'Path2D', {value: Path2DStub, configurable: true});

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: () => context2dStub,
  configurable: true,
});

Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
  get: () => 800,
  configurable: true,
});
Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
  get: () => 300,
  configurable: true,
});
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  value: () => ({x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 300, width: 800, height: 300, toJSON: () => ({})}),
  configurable: true,
});
