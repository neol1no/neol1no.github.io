document.addEventListener('DOMContentLoaded', () => {
    const codeEditor = CodeMirror.fromTextArea(document.getElementById('codeEditor'), {
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        extraKeys: {
            'Ctrl-Space': 'autocomplete'
        }
    });

    const consoleOutput = document.getElementById('consoleOutput');
    const statusMessage = document.getElementById('statusMessage');
    const runButton = document.getElementById('runButton');
    const clearCodeButton = document.getElementById('clearCode');
    const clearConsoleButton = document.getElementById('clearConsole');
    const loadExampleButton = document.getElementById('loadExample');

    const exampleCode = `// Example: Working with arrays and objects
const numbers = [1, 2, 3, 4, 5];

// Map example
const doubled = numbers.map(n => n * 2);
console.log('Doubled numbers:', doubled);

// Filter example
const evenNumbers = numbers.filter(n => n % 2 === 0);
console.log('Even numbers:', evenNumbers);

// Reduce example
const sum = numbers.reduce((acc, curr) => acc + curr, 0);
console.log('Sum of numbers:', sum);

// Object example
const person = {
    name: 'John',
    age: 30,
    hobbies: ['reading', 'coding', 'gaming']
};

console.log('Person object:', person);
console.log('Person name:', person.name);
console.log('Person hobbies:', person.hobbies.join(', '));`;

    const forbiddenKeywords = [
        'eval', 'Function', 'setTimeout', 'setInterval', 'fetch', 'XMLHttpRequest',
        'WebSocket', 'Worker', 'importScripts', 'document.write', 'localStorage',
        'sessionStorage', 'indexedDB', 'crypto', 'atob', 'btoa', 'import', 'export',
        'require', 'process', 'window', 'global', 'this', 'self', 'top', 'parent',
        'frames', 'opener', 'navigator', 'location', 'history', 'screen', 'alert',
        'confirm', 'prompt', 'print', 'debugger', 'console.clear', 'console.profile',
        'console.profileEnd', 'console.time', 'console.timeEnd', 'console.timeLog',
        'console.trace', 'console.warn', 'console.error', 'console.info',
        'console.debug', 'console.dir', 'console.dirxml', 'console.group',
        'console.groupCollapsed', 'console.groupEnd', 'console.table', 'console.count',
        'console.countReset', 'console.assert', 'console.timeStamp', 'console.memory',
        'github', 'github.io', 'githubusercontent', 'raw.githubusercontent',
        'blob', 'raw', 'api.github', 'gist', 'gist.github', 'github.com',
        'postMessage', 'message', 'origin', 'domain', 'referrer', 'referer',
        'cookie', 'document.cookie', 'document.domain', 'document.referrer',
        'performance', 'performance.now', 'performance.memory',
        'requestAnimationFrame', 'cancelAnimationFrame',
        'requestIdleCallback', 'cancelIdleCallback',
        'MutationObserver', 'IntersectionObserver', 'ResizeObserver',
        'CustomEvent', 'EventSource', 'BroadcastChannel',
        'SharedWorker', 'ServiceWorker', 'Cache', 'CacheStorage',
        'Notification', 'PushManager', 'PushSubscription',
        'getUserMedia', 'mediaDevices', 'RTCPeerConnection',
        'webkit', 'moz', 'ms', '__proto__', 'prototype', 'constructor'
    ];

    const MAX_EXECUTION_TIME = 2000; 
    const MAX_CODE_LENGTH = 10000; 
    const MAX_CONSOLE_LINES = 100;
    let consoleLineCount = 0;

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }

    function checkCodeLength(code) {
        if (code.length > MAX_CODE_LENGTH) {
            throw new Error(`Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`);
        }
    }

    function resetConsoleLineCount() {
        consoleLineCount = 0;
    }

    function addConsoleLine(content, type = 'log') {
        if (consoleLineCount >= MAX_CONSOLE_LINES) {
            addConsoleLine('Console output limit reached. Clearing console...', 'warn');
            clearConsole();
            return;
        }
        consoleLineCount++;

        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        
        const timestamp = document.createElement('span');
        timestamp.className = 'timestamp';
        timestamp.textContent = new Date().toLocaleTimeString();
        
        const contentSpan = document.createElement('span');
        contentSpan.className = 'content';
        
        if (typeof content === 'object') {
            try {
                const safeStringify = (obj, depth = 0) => {
                    if (depth > 3) return '[Object]';
                    if (Array.isArray(obj)) {
                        if (obj.length > 100) return `[Array(${obj.length})]`;
                        return `[${obj.slice(0, 100).map(item => safeStringify(item, depth + 1)).join(', ')}]`;
                    }
                    if (obj === null) return 'null';
                    if (typeof obj === 'object') {
                        const entries = Object.entries(obj).slice(0, 10);
                        return `{${entries.map(([k, v]) => `${k}: ${safeStringify(v, depth + 1)}`).join(', ')}}`;
                    }
                    return String(obj);
                };
                contentSpan.textContent = safeStringify(content);
            } catch (e) {
                contentSpan.textContent = '[Object]';
            }
        } else {
            const str = String(content);
            contentSpan.textContent = str.length > 1000 ? str.slice(0, 1000) + '...' : str;
        }
        
        line.appendChild(timestamp);
        line.appendChild(contentSpan);
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function checkForbiddenKeywords(code) {
        const regex = new RegExp(`\\b(${forbiddenKeywords.join('|')})\\b`, 'g');
        const matches = code.match(regex);
        if (matches) {
            throw new Error(`Forbidden keywords detected: ${matches.join(', ')}`);
        }
    }

    function createSafeConsole() {
        const safeConsole = {
            log: (...args) => {
                args.forEach(arg => addConsoleLine(arg, 'log'));
            },
            info: (...args) => {
                args.forEach(arg => addConsoleLine(arg, 'info'));
            },
            warn: (...args) => {
                args.forEach(arg => addConsoleLine(arg, 'warn'));
            },
            error: (...args) => {
                args.forEach(arg => addConsoleLine(arg, 'error'));
            }
        };

        Object.defineProperties(safeConsole, {
            log: { configurable: false, writable: false },
            info: { configurable: false, writable: false },
            warn: { configurable: false, writable: false },
            error: { configurable: false, writable: false }
        });

        return Object.freeze(safeConsole);
    }

    function runCode() {
        const code = codeEditor.getValue();
        if (!code.trim()) {
            showStatus('Please enter some code to run', 'error');
            return;
        }

        try {
            checkCodeLength(code);
            checkForbiddenKeywords(code);
            resetConsoleLineCount();
            
            const safeConsole = createSafeConsole();
            
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Execution timeout')), MAX_EXECUTION_TIME);
            });

            const sandbox = {
                console: safeConsole,
                Math: Object.freeze(Math),
                JSON: Object.freeze(JSON),
                Array: Object.freeze(Array),
                String: Object.freeze(String),
                Number: Object.freeze(Number),
                Boolean: Object.freeze(Boolean),
                Date: Object.freeze(Date),
                RegExp: Object.freeze(RegExp),
                Object: Object.freeze(Object),
                Symbol: Object.freeze(Symbol),
                Map: Object.freeze(Map),
                Set: Object.freeze(Set),
                WeakMap: Object.freeze(WeakMap),
                WeakSet: Object.freeze(WeakSet),
                Promise: Object.freeze(Promise),
                Error: Object.freeze(Error),
                TypeError: Object.freeze(TypeError),
                ReferenceError: Object.freeze(ReferenceError),
                SyntaxError: Object.freeze(SyntaxError),
                RangeError: Object.freeze(RangeError),
                EvalError: Object.freeze(EvalError),
                URIError: Object.freeze(URIError)
            };

            const executionPromise = new Promise((resolve) => {
                const safeEval = new Function('sandbox', `
                    with (sandbox) {
                        try {
                            ${code}
                        } catch (e) {
                            console.error(e.message);
                        }
                    }
                `);
                safeEval(sandbox);
                resolve();
            });

            Promise.race([executionPromise, timeoutPromise])
                .then(() => {
                    showStatus('Code executed successfully!', 'success');
                })
                .catch((error) => {
                    addConsoleLine(error.message, 'error');
                    showStatus('Error during execution', 'error');
                });

        } catch (error) {
            addConsoleLine(error.message, 'error');
            showStatus('Error during execution', 'error');
        }
    }

    function clearCode() {
        codeEditor.setValue('');
        showStatus('Code editor cleared', 'success');
    }

    function clearConsole() {
        consoleOutput.innerHTML = '';
        showStatus('Console cleared', 'success');
    }

    function loadExample() {
        codeEditor.setValue(exampleCode);
        showStatus('Example code loaded', 'success');
    }

    runButton.addEventListener('click', runCode);
    clearCodeButton.addEventListener('click', clearCode);
    clearConsoleButton.addEventListener('click', clearConsole);
    loadExampleButton.addEventListener('click', loadExample);

    codeEditor.setOption('extraKeys', {
        'Ctrl-Enter': runCode,
        'Ctrl-Space': 'autocomplete'
    });
}); 