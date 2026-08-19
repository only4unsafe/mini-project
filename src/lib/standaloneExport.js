import { unionBounds } from './geometry.js';

// Produces a single, dependency-free HTML file that renders the dashboard and
// replays its visual workflow logic using plain JavaScript. This is what makes
// "export" mean a reusable application rather than just a data dump: the file
// can be opened directly in any browser, or hosted anywhere, with zero build
// step and no reliance on this editor (or any CDN) at runtime.

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}

function widgetOuterStyle(widget) {
  return [
    `position:absolute`,
    `left:${widget.x}px`,
    `top:${widget.y}px`,
    `width:${widget.width}px`,
    `height:${widget.height}px`,
    `transform:rotate(${widget.rotation || 0}deg)`,
    `display:${widget.hidden ? 'none' : 'block'}`,
  ].join(';');
}

function renderWidgetInnerHtml(widget) {
  const p = widget.props || {};
  switch (widget.type) {
    case 'text':
      return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:${
        p.align === 'center' ? 'center' : p.align === 'right' ? 'flex-end' : 'flex-start'
      };font-size:${p.fontSize || 18}px;font-weight:${p.fontWeight || 500};color:${p.color || '#14151a'};overflow:hidden;">${escapeHtml(
        p.content
      )}</div>`;
    case 'kpi':
      return `
        <div class="pdc-card" style="border-top:4px solid ${p.accentColor || '#6366f1'}">
          <div class="pdc-kpi-title">${escapeHtml(p.title)}</div>
          <div class="pdc-kpi-value">${escapeHtml(p.prefix)}${escapeHtml(p.value)}${escapeHtml(p.suffix)}</div>
          <div class="pdc-kpi-delta ${p.trend === 'down' ? 'down' : 'up'}">${escapeHtml(p.delta)}</div>
        </div>`;
    case 'chart':
      return `
        <div class="pdc-card" style="height:100%">
          <div class="pdc-card-title">${escapeHtml(p.title)}</div>
          <div class="pdc-chart-mount" data-chart='${escapeHtml(JSON.stringify(p))}'></div>
        </div>`;
    case 'table': {
      const cols = (p.columns || []).map((c) => `<th>${escapeHtml(c)}</th>`).join('');
      const rows = (p.rows || [])
        .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
        .join('');
      return `
        <div class="pdc-card" style="height:100%;overflow:auto">
          <div class="pdc-card-title">${escapeHtml(p.title)}</div>
          <table class="pdc-table"><thead><tr>${cols}</tr></thead><tbody>${rows}</tbody></table>
        </div>`;
    }
    case 'image':
      return `<img src="${escapeHtml(p.src)}" alt="${escapeHtml(p.alt)}" style="width:100%;height:100%;object-fit:${
        p.objectFit || 'cover'
      };border-radius:${p.radius || 0}px;display:block" />`;
    case 'button':
      return `<button class="pdc-button" data-widget-id="${widget.id}" style="background:${
        p.variant === 'outline' ? 'transparent' : p.color || '#6366f1'
      };color:${p.variant === 'outline' ? p.color || '#6366f1' : '#fff'};border-color:${p.color || '#6366f1'}">${escapeHtml(
        p.label
      )}</button>`;
    case 'shape':
      return `<div style="width:100%;height:100%;background:${p.fill || '#e0e7ff'};border:${p.strokeWidth || 2}px solid ${
        p.stroke || '#6366f1'
      };border-radius:${p.shapeKind === 'ellipse' ? '50%' : `${p.radius || 0}px`}"></div>`;
    case 'gauge':
      return `
        <div class="pdc-card" style="height:100%;align-items:center;text-align:center">
          <div class="pdc-card-title">${escapeHtml(p.title)}</div>
          <div class="pdc-gauge-mount" data-gauge='${escapeHtml(JSON.stringify(p))}'></div>
        </div>`;
    default:
      return '';
  }
}

