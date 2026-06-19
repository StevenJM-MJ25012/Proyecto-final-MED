export class SvgRenderer {
  constructor({
    internalColor = '#221f3b',
    leafColor = '#3aa6a0',
    touchedColor = '#6c4cf1',
    edgeColor = '#b9bce0',
    linkColor = '#c9b8fb',
    textColor = '#ffffff',
  } = {}) {
    this.internalColor = internalColor;
    this.leafColor = leafColor;
    this.touchedColor = touchedColor;
    this.edgeColor = edgeColor;
    this.linkColor = linkColor;
    this.textColor = textColor;
  }

  static escape(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  /**
   * @param {BPlusTree} tree
   * @param {{levels, leafOrder, width, height}} layout
   * @param {Set<string>} touchedIds - nodos a resaltar (última operación)
   */
  render(tree, layout, touchedIds = new Set()) {
    const { width: W, height: H, leafOrder } = layout;
    let svg = `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" style="font-family:'Poppins','Inter',sans-serif;">`;

    svg += this._drawParentEdges(tree.root);
    svg += this._drawLeafLinks(leafOrder);
    svg += this._drawAllNodes(tree.root, touchedIds);

    svg += `</svg>`;
    return svg;
  }

  _drawParentEdges(node) {
    let s = '';
    if (!node.leaf) {
      node.children.forEach(c => {
        s += `<line x1="${node._x}" y1="${node._y + 18}" x2="${c._x}" y2="${c._y - 18}" stroke="${this.edgeColor}" stroke-width="1.4"/>`;
        s += this._drawParentEdges(c);
      });
    }
    return s;
  }

  _drawLeafLinks(leafOrder) {
    let s = '';
    for (let i = 0; i < leafOrder.length - 1; i++) {
      const a = leafOrder[i], b = leafOrder[i + 1];
      s += `<path d="M ${a._x + a._w / 2} ${a._y} C ${a._x + a._w / 2 + 24} ${a._y + 34}, ${b._x - b._w / 2 - 24} ${b._y + 34}, ${b._x - b._w / 2} ${b._y}" fill="none" stroke="${this.linkColor}" stroke-width="1.2" stroke-dasharray="3,3"/>`;
    }
    return s;
  }

  _collectAll(node, acc = []) {
    acc.push(node);
    if (!node.leaf) node.children.forEach(c => this._collectAll(c, acc));
    return acc;
  }

  _drawAllNodes(root, touchedIds) {
    const flat = this._collectAll(root, []);
    let s = '';
    flat.forEach(n => {
      const touched = touchedIds.has(n.id);
      const fill = touched ? this.touchedColor : (n.leaf ? this.leafColor : this.internalColor);
      const w = n._w, x = n._x, y = n._y, h = 36;

      s += `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="3" fill="${fill}" stroke="#1c1b19" stroke-width="1"/>`;

      const seg = w / Math.max(n.keys.length, 1);
      n.keys.forEach((k, i) => {
        const cx = x - w / 2 + seg * i + seg / 2;
        if (i > 0) {
          s += `<line x1="${x - w / 2 + seg * i}" y1="${y - h / 2}" x2="${x - w / 2 + seg * i}" y2="${y + h / 2}" stroke="#00000055" stroke-width="1"/>`;
        }
        s += `<text x="${cx}" y="${y + 4}" font-size="${n.leaf ? 10 : 11}" fill="${this.textColor}" text-anchor="middle">${SvgRenderer.escape(k)}</text>`;
      });

      if (n.leaf) {
        s += `<text x="${x}" y="${y + h / 2 + 13}" font-size="9" fill="#5a567a" text-anchor="middle">hoja</text>`;
      }
    });
    return s;
  }
}