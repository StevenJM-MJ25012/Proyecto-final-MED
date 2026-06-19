import { BPlusTree } from './core/BPlusTree.js';
import { TreeLayout } from './render/TreeLayout.js';
import { SvgRenderer } from './render/SvgRenderer.js';
import { ControlPanel } from './ui/ControlPanel.js';
import { StatsPanel } from './ui/StatsPanel.js';
import { LogPanel } from './ui/LogPanel.js';
import { exportSvgAsPng } from './utils/exportPng.js';

// ---- referencias DOM ----------------------------------------------------
const els = {
  orderSelect: document.getElementById('orderSelect'),
  resetBtn: document.getElementById('resetBtn'),
  insertBtn: document.getElementById('insertBtn'),
  searchBtn: document.getElementById('searchBtn'),
  deleteBtn: document.getElementById('deleteBtn'),
  customKey: document.getElementById('customKey'),
  fileChips: document.getElementById('fileChips'),
  svgHost: document.getElementById('svgHost'),
  opMsg: document.getElementById('opMsg'),
  statsBox: document.getElementById('statsBox'),
  bigoBanner: document.getElementById('bigoBanner'),
  logBox: document.getElementById('logBox'),
  exportBtn: document.getElementById('exportBtn'),
};

// ---- instancias de cada módulo ------------------------------------------
let tree = new BPlusTree(parseInt(els.orderSelect.value, 10));
const layout = new TreeLayout();
const renderer = new SvgRenderer();
const stats = new StatsPanel(els.statsBox, els.bigoBanner);
const logPanel = new LogPanel(els.logBox);

let lastTouched = new Set();

// ---- función central de redibujado --------------------------------------
function renderAll() {
  const computedLayout = layout.compute(tree);
  const svg = renderer.render(tree, computedLayout, lastTouched);
  els.svgHost.innerHTML = svg;

  stats.update(tree);
  controlPanel.renderChips(tree.allKeysInOrder());
}

function randomRecord(key) {
  const ext = key.includes('.') ? key.split('.').pop() : 'file';
  const sizeKB = Math.floor(Math.random() * 900 + 10);
  return { size: `${sizeKB}KB`, type: ext };
}

// ---- handlers de acciones del usuario -----------------------------------
const controlPanel = new ControlPanel(els, {
  onOrderChange(newOrder) {
    tree = new BPlusTree(newOrder);
    lastTouched = new Set();
    logPanel.clear(`Árbol reiniciado. Orden m = ${newOrder}.`);
    controlPanel.setOpMessage('Árbol vacío — inserta el primer archivo');
    renderAll();
  },

  onReset() {
    const order = tree.order;
    tree = new BPlusTree(order);
    lastTouched = new Set();
    logPanel.clear(`Árbol reiniciado. Orden m = ${order}.`);
    controlPanel.setOpMessage('Árbol vacío — inserta el primer archivo');
    renderAll();
  },

  onInsert(key) {
    const { touched, events } = tree.insert(key, randomRecord(key));
    lastTouched = touched;
    logPanel.pushEvents(events);

    const last = events[events.length - 1];
    if (last.type === 'insert-duplicate') {
      controlPanel.setOpMessage(`"${key}" ya existe en el árbol`);
    } else {
      controlPanel.setOpMessage(`Insertado "${key}"`);
    }
    renderAll();
  },

  onSearch(key) {
    const { path, events } = tree.search(key);
    lastTouched = new Set(path.map(n => n.id));
    logPanel.pushEvents(events);

    const ev = events[0];
    controlPanel.setOpMessage(
      ev.type === 'search-found'
        ? `"${key}" encontrado · ${ev.levelsVisited} nivel(es) recorridos`
        : `"${key}" no existe en el árbol`
    );
    renderAll();
  },

  onDelete(key) {
    const { touched, events } = tree.remove(key);
    lastTouched = touched;
    logPanel.pushEvents(events);

    const last = events[events.length - 1];
    controlPanel.setOpMessage(
      last.type === 'delete-missing'
        ? `"${key}" no existe — no se eliminó nada`
        : `"${key}" eliminado del sistema de archivos`
    );
    renderAll();
  },
});

els.exportBtn.addEventListener('click', () => {
  const svgEl = els.svgHost.querySelector('svg');
  exportSvgAsPng(svgEl, 'arbol-bplus-estado.png');
});

// ---- arranque -------------------------------------------------------------
logPanel.clear(`Árbol reiniciado. Orden m = ${tree.order}.`);
renderAll();
