// vizWidget.js — единый API виджета с ленивой загрузкой движков
const VizWidget = (() => {
  const _registry = {};    // id -> { canvas, mode, data, title, loaded }

  function _ensureEngine(entry, engineName, engineUrl) {
    if (entry.loaded === engineName) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = engineUrl;
      script.onload = () => { entry.loaded = engineName; resolve(); };
      script.onerror = () => reject(new Error(`Failed to load ${engineUrl}`));
      document.head.appendChild(script);
    });
  }

  function _redraw(entry) {
    const ctx = entry.canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = entry.canvas.clientWidth;
    const h = entry.canvas.clientHeight;
    entry.canvas.width = w * dpr;
    entry.canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const engine = entry.mode === 'timeseries'
      ? (typeof TimeseriesEngine !== 'undefined' ? TimeseriesEngine : null)
      : (typeof LineChartEngine !== 'undefined' ? LineChartEngine : null);

    if (engine) engine.render(ctx, w, h, entry.data, entry.title);
  }

  // ---- публичный API ----

  function create(id, { mode = 'line', data = [], title = 'Chart', width = '100%', height = 400 } = {}) {
    const existing = document.getElementById(id);
    if (!existing) throw new Error(`Element #${id} not found`);
    const canvas = existing.tagName === 'CANVAS' ? existing : document.createElement('canvas');
    if (existing.tagName !== 'CANVAS') { existing.innerHTML = ''; existing.appendChild(canvas); }
    canvas.style.width = typeof width === 'number' ? width + 'px' : width;
    canvas.style.height = typeof height === 'number' ? height + 'px' : height;
    canvas.style.display = 'block';

    const entry = { canvas, mode, data, title, loaded: null };
    _registry[id] = entry;
    setMode(id, mode);
    return { id };
  }

  function setMode(id, mode) {
    const entry = _registry[id];
    if (!entry) throw new Error(`Widget ${id} not found`);
    entry.mode = mode;

    const url = mode === 'timeseries'
      ? './engines/timeseriesEngine.js'
      : './engines/lineChartEngine.js';

    return _ensureEngine(entry, mode, url).then(() => _redraw(entry));
  }

  function setData(id, data) {
    const entry = _registry[id];
    if (!entry) throw new Error(`Widget ${id} not found`);
    entry.data = data;
    if (entry.loaded) _redraw(entry);
  }

  function setTitle(id, title) {
    const entry = _registry[id];
    if (!entry) throw new Error(`Widget ${id} not found`);
    entry.title = title;
    if (entry.loaded) _redraw(entry);
  }

  function resize(id) {
    const entry = _registry[id];
    if (!entry) return;
    if (entry.loaded) _redraw(entry);
  }

  return { create, setMode, setData, setTitle, resize };
})();
