let _autoId = 0;

export class BPlusNode {
  /**
   * @param {boolean} isLeaf - true si el nodo es hoja
   */
  constructor(isLeaf) {
    this.id = `n${_autoId++}`;
    this.leaf = isLeaf;
    this.keys = [];

    if (isLeaf) {
      this.records = [];   // metadatos asociados a cada clave (paralelo a keys)
      this.next = null;    // enlace a la hoja siguiente (recorrido secuencial)
    } else {
      this.children = [];  // nodos hijos (BPlusNode), length = keys.length + 1
    }

    // Campos de layout, los rellena TreeLayout.js antes de renderizar.
    this._x = 0;
    this._y = 0;
    this._w = 0;
  }

  static createLeaf() {
    return new BPlusNode(true);
  }

  static createInternal() {
    return new BPlusNode(false);
  }

  /** Índice del hijo `child` dentro de este nodo interno. */
  indexOfChild(child) {
    return this.children.indexOf(child);
  }

  /** Cantidad de claves almacenadas actualmente. */
  get size() {
    return this.keys.length;
  }
}
