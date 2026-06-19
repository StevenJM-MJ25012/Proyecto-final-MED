export class StatsPanel {
  constructor(statsHost, bigoHost) {
    this.statsHost = statsHost;
    this.bigoHost = bigoHost;
  }

  update(tree) {
    this._renderStats(tree);
    this._renderBigO(tree);
  }

  _renderStats(tree) {
    const h = tree.height();
    const leaves = this._countLeaves(tree);
    const files = tree.allKeysInOrder().length;
    const s = tree.stats;

    this.statsHost.innerHTML = `
      <div class="row"><span>Orden (m)</span><span class="v">${tree.order}</span></div>
      <div class="row"><span>Altura del árbol</span><span class="v">${h}</span></div>
      <div class="row"><span>Nodos hoja</span><span class="v">${leaves}</span></div>
      <div class="row"><span>Archivos almacenados</span><span class="v">${files}</span></div>
      <div class="row"><span>Inserciones realizadas</span><span class="v">${s.inserts}</span></div>
      <div class="row"><span>Divisiones (splits)</span><span class="v">${s.splits}</span></div>
      <div class="row"><span>Fusiones (merges)</span><span class="v">${s.merges}</span></div>
      <div class="row"><span>Búsquedas realizadas</span><span class="v">${s.searches}</span></div>
      <div class="row"><span>Eliminaciones</span><span class="v">${s.deletes}</span></div>
    `;
  }

  _renderBigO(tree) {
    const h = tree.height();
    this.bigoHost.innerHTML = `
      <div class="item"><div class="k">Búsqueda</div><div class="val">O(log<sub>m</sub> n)</div></div>
      <div class="item"><div class="k">Inserción</div><div class="val">O(log<sub>m</sub> n)</div></div>
      <div class="item"><div class="k">Eliminación</div><div class="val">O(log<sub>m</sub> n)</div></div>
      <div class="item"><div class="k">Recorrido secuencial (n archivos)</div><div class="val">O(n)</div></div>
      <div class="item"><div class="k">Altura actual observada</div><div class="val">h = ${h}</div></div>
    `;
  }

  _countLeaves(tree) {
    let n = tree.firstLeaf(), c = 0;
    while (n) { c++; n = n.next; }
    return c;
  }
}
