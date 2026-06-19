export function exportSvgAsPng(svgElement, filename = 'arbol-bplus-estado.png', { scale = 2, background = '#ffffff' } = {}) {
  if (!svgElement) return;

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  const w = parseInt(svgElement.getAttribute('width'), 10);
  const h = parseInt(svgElement.getAttribute('height'), 10);

  img.onload = function () {
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);

    URL.revokeObjectURL(url);

    canvas.toBlob(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
    });
  };

  img.src = url;
}