const RUNTIME_SCRIPT = `
(function () {
  var STATE = window.__PDC_PROJECT__;
  var widgetById = {};
  STATE.widgets.forEach(function (w) { widgetById[w.id] = w; });

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function toast(message) {
    var el = document.createElement('div');
    el.className = 'pdc-toast';
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add('show'); });
    setTimeout(function () {
      el.classList.remove('show');
      setTimeout(function () { el.remove(); }, 200);
    }, 2600);
  }

  function setWidgetVisibility(id, hidden) {
    var node = qs('[data-widget-node="' + id + '"]');
    if (node) node.style.display = hidden ? 'none' : 'block';
  }

  function setWidgetText(id, value) {
    var node = qs('[data-widget-node="' + id + '"] div');
    if (node) node.textContent = value;
  }

  function runFrom(startNodeId) {
    var edges = STATE.workflow.edges;
    var nodes = {};
    STATE.workflow.nodes.forEach(function (n) { nodes[n.id] = n; });
    var queue = edges.filter(function (e) { return e.source === startNodeId; }).map(function (e) { return e.target; });
    var visited = {};
    while (queue.length) {
      var nodeId = queue.shift();
      if (visited[nodeId]) continue;
      visited[nodeId] = true;
      var node = nodes[nodeId];
      if (node) {
        execute(node);
        edges.filter(function (e) { return e.source === nodeId; }).forEach(function (e) { queue.push(e.target); });
      }
    }
  }

  function execute(node) {
    var data = node.data || {};
    switch (data.nodeType) {
      case 'action.showWidget':
        if (data.widgetId) setWidgetVisibility(data.widgetId, false);
        break;
      case 'action.hideWidget':
        if (data.widgetId) setWidgetVisibility(data.widgetId, true);
        break;
      case 'action.toggleWidget':
        if (data.widgetId) {
          var node2 = qs('[data-widget-node="' + data.widgetId + '"]');
          if (node2) setWidgetVisibility(data.widgetId, node2.style.display !== 'none');
        }
        break;
      case 'action.setText':
        if (data.widgetId) setWidgetText(data.widgetId, data.value || '');
        break;
      case 'action.showAlert':
        toast(data.message || '');
        break;
      default:
        break;
    }
  }

  qsa('.pdc-button').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var widgetId = btn.getAttribute('data-widget-id');
      STATE.workflow.nodes
        .filter(function (n) { return n.data && n.data.nodeType === 'trigger.buttonClick' && n.data.widgetId === widgetId; })
        .forEach(function (n) { runFrom(n.id); });
    });
  });

  STATE.workflow.nodes
    .filter(function (n) { return n.data && n.data.nodeType === 'trigger.onLoad'; })
    .forEach(function (n) { runFrom(n.id); });

  function renderBars(mount, data, color) {
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }).concat([1]));
    var w = mount.clientWidth || 300;
    var h = mount.clientHeight || 180;
    var barW = w / data.length;
    var svg = '<svg width="100%" height="100%" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">';
    data.forEach(function (d, i) {
      var barH = (d.value / max) * (h - 24);
      svg += '<rect x="' + (i * barW + barW * 0.15) + '" y="' + (h - barH - 18) + '" width="' + (barW * 0.7) + '" height="' + barH + '" fill="' + color + '" rx="4"></rect>';
      svg += '<text x="' + (i * barW + barW / 2) + '" y="' + (h - 4) + '" font-size="10" text-anchor="middle" fill="#8b8f99">' + d.label + '</text>';
    });
    svg += '</svg>';
    mount.innerHTML = svg;
  }

  function renderLine(mount, data, color, filled) {
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }).concat([1]));
    var w = mount.clientWidth || 300;
    var h = mount.clientHeight || 180;
    var stepX = w / (data.length - 1 || 1);
    var points = data.map(function (d, i) { return [i * stepX, h - 20 - (d.value / max) * (h - 32)]; });
    var path = points.map(function (p, i) { return (i === 0 ? 'M' : 'L') + p[0] + ' ' + p[1]; }).join(' ');
    var area = filled ? path + ' L ' + points[points.length - 1][0] + ' ' + h + ' L ' + points[0][0] + ' ' + h + ' Z' : '';
    var svg = '<svg width="100%" height="100%" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">';
    if (filled) svg += '<path d="' + area + '" fill="' + color + '" opacity="0.15"></path>';
    svg += '<path d="' + path + '" fill="none" stroke="' + color + '" stroke-width="2.5"></path>';
    data.forEach(function (d, i) {
      svg += '<text x="' + (i * stepX) + '" y="' + (h - 4) + '" font-size="10" text-anchor="middle" fill="#8b8f99">' + d.label + '</text>';
    });
    svg += '</svg>';
    mount.innerHTML = svg;
  }

  function renderPie(mount, data, color) {
    var total = data.reduce(function (a, d) { return a + d.value; }, 0) || 1;
    var palette = [color, '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9', '#a855f7'];
    var r = Math.min(mount.clientWidth || 200, mount.clientHeight || 200) / 2 - 8;
    var cx = (mount.clientWidth || 200) / 2;
    var cy = (mount.clientHeight || 200) / 2;
    var angle = -Math.PI / 2;
    var svg = '<svg width="100%" height="100%" viewBox="0 0 ' + (mount.clientWidth || 200) + ' ' + (mount.clientHeight || 200) + '">';
    data.forEach(function (d, i) {
      var slice = (d.value / total) * Math.PI * 2;
      var x1 = cx + r * Math.cos(angle);
      var y1 = cy + r * Math.sin(angle);
      angle += slice;
      var x2 = cx + r * Math.cos(angle);
      var y2 = cy + r * Math.sin(angle);
      var largeArc = slice > Math.PI ? 1 : 0;
      svg += '<path d="M' + cx + ' ' + cy + ' L' + x1 + ' ' + y1 + ' A' + r + ' ' + r + ' 0 ' + largeArc + ' 1 ' + x2 + ' ' + y2 + ' Z" fill="' + palette[i % palette.length] + '"></path>';
    });
    svg += '</svg>';
    mount.innerHTML = svg;
  }

  qsa('.pdc-chart-mount').forEach(function (mount) {
    var props = JSON.parse(mount.getAttribute('data-chart'));
    var data = props.data || [];
    if (props.chartKind === 'line') renderLine(mount, data, props.color, false);
    else if (props.chartKind === 'area') renderLine(mount, data, props.color, true);
    else if (props.chartKind === 'pie') renderPie(mount, data, props.color);
    else renderBars(mount, data, props.color);
  });

  qsa('.pdc-gauge-mount').forEach(function (mount) {
    var props = JSON.parse(mount.getAttribute('data-gauge'));
    var pct = Math.min(1, Math.max(0, (props.value - props.min) / (props.max - props.min || 1)));
    var r = 70, cx = 90, cy = 90;
    var startX = cx - r;
    var startY = cy;
    var angle = Math.PI * (1 - pct);
    var x2 = cx + r * Math.cos(angle);
    var y2 = cy - r * Math.sin(angle);
    var svg = '<svg width="180" height="110" viewBox="0 0 180 110">' +
      '<path d="M' + startX + ' ' + startY + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + '" fill="none" stroke="#e3e6eb" stroke-width="14" stroke-linecap="round"></path>' +
      '<path d="M' + startX + ' ' + startY + ' A' + r + ' ' + r + ' 0 0 1 ' + x2 + ' ' + y2 + '" fill="none" stroke="' + props.color + '" stroke-width="14" stroke-linecap="round"></path>' +
      '<text x="90" y="95" font-size="22" font-weight="700" text-anchor="middle" fill="#14151a">' + props.value + (props.unit || '') + '</text>' +
      '</svg>';
    mount.innerHTML = svg;
  });
})();
`;

