export class LogPanel {
  constructor(hostElement, { maxEntries = 60 } = {}) {
    this.host = hostElement;
    this.maxEntries = maxEntries;
    this.entries = [];
  }

  clear(message) {
    this.entries = [];
    if (message) this.push(message);
    this._flush();
  }

  /** Empuja eventos crudos del árbol, traducidos a texto. */
  pushEvents(events) {
    events.forEach(ev => {
      const { text, cls } = this._describe(ev);
      this.push(text, cls);
    });
  }

  push(text, cls = '') {
    this.entries.unshift(`<div class="entry${cls ? ' ' + cls : ''}">${text}</div>`);
    if (this.entries.length > this.maxEntries) this.entries.pop();
    this._flush();
  }

  _flush() {
    this.host.innerHTML = this.entries.join('');
  }

  _describe(ev) {
    switch (ev.type) {
      case 'insert-first':
        return { text: `Insertado <b>"${ev.key}"</b> como raíz-hoja inicial.`, cls: '' };
      case 'insert-duplicate':
        return { text: `"${ev.key}" ya existe — inserción ignorada (clave duplicada).`, cls: '' };
      case 'insert-simple':
        return { text: `Insertado <b>"${ev.key}"</b> en hoja existente (sin desbordamiento).`, cls: '' };
      case 'split-leaf':
        return { text: `<b>División de hoja</b>: claves ≥ "${ev.upKey}" pasan a una nueva hoja. Se copia "${ev.upKey}" al padre.`, cls: 'split' };
      case 'split-internal':
        return { text: `<b>División de nodo interno</b>: "${ev.upKey}" sube al padre (no se duplica, a diferencia de las hojas).`, cls: 'split' };
      case 'new-root':
        return { text: `Se crea nueva raíz interna con clave guía "${ev.upKey}". Altura del árbol +1.`, cls: 'split' };
      case 'search-found':
        return { text: `Búsqueda: <b>"${ev.key}"</b> encontrado tras recorrer ${ev.levelsVisited} nivel(es).`, cls: '' };
      case 'search-missing':
        return { text: `Búsqueda: <b>"${ev.key}"</b> NO existe (recorridos ${ev.levelsVisited} nivel(es)).`, cls: '' };
      case 'delete-missing':
        return { text: `Eliminación: "${ev.key}" no existe — nada que eliminar.`, cls: '' };
      case 'delete-ok':
        return { text: `Eliminado <b>"${ev.key}"</b> de la hoja.`, cls: '' };
      case 'borrow-right-leaf':
        return { text: `<b>Préstamo</b> desde hoja derecha para mantener el mínimo de claves.`, cls: 'merge' };
      case 'borrow-left-leaf':
        return { text: `<b>Préstamo</b> desde hoja izquierda para mantener el mínimo de claves.`, cls: 'merge' };
      case 'merge-leaf-right':
      case 'merge-leaf-left':
        return { text: `<b>Fusión</b> de hojas (ambas bajo el mínimo de claves).`, cls: 'merge' };
      case 'merge-internal-right':
      case 'merge-internal-left':
        return { text: `<b>Fusión</b> de nodos internos, bajando la clave separadora del padre.`, cls: 'merge' };
      case 'root-shrink':
        return { text: `La raíz quedó con un solo hijo → se reduce la altura del árbol.`, cls: 'merge' };
      case 'tree-empty':
        return { text: `El árbol queda vacío.`, cls: '' };
      default:
        return { text: JSON.stringify(ev), cls: '' };
    }
  }
}
