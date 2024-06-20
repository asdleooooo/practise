const sidebarResizer = document.getElementById('sidebar-resizer');
const sidebar = document.querySelector('.sidebar');
let isResizing = false;

sidebarResizer.addEventListener('mousedown', function (e) {
    isResizing = true;
    document.addEventListener('mousemove', resizeSidebar);
    document.addEventListener('mouseup', stopResizing);
});

function resizeSidebar(e) {
    if (!isResizing) return;
    const newWidth = e.clientX;
    if (newWidth >= 150) { // Ensure the sidebar doesn't get too small
        sidebar.style.width = newWidth + 'px';
    }
}

function stopResizing() {
    isResizing = false;
    document.removeEventListener('mousemove', resizeSidebar);
    document.removeEventListener('mouseup', stopResizing);
}