export function buildStandaloneHtml(project) {
  const bounds = unionBounds(project.widgets.length ? project.widgets : [{ x: 0, y: 0, width: 800, height: 400 }]);
  const canvasWidth = Math.ceil(bounds.x + bounds.width + 80);
  const canvasHeight = Math.ceil(bounds.y + bounds.height + 80);

  const sortedWidgets = [...project.widgets].sort((a, b) => a.zIndex - b.zIndex);
  const widgetsHtml = sortedWidgets
    .map(
      (widget) =>
        `<div data-widget-node="${widget.id}" style="${widgetOuterStyle(widget)}">${renderWidgetInnerHtml(widget)}</div>`
    )
    .join('\n');

  const stateJson = JSON.stringify({ widgets: project.widgets, workflow: project.workflow }).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(project.name)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #f2f3f6; color: #14151a; }
  .pdc-stage-wrap { min-height: 100vh; overflow: auto; padding: 24px; }
  .pdc-stage { position: relative; width: ${canvasWidth}px; height: ${canvasHeight}px; margin: 0 auto; }
  .pdc-card { background: #fff; border-radius: 14px; padding: 16px; height: 100%; box-shadow: 0 1px 2px rgba(15,23,42,.06), 0 8px 24px rgba(15,23,42,.06); display: flex; flex-direction: column; gap: 6px; }
  .pdc-card-title { font-size: 13px; font-weight: 600; color: #4b4f58; }
  .pdc-kpi-title { font-size: 13px; color: #8b8f99; font-weight: 600; }
  .pdc-kpi-value { font-size: 30px; font-weight: 800; }
  .pdc-kpi-delta { font-size: 13px; font-weight: 600; }
  .pdc-kpi-delta.up { color: #22c55e; }
  .pdc-kpi-delta.down { color: #ef4444; }
  .pdc-chart-mount, .pdc-gauge-mount { flex: 1; min-height: 0; }
  .pdc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .pdc-table th { text-align: left; color: #8b8f99; font-weight: 600; padding: 6px 8px; border-bottom: 1px solid #e2e4e9; }
  .pdc-table td { padding: 6px 8px; border-bottom: 1px solid #f0f1f4; }
  .pdc-button { width: 100%; height: 100%; border-radius: 10px; border: 2px solid; font-weight: 600; font-size: 14px; cursor: pointer; }
  .pdc-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px); background: #14151a; color: #fff; padding: 10px 18px; border-radius: 10px; font-size: 14px; opacity: 0; transition: all .2s ease; z-index: 999; }
  .pdc-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>
</head>
<body>
<div class="pdc-stage-wrap">
  <div class="pdc-stage">
    ${widgetsHtml}
  </div>
</div>
<script>window.__PDC_PROJECT__ = ${stateJson};</script>
<script>${RUNTIME_SCRIPT}</script>
</body>
</html>
`;
}
