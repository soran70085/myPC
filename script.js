class PCSimulator {
    constructor() {
        this.windows = [];
        this.zIndexCounter = 1000;
        this.windowCounter = 0;
        this.initializeEventListeners();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    initializeEventListeners() {
        // デスクトップアイコン
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', (e) => {
                const appType = e.currentTarget.dataset.app;
                this.openWindow(appType);
            });
        });

        // タスクバーアプリボタン
        document.querySelectorAll('.taskbar-app').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appType = e.currentTarget.dataset.app;
                this.openWindow(appType);
            });
        });
    }

    openWindow(appType) {
        const windowId = `window-${appType}-${this.windowCounter++}`;
        let windowElement = this.createWindow(appType, windowId);
        
        document.getElementById('windowsContainer').appendChild(windowElement);
        this.windows.push({
            id: windowId,
            type: appType,
            element: windowElement,
            isDragging: false,
            offsetX: 0,
            offsetY: 0
        });

        this.makeWindowDraggable(windowElement);
        this.focusWindow(windowId);
    }

    createWindow(appType, windowId) {
        const window = document.createElement('div');
        window.id = windowId;
        window.className = `window ${appType}`;
        window.style.left = (50 + this.windowCounter * 20) + 'px';
        window.style.top = (50 + this.windowCounter * 20) + 'px';
        window.style.width = this.getWindowSize(appType).width + 'px';
        window.style.height = this.getWindowSize(appType).height + 'px';

        const header = document.createElement('div');
        header.className = 'window-header';

        const title = document.createElement('div');
        title.className = 'window-header-title';
        title.textContent = this.getWindowTitle(appType);

        const controls = document.createElement('div');
        controls.className = 'window-controls';

        const minimizeBtn = document.createElement('button');
        minimizeBtn.className = 'window-btn minimize';
        minimizeBtn.textContent = '−';
        minimizeBtn.onclick = (e) => {
            e.stopPropagation();
            window.style.display = 'none';
        };

        const maximizeBtn = document.createElement('button');
        maximizeBtn.className = 'window-btn maximize';
        maximizeBtn.textContent = '□';
        maximizeBtn.onclick = (e) => {
            e.stopPropagation();
            if (window.dataset.maximized) {
                window.style.width = this.getWindowSize(appType).width + 'px';
                window.style.height = this.getWindowSize(appType).height + 'px';
                window.style.left = '50px';
                window.style.top = '50px';
                delete window.dataset.maximized;
            } else {
                window.style.width = '100%';
                window.style.height = 'calc(100% - 50px)';
                window.style.left = '0';
                window.style.top = '0';
                window.dataset.maximized = true;
            }
        };

        const closeBtn = document.createElement('button');
        closeBtn.className = 'window-btn close';
        closeBtn.textContent = '×';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            window.remove();
            this.windows = this.windows.filter(w => w.id !== windowId);
        };

        controls.appendChild(minimizeBtn);
        controls.appendChild(maximizeBtn);
        controls.appendChild(closeBtn);

        header.appendChild(title);
        header.appendChild(controls);
        window.appendChild(header);

        const content = document.createElement('div');
        content.className = 'window-content';
        content.innerHTML = this.getWindowContent(appType);
        window.appendChild(content);

        window.addEventListener('mousedown', () => this.focusWindow(windowId));

        // アプリ固有のイベントリスナー
        this.attachAppListeners(appType, window);

        return window;
    }

    getWindowTitle(appType) {
        const titles = {
            explorer: 'My Computer',
            notepad: 'Notepad',
            browser: 'Web Browser',
            terminal: 'Terminal',
            calculator: 'Calculator'
        };
        return titles[appType] || 'Window';
    }

    getWindowSize(appType) {
        const sizes = {
            explorer: { width: 500, height: 400 },
            notepad: { width: 600, height: 450 },
            browser: { width: 800, height: 600 },
            terminal: { width: 700, height: 500 },
            calculator: { width: 350, height: 400 }
        };
        return sizes[appType] || { width: 400, height: 300 };
    }

    getWindowContent(appType) {
        const contents = {
            explorer: this.getExplorerContent(),
            notepad: this.getNotepadContent(),
            browser: this.getBrowserContent(),
            terminal: this.getTerminalContent(),
            calculator: this.getCalculatorContent()
        };
        return contents[appType] || '<p>Application</p>';
    }

    getExplorerContent() {
        return `
            <div class="file-item">
                <span class="file-item-icon">🖥️</span>
                <span class="file-item-name">Local Disk (C:)</span>
            </div>
            <div class="file-item">
                <span class="file-item-icon">📁</span>
                <span class="file-item-name">Users</span>
            </div>
            <div class="file-item">
                <span class="file-item-icon">📁</span>
                <span class="file-item-name">Program Files</span>
            </div>
            <div class="file-item">
                <span class="file-item-icon">📁</span>
                <span class="file-item-name">Windows</span>
            </div>
            <div class="file-item">
                <span class="file-item-icon">📄</span>
                <span class="file-item-name">README.txt</span>
            </div>
        `;
    }

    getNotepadContent() {
        return `<textarea class="notepad-textarea" placeholder="Type here..."></textarea>`;
    }

    getBrowserContent() {
        return `
            <div class="browser-navbar">
                <button class="browser-btn">← Back</button>
                <button class="browser-btn">Forward →</button>
                <button class="browser-btn">⟳ Refresh</button>
                <input type="text" class="browser-url" value="https://example.com" placeholder="Enter URL...">
            </div>
            <div class="browser-content">
                <h2>Welcome to Web Browser</h2>
                <p>This is a simulated web browser. Type a URL above to navigate.</p>
                <h3>Available Pages:</h3>
                <ul>
                    <li>https://example.com - Example Page</li>
                    <li>https://google.com - Search</li>
                    <li>https://github.com - GitHub</li>
                </ul>
            </div>
        `;
    }

    getTerminalContent() {
        return `
            <div class="terminal-output" id="terminalOutput">C:\\Users\\Admin> _</div>
            <input type="text" class="terminal-input" id="terminalInput" placeholder="Enter command...">
        `;
    }

    getCalculatorContent() {
        return `
            <div class="calculator-display" id="calcDisplay">0</div>
            <div class="calculator">
                <button class="calc-btn">7</button>
                <button class="calc-btn">8</button>
                <button class="calc-btn">9</button>
                <button class="calc-btn operator">/</button>
                
                <button class="calc-btn">4</button>
                <button class="calc-btn">5</button>
                <button class="calc-btn">6</button>
                <button class="calc-btn operator">*</button>
                
                <button class="calc-btn">1</button>
                <button class="calc-btn">2</button>
                <button class="calc-btn">3</button>
                <button class="calc-btn operator">-</button>
                
                <button class="calc-btn">0</button>
                <button class="calc-btn">.</button>
                <button class="calc-btn operator">=</button>
                <button class="calc-btn operator">+</button>
            </div>
        `;
    }

    attachAppListeners(appType, windowElement) {
        if (appType === 'terminal') {
            const input = windowElement.querySelector('#terminalInput');
            input?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.executeTerminalCommand(input.value, windowElement);
                    input.value = '';
                }
            });
        } else if (appType === 'calculator') {
            this.initializeCalculator(windowElement);
        }
    }

    executeTerminalCommand(command, windowElement) {
        const output = windowElement.querySelector('#terminalOutput');
        const response = this.getTerminalResponse(command.toLowerCase().trim());
        output.textContent += `\n${command}\n${response}\nC:\\Users\\Admin> `;
        windowElement.querySelector('.window-content').scrollTop = windowElement.querySelector('.window-content').scrollHeight;
    }

    getTerminalResponse(command) {
        const responses = {
            'dir': 'Volume in drive C is System\nDirectory of C:\\\n 2024/06/15  10:30 AM    <DIR>  Users\n 2024/06/15  10:30 AM    <DIR>  Windows\n 2024/06/15  10:30 AM    <DIR>  Program Files',
            'ipconfig': 'Windows IP Configuration\n\nEthernet adapter Ethernet:\nConnection-specific DNS Suffix  . : \nIPv4 Address. . . . . . . . . . . : 192.168.1.100\nSubnet Mask . . . . . . . . . . . : 255.255.255.0\nDefault Gateway . . . . . . . . . : 192.168.1.1',
            'help': 'Available commands:\ndir - List directory contents\nipconfig - Show network configuration\ndate - Show current date and time\necho - Print text\nclear - Clear screen\nhelp - Show this help',
            'date': new Date().toLocaleString(),
            'echo': (cmd) => cmd.replace('echo ', ''),
            'clear': '',
            'whoami': 'ADMIN\\User'
        };

        const commandName = command.split(' ')[0];
        return responses[commandName] || 'Command not recognized. Type "help" for available commands.';
    }

    initializeCalculator(windowElement) {
        let currentValue = '0';
        let previousValue = '';
        let operation = null;
        const display = windowElement.querySelector('#calcDisplay');

        const buttons = windowElement.querySelectorAll('.calc-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const value = btn.textContent;

                if (value === '=') {
                    if (operation && previousValue) {
                        currentValue = this.performCalculation(parseFloat(previousValue), parseFloat(currentValue), operation);
                        display.textContent = currentValue;
                        previousValue = '';
                        operation = null;
                    }
                } else if (['+', '-', '*', '/'].includes(value)) {
                    if (previousValue && currentValue && operation) {
                        currentValue = this.performCalculation(parseFloat(previousValue), parseFloat(currentValue), operation);
                    }
                    previousValue = currentValue;
                    currentValue = '0';
                    operation = value;
                } else if (value === '.') {
                    if (!currentValue.includes('.')) {
                        currentValue += '.';
                    }
                } else {
                    currentValue = currentValue === '0' ? value : currentValue + value;
                }

                display.textContent = currentValue;
            });
        });
    }

    performCalculation(prev, current, operation) {
        switch (operation) {
            case '+': return prev + current;
            case '-': return prev - current;
            case '*': return prev * current;
            case '/': return prev / current;
            default: return current;
        }
    }

    makeWindowDraggable(windowElement) {
        const header = windowElement.querySelector('.window-header');
        let offsetX = 0;
        let offsetY = 0;

        header.addEventListener('mousedown', (e) => {
            offsetX = e.clientX - windowElement.offsetLeft;
            offsetY = e.clientY - windowElement.offsetTop;

            const mouseMoveHandler = (moveEvent) => {
                windowElement.style.left = (moveEvent.clientX - offsetX) + 'px';
                windowElement.style.top = (moveEvent.clientY - offsetY) + 'px';
            };

            const mouseUpHandler = () => {
                document.removeEventListener('mousemove', mouseMoveHandler);
                document.removeEventListener('mouseup', mouseUpHandler);
            };

            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        });
    }

    focusWindow(windowId) {
        this.windows.forEach(w => w.element.classList.remove('active'));
        const window = this.windows.find(w => w.id === windowId);
        if (window) {
            window.element.classList.add('active');
            window.element.style.zIndex = ++this.zIndexCounter;
        }
    }

    updateClock() {
        const clock = document.getElementById('clock');
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        clock.textContent = `${hours}:${minutes}`;
    }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    new PCSimulator();
});
