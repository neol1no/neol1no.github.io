document.addEventListener('DOMContentLoaded', () => {
    const sourceEditor = CodeMirror.fromTextArea(document.getElementById('sourceEditor'), {
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

    const outputEditor = CodeMirror.fromTextArea(document.getElementById('outputEditor'), {
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        readOnly: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
    });

    const exampleCode = `function calculateTotal(items) {
    let total = 0;
    for (let item of items) {
        if (item.price && item.quantity) {
            total += item.price * item.quantity;
        }
    }
    return total;
}

const items = [
    { name: 'Product 1', price: 10.99, quantity: 2 },
    { name: 'Product 2', price: 24.99, quantity: 1 },
    { name: 'Product 3', price: 5.99, quantity: 3 }
];

console.log('Total:', calculateTotal(items));`;

    const statusMessage = document.getElementById('statusMessage');
    const obfuscateButton = document.getElementById('obfuscateButton');
    const clearSourceButton = document.getElementById('clearSource');
    const loadExampleButton = document.getElementById('loadExample');
    const copyOutputButton = document.getElementById('copyOutput');
    const downloadOutputButton = document.getElementById('downloadOutput');
    const uploadFileButton = document.getElementById('uploadFile');
    const fileInput = document.getElementById('fileInput');

    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        statusMessage.style.display = 'block';
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }

    function getObfuscationOptions() {
        return {
            compact: true,
            controlFlowFlattening: document.getElementById('controlFlow').checked,
            controlFlowFlatteningThreshold: parseFloat(document.getElementById('controlFlowComplexity').value) / 3,
            deadCodeInjection: document.getElementById('deadCode').checked,
            deadCodeInjectionThreshold: 0.4,
            debugProtection: document.getElementById('debugProtection').checked,
            debugProtectionInterval: 2000,
            disableConsoleOutput: true,
            identifierNamesGenerator: 'hexadecimal',
            identifiersPrefix: '_0x',
            log: false,
            numbersToExpressions: true,
            renameGlobals: false,
            selfDefending: document.getElementById('selfDefending').checked,
            simplify: true,
            splitStrings: true,
            splitStringsChunkLength: 10,
            stringArray: document.getElementById('stringArray').checked,
            stringArrayCallsTransform: true,
            stringArrayCallsTransformThreshold: 0.75,
            stringArrayEncoding: ['base64'],
            stringArrayIndexShift: true,
            stringArrayRotate: true,
            stringArrayShuffle: true,
            stringArrayWrappersCount: 2,
            stringArrayWrappersChainedCalls: true,
            stringArrayWrappersParametersMaxCount: 4,
            stringArrayWrappersType: 'function',
            stringArrayThreshold: parseFloat(document.getElementById('stringArrayThreshold').value),
            transformObjectKeys: true,
            unicodeEscapeSequence: false
        };
    }

    function obfuscateCode() {
        const sourceCode = sourceEditor.getValue();
        if (!sourceCode.trim()) {
            showStatus('Please enter some code to obfuscate', 'error');
            return;
        }

        try {
            const obfuscatedCode = JavaScriptObfuscator.obfuscate(sourceCode, getObfuscationOptions()).getObfuscatedCode();
            outputEditor.setValue(obfuscatedCode);
            showStatus('Code obfuscated successfully!', 'success');
        } catch (error) {
            showStatus('Error during obfuscation: ' + error.message, 'error');
        }
    }

    function clearSource() {
        sourceEditor.setValue('');
        outputEditor.setValue('');
        showStatus('Source code cleared', 'success');
    }

    function loadExample() {
        sourceEditor.setValue(exampleCode);
        showStatus('Example code loaded', 'success');
    }

    function copyOutput() {
        const outputCode = outputEditor.getValue();
        if (!outputCode.trim()) {
            showStatus('No obfuscated code to copy', 'error');
            return;
        }

        navigator.clipboard.writeText(outputCode).then(() => {
            showStatus('Code copied to clipboard!', 'success');
        }).catch(() => {
            showStatus('Failed to copy code', 'error');
        });
    }

    function downloadOutput() {
        const outputCode = outputEditor.getValue();
        if (!outputCode.trim()) {
            showStatus('No obfuscated code to download', 'error');
            return;
        }

        const blob = new Blob([outputCode], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'obfuscated-code.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showStatus('Code downloaded successfully!', 'success');
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 1024 * 1024) { // 1MB limit
            showStatus('File size exceeds 1MB limit', 'error');
            return;
        }

        if (!file.name.endsWith('.js')) {
            showStatus('Please upload a JavaScript file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                sourceEditor.setValue(content);
                showStatus('File loaded successfully', 'success');
            } catch (error) {
                showStatus('Error reading file: ' + error.message, 'error');
            }
        };
        reader.onerror = () => {
            showStatus('Error reading file', 'error');
        };
        reader.readAsText(file);
    }

    obfuscateButton.addEventListener('click', obfuscateCode);
    clearSourceButton.addEventListener('click', clearSource);
    loadExampleButton.addEventListener('click', loadExample);
    copyOutputButton.addEventListener('click', copyOutput);
    downloadOutputButton.addEventListener('click', downloadOutput);

    uploadFileButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileUpload);

    document.querySelectorAll('.option-item input, .option-item select').forEach(element => {
        element.addEventListener('change', () => {
            if (outputEditor.getValue().trim()) {
                showStatus('Options changed - please obfuscate again', 'success');
            }
        });
    });
}); 