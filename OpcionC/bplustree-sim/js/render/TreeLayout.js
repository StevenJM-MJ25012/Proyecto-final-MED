export class TreeLayout {
  constructor({ levelGap = 90, leafGap = 14, topMargin = 50 } = {}) {
    this.levelGap = levelGap;
    this.leafGap = leafGap;
    this.topMargin = topMargin;
  }

  /**
   * @param {BPlusTree} tree
   * @returns {{levels: BPlusNode[][], leafOrder: BPlusNode[], width: number, height: number}}
   */
  compute(tree) {
    const root = tree.root;
    const levels = [];

    (function collect(node, depth) {
      if (!levels[depth]) levels[depth] = [];
      levels[depth].push(node);
      if (!node.leaf) node.children.forEach(c => collect(c, depth + 1));
    })(root, 0);

    // orden de hojas vía lista enlazada (recorrido secuencial real del B+)
    const leafOrder = [];
    let ln = tree.firstLeaf();
    while (ln) { leafOrder.push(ln); ln = ln.next; }

    // ancho de cada hoja según cuántas claves contiene
    const leafWidths = {};
    leafOrder.forEach(l => {
      const w = Math.max(70, l.keys.length * 54 + 20);
      leafWidths[l.id] = w;
    });

    let cursor = 20;
    const leafX = {};
    leafOrder.forEach(l => {
      leafX[l.id] = cursor + leafWidths[l.id] / 2;
      cursor += leafWidths[l.id] + this.leafGap;
    });
    const width = cursor + 20;

    const setX = (node) => {
      if (node.leaf) {
        node._x = leafX[node.id];
        node._w = leafWidths[node.id];
        return node._x;
      }
      const xs = node.children.map(setX);
      node._x = (Math.min(...xs) + Math.max(...xs)) / 2;
      node._w = Math.max(60, node.keys.length * 46 + 20);
      return node._x;
    };
    setX(root);

    levels.forEach((lvl, depth) => {
      lvl.forEach(n => { n._y = this.topMargin + depth * this.levelGap; });
    });

    const maxDepth = levels.length - 1;
    const height = this.topMargin + maxDepth * this.levelGap + 36 + 60;

    return { levels, leafOrder, width: Math.max(width, 600), height };
  }
}
