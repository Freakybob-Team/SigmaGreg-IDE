require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.40.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
    monaco.languages.register({ id: 'sigmag' });

    monaco.editor.defineTheme('sigmagTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'keyword', foreground: '#FF6347' },
            { token: 'variable', foreground: '#00C8FF' },
            { token: 'command', foreground: '#FF1493' },
            { token: 'string', foreground: '#FFD700' }, 
            { token: 'number', foreground: '#7BFB0C' }, 
            { token: 'operator', foreground: '#E99A62' },
            { token: 'if', foreground: '#EA91E4' }, 
            { token: 'then', foreground: '#803D93' },
            { token: 'else', foreground: '#DF89E4' },
            { token: 'comment', foreground: '#AF96B7' },
        ],
        colors: {
            'editor.background': '#36042EA9'
        }
    });

    monaco.languages.setMonarchTokensProvider('sigmag', {
        tokenizer: {
            root: [
                [/gregPr|gregMa|gregIn|gregType|gregRandom|gregPrintAll|gregBeep|gregSleep|gregCurTime/, 'command'],
                [/\bif\b/, 'if'],
                [/\bthen\b/, 'then'],
                [/\belse\b/, 'else'],
                [/[a-zA-Z_][a-zA-Z0-9_]*/, 'variable'],
                [/".*?"/, 'string'],
                [/\d+/, 'number'], 
                [/[+\-*/=<>!]/, 'operator'], 
                [/\`.*$/, 'comment'], 
                [/\s+/, 'text'],
            ]
        }
    });

    const editor = monaco.editor.create(document.getElementById('editor'), {
        language: 'sigmag',
        theme: 'sigmagTheme',
        automaticLayout: true
    });

    const fileList = document.querySelector('#file-list');
    const files = JSON.parse(localStorage.getItem('openFiles')) || {};

    const loadFile = (fileName) => {
        editor.setValue(files[fileName] || '');
        highlightFile(fileName);
    };

    const highlightFile = (fileName) => {
        [...fileList.children].forEach(li => li.classList.remove('active'));
        document.querySelector(`[data-file="${fileName}"]`)?.classList.add('active');
    };

    const saveFiles = () => {
        localStorage.setItem('openFiles', JSON.stringify(files));
    };

    const createFileItem = (fileName) => {
        const listItem = document.createElement('li');
        listItem.textContent = fileName;
        listItem.dataset.file = fileName;
        listItem.onclick = () => loadFile(fileName);
        listItem.oncontextmenu = (e) => {
            e.preventDefault();
            const contextMenu = document.getElementById('contextMenu');
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.display = 'block';

            document.getElementById('renameFile').onclick = () => {
                const newName = prompt('Enter new file name:', fileName);
                if (newName && !files[newName]) {
                    files[newName] = files[fileName];
                    delete files[fileName];
                    listItem.textContent = newName;
                    listItem.dataset.file = newName;
                    saveFiles();
                }
            };

            document.getElementById('deleteFile').onclick = () => {
                if (confirm(`Are you sure you want to delete ${fileName}?`)) {
                    delete files[fileName];
                    fileList.removeChild(listItem);
                    saveFiles();
                    document.querySelector('#editor').classList.add('welcome-screen');
                    document.getElementById('contextMenu').style.display = 'none';
                }
            };

            document.getElementById('downloadFile').onclick = () => {
                const blob = new Blob([files[fileName]], { type: 'text/plain' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName;
                link.click();
                document.getElementById('contextMenu').style.display = 'none';
            };
        };

        return listItem;
    };

    if (Object.keys(files).length === 0) {
        editor.setValue('` Welcome to SigmaGreg Code!!!\n` The best way to write SigmaGreg code.\n\n` To get started, press the \'File\' button and then \'New File\'!\n\n\n` 2024-2025 Freakybob-Team. Licenced under MIT, with help from VS Code.');
        document.querySelector('#editor').classList.add('welcome-screen');
    }

    Object.keys(files).forEach(fileName => {
        fileList.appendChild(createFileItem(fileName));
    });

    document.getElementById('newFile').onclick = () => {
        const newFileName = prompt('Enter file name:', 'new.sgc');
        if (newFileName && !files[newFileName]) {
            files[newFileName] = '';
            const newFileItem = createFileItem(newFileName);
            fileList.appendChild(newFileItem);
            loadFile(newFileName);
            saveFiles();
        }
    };

    document.querySelector('#saveFile').addEventListener('click', () => {
        const activeFile = [...fileList.children].find(li => li.classList.contains('active'))?.dataset.file;
        if (activeFile) {
            files[activeFile] = editor.getValue();
            saveFiles();
            alert(`Saved ${activeFile}!`);
        } else {
            alert('No file selected to save...');
        }
    });

    document.getElementById('menu-bar').addEventListener('click', (e) => {
        if (e.target === document.getElementById('menu-bar')) {
            document.getElementById('contextMenu').style.display = 'none';
        }
    });

    document.body.addEventListener('click', () => {
        document.getElementById('contextMenu').style.display = 'none';
    });

    let seconds = 0;
    function updateStopwatch() {
        seconds++;
        const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        document.getElementById('clock').textContent = `${hrs}:${mins}:${secs}`;
    }

    setInterval(updateStopwatch, 1000);
    updateStopwatch();
});
