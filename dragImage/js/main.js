document.addEventListener('DOMContentLoaded', () => {
    // 右边部分
    const canvasContainer = document.getElementById('canvas-container');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const xInput = document.getElementById('x');
    const yInput = document.getElementById('y');
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');
    const getCoordinates = document.getElementById('get-coordinates');
    const resetButton = document.getElementById('reset');
    const form = document.getElementById('hotspot-form');
    const tableBody = document.querySelector('#hotspot-table tbody');
    const statusMessage = document.getElementById('status-message');
    // const imageSelector = document.getElementById('image-selector');

    // 记录从JSON文件钟获取到的数据
    let dataOfFetch = {};
    let image = new Image();
    let scale = 1;
    let hotspots = [];
    let offsetX = 0, offsetY = 0;
    let isDragging = false;
    let startX, startY;
    let initialWidth, initialHeight;
    let isCapturingCoordinates = false;
    let highlightedHotspotLabel = null; // 高亮的热点标签
    let previouslyHighlightedRow = null;

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);
        ctx.drawImage(image, 0, 0);
        hotspots.forEach(hotspot => {
            const centerX = hotspot.x;
            const centerY = hotspot.y;
            if (highlightedHotspotLabel == hotspot.label) {
                ctx.fillStyle = '#f9d8d1'; // 背景#f9d8d1
                ctx.strokeStyle = '#f9d8d1'; // 边框#f9d8d1
            } else {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.strokeStyle = 'blue';
            }
            ctx.fillRect(centerX, centerY, 50, 50);
            ctx.lineWidth = 2;
            ctx.strokeRect(centerX, centerY, 50, 50);
            if (highlightedHotspotLabel != hotspot.label) {
                ctx.fillStyle = 'blue';
                ctx.font = 'bold 30px Arial';
                ctx.fillText(hotspot.label, centerX + 15, centerY + 35);
            }
        });
        ctx.restore();
    };

    const getMousePos = (e) => {
        const rect = canvasContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const r = initialWidth / rect.width;
        const imgX = (mouseX - offsetX / r) / scale * r;
        const imgY = (mouseY - offsetY / r) / scale * r;
        return { x: imgX, y: imgY };
    };

    const getHotspotAtPosition = (x, y) => {
        return hotspots.find(hotspot => {
            return x >= hotspot.x && x <= hotspot.x + 50 && y >= hotspot.y && y <= hotspot.y + 50;
        });
    };

    const resetHighlight = () => {
        highlightedHotspotLabel = null;
        if (previouslyHighlightedRow) {
            previouslyHighlightedRow.style.backgroundColor = '';
            previouslyHighlightedRow = null;
        }
        draw();
    };

    const highlightHotspots = (label) => {
        highlightedHotspotLabel = label;
        draw();
        highlightTableRow(label);
    };

    canvas.addEventListener('mousedown', (e) => {
        if (isCapturingCoordinates) {
            const { x, y } = getMousePos(e);
            xInput.value = x.toFixed(0);
            yInput.value = y.toFixed(0);
            isCapturingCoordinates = false;
            statusMessage.textContent = '';
        } else {
            const { x, y } = getMousePos(e);
            const hotspot = getHotspotAtPosition(x, y);
            if (hotspot) {
                // 如果点击的是已经高亮的热点，就取消高亮
                if (highlightedHotspotLabel === hotspot.label) {
                    resetHighlight();
                    // 恢复所有与热点标签一致的行的背景颜色
                    resetTableRowHighlight(hotspot.label);
                } else {
                    // 高亮当前点击的热点和所有相同label的热点
                    highlightHotspots(hotspot.label);
                }
            } else {
                isDragging = true;
                startX = e.clientX - offsetX;
                startY = e.clientY - offsetY;
                statusMessage.textContent = 'The picture is being dragged...';
            }
        }
    });

    canvas.addEventListener('mousemove', (e) => {
        if (isDragging) {
            offsetX = e.clientX - startX;
            offsetY = e.clientY - startY;
            draw();
        }
        if (isCapturingCoordinates) {
            const { x, y } = getMousePos(e);
            xInput.value = x.toFixed(0);
            yInput.value = x.toFixed(0);
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            statusMessage.textContent = '';
        }
    });

    canvas.addEventListener('mouseleave', () => {
        if (isCapturingCoordinates) {
            statusMessage.textContent = 'Positioning...';
        }
    });

    canvas.addEventListener('mouseenter', () => {
        if (isCapturingCoordinates) {
            statusMessage.textContent = 'Positioning...';
        }
    });

    // 滚轮放缩
    canvas.addEventListener('wheel', function (e) {
        e.preventDefault();

        if (e.deltaY < 0) {
            if (scale > 5) return;
            scale *= 1.1;
        } else {
            if (scale < 1) return;
            scale /= 1.1;
        }
        draw();
    });

    zoomInButton.addEventListener('click', () => {
        scale = Math.min(scale + 0.1, 5);
        draw();
    });

    zoomOutButton.addEventListener('click', () => {
        scale = Math.max(scale - 0.1, 1);
        draw();
    });

    resetButton.addEventListener('click', () => {
        scale = 1;
        offsetX = 0;
        offsetY = 0;
        xInput.value = '';
        yInput.value = '';
        draw();
    });

    getCoordinates.addEventListener('click', () => {
        isCapturingCoordinates = !isCapturingCoordinates;
        if (isCapturingCoordinates) {
            statusMessage.textContent = 'Positioning...';
            statusMessage.style.color = 'green';
        } else {
            statusMessage.textContent = '';
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const label = form.label.value;
        const des = form.des.value;
        const x = parseInt(form.x.value, 10);
        const y = parseInt(form.y.value, 10);

        const hotspot = { label, des, x, y };
        hotspots.push(hotspot);
        draw();
        saveHotspotsToSession();

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${label}</td>
            <td>${des}</td>
            <td>${x}</td>
            <td>${y}</td>
            <td><button data-label="${label}">delete</button></td>
        `;
        tableBody.appendChild(row);

        row.querySelector('button').addEventListener('click', () => {
            hotspots = hotspots.filter(h => h.label !== label);
            draw();
            saveHotspotsToSession();
            tableBody.removeChild(row);
        });

        if (highlightedHotspotLabel == label) {
            highlightHotspots(label);
        }

        form.reset();
    });

    const loadHotspots = (numbers) => {
        hotspots = numbers.map(num => ({
            label: num.numberValue,
            des: num.description,
            x: parseInt(num.coordinateX, 10),
            y: parseInt(num.coordinateY, 10)
        }));

        updateTable();
        draw();
    };

    const updateTable = () => {
        tableBody.innerHTML = '';
        hotspots.forEach(hotspot => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${hotspot.label}</td>
                <td>${hotspot.des}</td>
                <td>${hotspot.x}</td>
                <td>${hotspot.y}</td>
                <td><button data-label="${hotspot.label}">delete</button></td>
            `;
            tableBody.appendChild(row);

            row.querySelector('button').addEventListener('click', () => {
                hotspots = hotspots.filter(h => h.label !== hotspot.label);
                draw();
                saveHotspotsToSession();
                tableBody.removeChild(row);
            });
        });
    };

    const saveHotspotsToSession = () => {
        const imageKey = image.src;
        sessionStorage.setItem(imageKey, JSON.stringify(hotspots));
    };

    const loadHotspotsFromSession = (imageKey) => {
        const storedHotspots = sessionStorage.getItem(imageKey);
        if (storedHotspots) {
            hotspots = JSON.parse(storedHotspots);
            updateTable();
            draw();
        }
    };

    const highlightTableRow = (label) => {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            if (row.querySelector('td').textContent == label) {
                // 高亮当前行
                row.style.backgroundColor = '#f9d8d1';
                previouslyHighlightedRow = row;
            } else {
                // 重置其他行的背景颜色
                row.style.backgroundColor = '';
            }
        });
    };

    const resetTableRowHighlight = (label) => {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
            if (row.querySelector('td').textContent == label) {
                row.style.backgroundColor = '';
            }
        });
    };

    // 替换此处为从后端获取的JSON文件路径
    fetch('./data/bom.json')
        .then(response => response.json())
        .then(data => {
            dataOfFetch = data;
            if (data.length > 0) {
                const initialImage = data[0];
                image.src = initialImage.filePath;
                image.onload = () => {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    initialWidth = canvas.width;
                    initialHeight = canvas.height;
                    loadHotspots(initialImage.numbers);
                };
                loadHotspotsFromSession(initialImage.filePath);
            }
        })
        .catch(error => console.error('Load json error:', error));

    // 左边部分

    const jsonData = [
        {
            title: "WEIBANG",
            options: [
                { text: "Aspirafoglie", href: "#" },
                {
                    text: "Service Code LV506C1800 -WEIBANG", href: "#", options: [
                        {
                            text: "Esplosi", href: "#", options: [
                                { text: "1.impugnature e sacco", href: "/image.png" },
                                { text: "2.learn", href: "/image1.png" },
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    function createMenu(data, parentElement, level = 1, rootTitle = '') {
        data.forEach(item => {
            const menuItem = document.createElement('li');
            menuItem.classList.add('menu-item');

            const menuTitle = document.createElement('a');
            menuTitle.classList.add('menu-title');
            menuTitle.textContent = item.title || item.text;
            menuTitle.href = item.href || '#';
            menuTitle.dataset.level = level;
            menuTitle.dataset.root = rootTitle;
            menuTitle.addEventListener('click', (event) => {
                event.preventDefault();
                handleMenuClick(event, level, rootTitle);
            });

            // 添加图标
            const icon = document.createElement('img');
            icon.classList.add('menu-icon');
            if (item.options) {
                icon.src = '../images/sideBar/folder.svg';
                if (level === 3) {
                    icon.src = '../images/sideBar/arrow-up.svg';
                }
            } else {
                icon.src = '../images/sideBar/file.svg';
            }
            menuTitle.prepend(icon);

            const submenu = document.createElement('ul');
            submenu.classList.add('submenu', `submenu-level-${level}`);

            if (item.options) {
                createMenu(item.options, submenu, level + 1, rootTitle || item.title);
            }

            menuItem.appendChild(menuTitle);
            if (item.options) {
                menuItem.appendChild(submenu);
            }
            parentElement.appendChild(menuItem);
        });
    }

    function handleMenuClick(event, level, rootTitle) {
        const menuItem = event.target.closest('li');
        const submenu = menuItem.querySelector('.submenu');

        if (!submenu || submenu.children.length === 0) {
            const rootMenu = menuItem.closest('.root-menu');
            const selectedImage = new URL(event.target.href).pathname;
            const selectedData = dataOfFetch.find(imgData => imgData.filePath === selectedImage);
            if (selectedData) {
                image.src = selectedImage;
                image.onload = () => {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    initialWidth = canvas.width;
                    initialHeight = canvas.height;
                    offsetX = 0;
                    offsetY = 0;
                    scale = 1;
                    loadHotspots(selectedData.numbers);
                };
                loadHotspotsFromSession(selectedImage);
            }

            resetFileSelection(rootMenu, rootTitle);

            event.target.classList.add('selected-file');
            return;
        }

        toggleSubmenu(submenu);

        if (level === 2) {
            event.target.classList.toggle('level-2-active');
        } else if (level === 3) {
            event.target.classList.toggle('level-3-active');
            const arrowIcon = event.target.querySelector('.menu-icon');
            if (submenu.style.display === 'block') {
                arrowIcon.src = '../images/sideBar/arrow-down.svg';
            } else {
                arrowIcon.src = '../images/sideBar/arrow-up.svg';
            }
        }
    }

    function toggleSubmenu(submenu) {
        if (submenu.style.display === 'block') {
            submenu.style.display = 'none';
        } else {
            submenu.style.display = 'block';
        }
    }

    function resetFileSelection(rootMenu, rootTitle) {
        Array.from(rootMenu.querySelectorAll('.menu-title')).forEach(item => {
            if (item.dataset.root === rootTitle && !item.nextElementSibling) {
                item.classList.remove('selected-file');
            }
        });
    }
    
    const menu = document.getElementById('menu');
    createMenu(jsonData, menu, 1);
});


