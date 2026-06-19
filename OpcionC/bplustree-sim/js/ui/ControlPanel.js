export const SUGGESTED_FILES = [
  'informe.docx', 'datos.csv', 'imagen.png', 'config.json',
  'backup.zip', 'notas.txt', 'script.py', 'reporte.pdf',
  'audio.mp3', 'video.mp4', 'tabla.xlsx', 'logo.svg',
];

export class ControlPanel {
  /**
   * @param {object} els - referencias a elementos del DOM
   * @param {object} handlers - { onInsert, onSearch, onDelete, onOrderChange, onReset }
   */
  constructor(els, handlers) {
    this.els = els;
    this.handlers = handlers;
    this._wire();
  }

  _wire() {
    const { orderSelect, resetBtn, insertBtn, searchBtn, deleteBtn, customKey, fileChips } = this.els;

    orderSelect.addEventListener('change', e => {
      this.handlers.onOrderChange(parseInt(e.target.value, 10));
    });

    resetBtn.addEventListener('click', () => this.handlers.onReset());

    insertBtn.addEventListener('click', () => this._submit('onInsert'));
    deleteBtn.addEventListener('click', () => this._submit('onDelete'));
    searchBtn.addEventListener('click', () => {
      const v = customKey.value.trim();
      if (!v) return;
      this.handlers.onSearch(v);
    });

    customKey.addEventListener('keydown', e => {
      if (e.key === 'Enter') this._submit('onInsert');
    });

    this.renderChips([]);
  }

  _submit(handlerName) {
    const v = this.els.customKey.value.trim();
    if (!v) return;
    this.handlers[handlerName](v);
    this.els.customKey.value = '';
  }

  /** Vuelve a pintar los chips, marcando cuáles ya están presentes en el árbol. */
  renderChips(presentKeys) {
    const present = new Set(presentKeys);
    this.els.fileChips.innerHTML = SUGGESTED_FILES.map(f => {
      const isPresent = present.has(f);
      return `<span class="chip ${isPresent ? 'present' : ''}" data-file="${f}" style="cursor:pointer;">${f}${isPresent ? ' ✓' : ''}</span>`;
    }).join('');

    this.els.fileChips.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.els.customKey.value = chip.dataset.file;
        this.els.customKey.focus();
      });
    });
  }

  setOpMessage(text) {
    this.els.opMsg.textContent = text;
  }
}
