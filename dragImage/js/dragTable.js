const tableResizer = document.getElementById('table-resizer');
const tableWrap = document.querySelector('.table-wrap');
const header = document.querySelector('.header');
const mainHeight = document.documentElement.offsetHeight - header.offsetHeight;
let startY, startHeight;

tableResizer.addEventListener('mousedown', initResizeTable);

function initResizeTable(e) {
  startY = e.clientY;
  startHeight = tableWrap.offsetHeight;
  document.addEventListener('mousemove', resizeTable);
  document.addEventListener('mouseup', stopResizeTable);
}

function resizeTable(e) {
  let newHeight = startHeight + (startY - e.clientY);
  newHeight = ( newHeight >= ( mainHeight / 2)) ? document.documentElement.offsetHeight : newHeight;
  tableWrap.style.height = newHeight + 'px';
}

function stopResizeTable() {
  document.removeEventListener('mousemove', resizeTable);
  document.removeEventListener('mouseup', stopResizeTable);
}
