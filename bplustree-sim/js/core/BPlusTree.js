import { BPlusNode } from './BPlusNode.js';
export class BPlusTree {
  /**
   * @param {number} order - orden m del árbol (máx. m hijos, m-1 claves)
   */
  constructor(order = 4) {
    this.order = order;
    this.root = BPlusNode.createLeaf();
    this.stats = { inserts: 0, searches: 0, deletes: 0, splits: 0, merges: 0 };
  }

  /** Reinicia el árbol completamente (nueva raíz vacía). */
  reset() {
    this.root = BPlusNode.createLeaf();
    this.stats = { inserts: 0, searches: 0, deletes: 0, splits: 0, merges: 0 };
  }

  /** Altura del árbol (1 = solo raíz-hoja). */
  height() {
    let h = 1, n = this.root;
    while (!n.leaf) { h++; n = n.children[0]; }
    return h;
  }

  /** Primera hoja (extremo izquierdo), punto de partida del recorrido secuencial. */
  firstLeaf() {
    let n = this.root;
    while (!n.leaf) n = n.children[0];
    return n;
  }

  /** Todas las claves en orden, recorriendo la lista enlazada de hojas. O(n). */
  allKeysInOrder() {
    const out = [];
    let n = this.firstLeaf();
    while (n) { out.push(...n.keys); n = n.next; }
    return out;
  }

  /**
   * Desciende desde la raíz hasta la hoja donde debería estar `key`.
   * @returns {{leaf: BPlusNode, path: BPlusNode[]}} path incluye la hoja al final
   */
  _findLeaf(key) {
    let node = this.root;
    const path = [node];
    while (!node.leaf) {
      let i = 0;
      while (i < node.keys.length && key >= node.keys[i]) i++;
      node = node.children[i];
      path.push(node);
    }
    return { leaf: node, path };
  }

  // ---------------------------------------------------------------------
  // SEARCH
  // ---------------------------------------------------------------------
  search(key) {
    this.stats.searches++;
    const events = [];
    const { leaf, path } = this._findLeaf(key);
    const idx = leaf.keys.indexOf(key);
    const found = idx >= 0;

    events.push({
      type: found ? 'search-found' : 'search-missing',
      key,
      levelsVisited: path.length,
    });

    return { found, path, events };
  }

  // ---------------------------------------------------------------------
  // INSERT
  // ---------------------------------------------------------------------
  insert(key, record) {
    this.stats.inserts++;
    const events = [];
    const touched = new Set();

    // Caso especial: árbol recién creado y vacío
    if (this.root.leaf && this.root.keys.length === 0) {
      this.root.keys.push(key);
      this.root.records.push(record);
      touched.add(this.root.id);
      events.push({ type: 'insert-first', key });
      return { touched, events };
    }

    const { leaf, path } = this._findLeaf(key);

    if (leaf.keys.includes(key)) {
      events.push({ type: 'insert-duplicate', key });
      return { touched, events };
    }

    this._insertIntoLeaf(leaf, key, record);
    path.forEach(n => touched.add(n.id));

    if (leaf.keys.length > this.order - 1) {
      this._splitLeaf(leaf, path, events, touched);
    } else {
      events.push({ type: 'insert-simple', key });
    }

    return { touched, events };
  }

  _insertIntoLeaf(leaf, key, record) {
    let i = 0;
    while (i < leaf.keys.length && leaf.keys[i] < key) i++;
    leaf.keys.splice(i, 0, key);
    leaf.records.splice(i, 0, record);
  }

  _splitLeaf(leaf, path, events, touched) {
    this.stats.splits++;
    const mid = Math.ceil((this.order - 1) / 2);

    const newRight = BPlusNode.createLeaf();
    newRight.keys = leaf.keys.splice(mid);
    newRight.records = leaf.records.splice(mid);
    newRight.next = leaf.next;
    leaf.next = newRight;

    const upKey = newRight.keys[0];
    touched.add(leaf.id);
    touched.add(newRight.id);

    events.push({ type: 'split-leaf', upKey, left: leaf.id, right: newRight.id });

    this._insertIntoParent(path, leaf, upKey, newRight, events, touched);
  }

  _insertIntoParent(path, leftChild, upKey, rightChild, events, touched) {
    path = path.slice(0, -1); // quita el nodo que acaba de dividirse

    if (path.length === 0) {
      // leftChild era la raíz -> se crea nueva raíz interna
      const newRoot = BPlusNode.createInternal();
      newRoot.keys = [upKey];
      newRoot.children = [leftChild, rightChild];
      this.root = newRoot;
      touched.add(newRoot.id);
      events.push({ type: 'new-root', upKey });
      return;
    }

    const parent = path[path.length - 1];
    const childIdx = parent.indexOfChild(leftChild);
    parent.keys.splice(childIdx, 0, upKey);
    parent.children.splice(childIdx + 1, 0, rightChild);
    touched.add(parent.id);

    if (parent.keys.length > this.order - 1) {
      this._splitInternal(parent, path, events, touched);
    }
  }

