# Simulador de Árbol B+ — Mini Sistema de Archivos Conceptual

Proyecto Final · Manejo de Estructura de Datos · Opción C
Universidad de El Salvador, FMOcc — Ingeniería en Desarrollo de Software

## Cómo ejecutarlo

Abre `index.html` directamente en tu navegador (Chrome, Firefox o Edge).
No requiere instalación ni servidor: usa ES Modules nativos de JavaScript.

> **Nota:** algunos navegadores bloquean `import` de módulos si abres el
> archivo con doble clic (protocolo `file://`). Si ves la página en blanco
> o un error de CORS en la consola, sirve la carpeta con un servidor
> local simple, por ejemplo:
>
> ```bash
> cd bplustree-sim
> python -m http.server 8000
> ```
>
> y abre `http://localhost:8000` en el navegador.

## Arquitectura

El proyecto sigue una separación de capas inspirada en MVC, igual que
se pide en el requisito de "diseño modular basado en TAD":

```
bplustree-sim/
├── index.html              Shell — solo estructura HTML, sin lógica
├── css/
│   └── styles.css          Todo el diseño visual
├── js/
│   ├── core/                ── MODELO (el TAD puro) ──
│   │   ├── BPlusNode.js      Tipo Abstracto de Dato: nodo hoja/interno
│   │   └── BPlusTree.js      Algoritmos: insert, search, remove,
│   │                         split, merge — sin saber nada de SVG ni DOM
│   ├── render/               ── VISTA (cómo se dibuja) ──
│   │   ├── TreeLayout.js     Calcula posiciones (x, y) de cada nodo
│   │   └── SvgRenderer.js    Convierte el layout en código SVG
│   ├── ui/                   ── CONTROLADOR (interacción) ──
│   │   ├── ControlPanel.js   Botones, inputs, chips de archivos
│   │   ├── StatsPanel.js     Estadísticas y banner de Big-O
│   │   └── LogPanel.js       Traduce eventos del árbol a bitácora legible
│   ├── utils/
│   │   └── exportPng.js      Exporta el SVG actual como imagen PNG
│   └── main.js               Orquestador: conecta modelo + vista + UI
```


## Funcionalidad

- **Insertar** un archivo (clave) en el árbol, con división automática de
  nodos cuando se supera el orden configurado.
- **Buscar** un archivo, mostrando cuántos niveles recorrió.
- **Eliminar** un archivo, con préstamo o fusión de nodos cuando ocurre
  un desbordamiento por abajo (underflow).
- **Cambiar el orden (m)** del árbol en caliente, reiniciando la simulación.
- **Bitácora** de cada operación en lenguaje natural, lista para copiar
  como narrativa en el informe técnico.
- **Banner de complejidad Big-O**, con la altura real observada del árbol.
- **Exportar a PNG** el estado actual del árbol, en alta resolución (2x),
  para insertarlo directamente en Word o PowerPoint.

## Complejidades (resumen)

| Operación | Complejidad | Razón |
|---|---|---|
| Búsqueda | O(log_m n) | Se desciende un nivel por cada comparación, altura ≈ log_m n |
| Inserción | O(log_m n) | Igual que búsqueda, más posibles splits en cascada (acotados por la altura) |
| Eliminación | O(log_m n) | Igual que búsqueda, más posibles merges/préstamos en cascada |
| Recorrido secuencial completo | O(n) | Gracias al enlace entre hojas, sin volver a la raíz |