  _splitInternal(node, path, events, touched) {
    this.stats.splits++;
    const mid = Math.floor((this.order - 1) / 2);
    const upKey = node.keys[mid];

    const newRight = BPlusNode.createInternal();
    newRight.keys = node.keys.splice(mid + 1);
    newRight.children = node.children.splice(mid + 1);
    node.keys.splice(mid, 1); // la clave promovida no se duplica (a diferencia de hojas)

    touched.add(node.id);
    touched.add(newRight.id);
    events.push({ type: 'split-internal', upKey, left: node.id, right: newRight.id });

    this._insertIntoParent(path, node, upKey, newRight, events, touched);
  }

  // ---------------------------------------------------------------------
  // DELETE
  // ---------------------------------------------------------------------
  remove(key) {
    this.stats.deletes++;
    const events = [];
    const touched = new Set();

    const { leaf, path } = this._findLeaf(key);
    const idx = leaf.keys.indexOf(key);

    if (idx < 0) {
      events.push({ type: 'delete-missing', key });
      return { touched, events };
    }

    leaf.keys.splice(idx, 1);
    leaf.records.splice(idx, 1);
    path.forEach(n => touched.add(n.id));
    events.push({ type: 'delete-ok', key });

    const minLeafKeys = Math.max(1, Math.ceil((this.order - 1) / 2) - 1);
    if (leaf !== this.root && leaf.keys.length < minLeafKeys) {
      this._handleUnderflow(leaf, path, events, touched);
    } else if (leaf === this.root && leaf.keys.length === 0) {
      events.push({ type: 'tree-empty' });
    }

    return { touched, events };
  }

  _handleUnderflow(node, path, events, touched) {
    const parentPath = path.slice(0, -1);
    if (parentPath.length === 0) return; // node es la raíz, no hay nada que rebalancear

    const parent = parentPath[parentPath.length - 1];
    const idx = parent.indexOfChild(node);
    const leftSib = idx > 0 ? parent.children[idx - 1] : null;
    const rightSib = idx < parent.children.length - 1 ? parent.children[idx + 1] : null;
    const minKeys = Math.max(1, Math.ceil((this.order - 1) / 2) - 1);

    if (node.leaf) {
      if (rightSib && rightSib.keys.length > minKeys) {
        node.keys.push(rightSib.keys.shift());
        node.records.push(rightSib.records.shift());
        parent.keys[idx] = rightSib.keys[0];
        touched.add(node.id); touched.add(rightSib.id); touched.add(parent.id);
        events.push({ type: 'borrow-right-leaf' });
        return;
      }
      if (leftSib && leftSib.keys.length > minKeys) {
        node.keys.unshift(leftSib.keys.pop());
        node.records.unshift(leftSib.records.pop());
        parent.keys[idx - 1] = node.keys[0];
        touched.add(node.id); touched.add(leftSib.id); touched.add(parent.id);
        events.push({ type: 'borrow-left-leaf' });
        return;
      }
      // fusión con hermana
      this.stats.merges++;
      if (rightSib) {
        node.keys = node.keys.concat(rightSib.keys);
        node.records = node.records.concat(rightSib.records);
        node.next = rightSib.next;
        parent.keys.splice(idx, 1);
        parent.children.splice(idx + 1, 1);
        touched.add(node.id); touched.add(parent.id);
        events.push({ type: 'merge-leaf-right' });
      } else if (leftSib) {
        leftSib.keys = leftSib.keys.concat(node.keys);
        leftSib.records = leftSib.records.concat(node.records);
        leftSib.next = node.next;
        parent.keys.splice(idx - 1, 1);
        parent.children.splice(idx, 1);
        touched.add(leftSib.id); touched.add(parent.id);
        events.push({ type: 'merge-leaf-left' });
      }
    } else {
      // fusión de nodos internos (versión simplificada, sin préstamo)
      this.stats.merges++;
      if (rightSib) {
        node.keys.push(parent.keys[idx]);
        node.keys = node.keys.concat(rightSib.keys);
        node.children = node.children.concat(rightSib.children);
        parent.keys.splice(idx, 1);
        parent.children.splice(idx + 1, 1);
        touched.add(node.id); touched.add(parent.id);
        events.push({ type: 'merge-internal-right' });
      } else if (leftSib) {
        leftSib.keys.push(parent.keys[idx - 1]);
        leftSib.keys = leftSib.keys.concat(node.keys);
        leftSib.children = leftSib.children.concat(node.children);
        parent.keys.splice(idx - 1, 1);
        parent.children.splice(idx, 1);
        touched.add(leftSib.id); touched.add(parent.id);
        events.push({ type: 'merge-internal-left' });
      }
    }

    // si la raíz se quedó con un solo hijo, reducir altura
    if (parent === this.root && parent.keys.length === 0) {
      this.root = parent.children[0];
      events.push({ type: 'root-shrink' });
      return;
    }

    if (parent.keys.length < minKeys && parent !== this.root) {
      this._handleUnderflow(parent, parentPath, events, touched);
    }
  }
}
