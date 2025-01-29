require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.40.0/min/vs' } });


require(['vs/editor/editor.main'], function () {
    monaco.languages.register({ id: 'sigmag' });

    monaco.editor.defineTheme('sigmagTheme', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'keyword', foreground: '#FF1493' },
            { token: 'variable', foreground: '#00C8FF' },
            { token: 'command', foreground: '#FF1493' },
            { token: 'command.crossed', foreground: '#FF0000', fontStyle: 'strikethrough' },
            { token: 'keyword.crossed', foreground: '#FF0000', fontStyle: 'strikethrough' },
            { token: 'string', foreground: '#FFD700' },
            { token: 'number', foreground: '#7BFB0C' },
            { token: 'operator', foreground: '#E99A62' },
            { token: 'if', foreground: '#EA91E4' },
            { token: 'then', foreground: '#803D93' },
            { token: 'else', foreground: '#DF89E4' },
            { token: 'comment', foreground: '#AF96B7' },
            { token: 'include', foreground: '#FF0B03' },
            { token: 'define', foreground: '#4F6BD1' },
        ],
        colors: {
            'editor.background': '#36042EA9'
        }
    });

    monaco.languages.setMonarchTokensProvider('sigmag', {
        tokenizer: {
            root: [
                [/#GREGDEFINE/, { token: 'define', next: '@defineMode' }],
                [/\b(gregCurDateTime|gregCurDate|gregPrintAll)\b/, 'command'],
                [/gregPr|gregIn|gregType|gregRandom|gregBeep|gregSleep|gregClear|gregCurTime|exit|gregExit|gregQuit|gregLeave/, 'keyword'],
                [/\binclude\b/i, 'include'],
                [/\bif\b/, 'if'],
                [/\bthen\b/, 'then'],
                [/\belse\b/, 'else'],
                [/[a-zA-Z_][a-zA-Z0-9_]*/, 'variable'],
                [/"(.*?)"/, 'string'],
                [/\d+/, 'number'],
                [/[+\-*/=<>!]/, 'operator'],
                [/\`.*$/, 'comment']
            ],
            defineMode: [
                [/\b(gregCurDateTime|gregCurDate|gregPrintAll)\b/, 'command.crossed'],
                [/gregPr|gregIn|gregType|gregRandom|gregBeep|gregSleep|gregClear|gregCurTime|exit|gregExit|gregQuit|gregLeave/, 'keyword.crossed'],
                [/[a-zA-Z_][a-zA-Z0-9_]*/, 'variable'],
                [/"(.*?)"/, 'string'],
                [/\d+/, 'number'],
                [/[+\-*/=<>!]/, 'operator'],
                [/\`.*$/, 'comment'],
                [/^#GREGDEFINE/, 'command.crossed']

            ]
        }
    });

    const editor = monaco.editor.create(document.getElementById('editor'), {
        language: 'sigmag',
        theme: 'sigmagTheme',
        automaticLayout: true
    });
    
    document.getElementById('errorCheckerClose').addEventListener('click', function() {
        document.getElementById('errorCheckerModal').style.display = 'none';
    });
    
    function showErrorCheckerModal() {
        document.getElementById('errorCheckerModal').style.display = 'flex';
        document.getElementById('loadingCircle').style.display = 'inline-block';
        document.getElementById('errorCheckerMessage').textContent = 'Checking for errors...';
    
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            
    
            if (progress >= 50) {
                document.getElementById('errorCheckerMessage').textContent = 'Almost done...';
            }
            if (progress >= 100) {
                document.getElementById('errorCheckerMessage').textContent = 'Done!'
            }
        }, 200);

    
        setTimeout(() => {
            const code = editor.getValue();
            const errors = checkSyntax(code);
            document.getElementById('loadingCircle').style.display = 'none';
    
            clearInterval(progressInterval);
    
            if (errors.length === 0) {
                document.getElementById('errorCheckerMessage').textContent = 'No errors found!!!!!! :3333333';
            } else {
                document.getElementById('errorCheckerMessage').innerHTML = 'Uh oh.. Errors:<br>' + errors.join('<br>');
            }
        }, 6000);
    }
    
    
    function checkSyntax(code) {
        const errors = [];
        const lines = code.split('\n');
        const validKeywords = [
            'gregPr', 'gregIn', 'gregType', 'gregRandom',
            'gregBeep', 'gregSleep', 'gregClear', 'gregCurTime',
            'exit', 'gregExit', 'gregQuit', 'gregLeave', 'include',
            'if', 'then', 'else', '#GREGDEFINE'
        ];
        const validCommands = ['gregCurDateTime', 'gregCurDate', 'gregPrintAll'];
        const declaredVariables = new Set();
    
        lines.forEach((line, index) => {
            const codeLine = line.split('`')[0].trim();
            if (!codeLine) return;
    
            const words = codeLine.split(/\s+/);
    

            if (words.some(word => word.startsWith('"') && !word.endsWith('"'))) {
                errors.push(`Line ${index + 1}: Unclosed quotes detected dumbass`);
            }
    
            words.forEach((word, wordIndex) => {

                if (word.endsWith(':') && validKeywords.includes(word.slice(0, -1))) {
                    return;
                }
    

                if (word.startsWith('"') && word.endsWith('"')) {
                    return;
                }
    

                if (word === "=" && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(words[wordIndex - 1])) {
                    declaredVariables.add(words[wordIndex - 1]);
                }
    

                if (['gregPr', 'gregIn'].includes(word)) {
                    const arg = words[wordIndex + 1];
                    if (!arg || (!(arg.startsWith('"') || declaredVariables.has(arg)))) {
                        errors.push(`Line ${index + 1}: Invalid argument for '${word}' sob`);
                    }
                }
    
                if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word) && !validKeywords.includes(word) && !validCommands.includes(word)) {
                    return;
                }

                if (
                    !validKeywords.includes(word) &&
                    !validCommands.includes(word) &&
                    /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(word)
                ) {
                    errors.push(`Line ${index + 1}: Unknown keyword or command '${word}' lmfao`);
                }
            });
        });
    
        return errors;
    }
    
    document.getElementById('errorChecker').addEventListener('click', showErrorCheckerModal);
    
    
    
    const fileList = document.querySelector('#file-list');
    const files = JSON.parse(localStorage.getItem('openFiles')) || {};

    const loadFile = (fileName) => {
        editor.setValue(files[fileName] || '');
        highlightFile(fileName);
        localStorage.setItem('lastFile', fileName);  
    };

    const highlightFile = (fileName) => {
        [...fileList.children].forEach(li => li.classList.remove('active'));
        document.querySelector(`[data-file="${fileName}"]`)?.classList.add('active');
    };

    const saveFiles = () => {
        localStorage.setItem('openFiles', JSON.stringify(files));
    };

    const saveInterval = setInterval(() => {
        if (Object.keys(files).length > 0) {
            const activeFile = [...fileList.children].find(li => li.classList.contains('active'))?.dataset.file;
            if (activeFile) {
                files[activeFile] = editor.getValue();
                saveFiles();
            }
        }
    }, 1000);
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
            const renameModal = document.getElementById('renameFileModal');
            renameModal.style.display = 'flex';
            const renameInput = document.getElementById('renameFileName');
            const renameMessage = document.getElementById('renameFileMessage');
            renameInput.value = fileName;
            renameModal.style.justifyContent = 'center';
            renameModal.style.alignItems = 'center';

            const resetModal = () => {
                renameMessage.textContent = '';
                renameInput.value = '';
            };


            const closeModal = () => {
                renameModal.style.display = 'none';
                resetModal();
            };

            document.getElementById('renameFileButton').onclick = () => {
                const newName = renameInput.value;
                if (newName && newName !== fileName && !files[newName]) {
                    closeModal();
                    files[newName] = files[fileName];
                    delete files[fileName];
                    listItem.textContent = newName;
                    listItem.dataset.file = newName;
                    saveFiles();
                    saveFileContent(newName, files[newName]);
                } else if (newName && files[newName]) {
                    renameMessage.textContent = 'File already exists';
                } else if (!newName) {
                    renameMessage.textContent = 'File name cannot be empty!';
                } else if (newName === fileName) {
                    renameMessage.textContent = 'File name cannot be the same as the current file name!';
                }
            };

            document.getElementById('closeRenameFileModal').onclick = closeModal;

            document.getElementById('renameFileModal').addEventListener('click', (event) => {
                if (event.target === renameModal) {
                    closeModal();
                }
            });
        };

document.getElementById('deleteFile').onclick = () => {
    const deleteModal = document.getElementById('deleteFileModal');
    const deleteMessage = document.getElementById('deleteFileMessage');
    deleteModal.style.display = 'flex';
    deleteModal.style.justifyContent = 'center';
    deleteModal.style.alignItems = 'center';

    const fileName = listItem.dataset.file;
    deleteMessage.textContent = `Are you sure you want to delete ${fileName}?`;

    document.getElementById('deleteFileButton').onclick = () => {
        delete files[fileName];
        fileList.removeChild(listItem);
        saveFiles();

        const remainingFiles = Object.keys(files);
        if (remainingFiles.length === 0) {
            editor.setValue(
                "` Welcome to SigmaGreg Code!!!\n` The best way to write SigmaGreg code.\n\n` To get started, press the 'File' button and then 'New File'!\n\n\n` 2024-2025 Freakybob-Team. Licensed under MIT, with help from VS Code."
            );
            document.querySelector('#editor').classList.add('welcome-screen');
        } else {
            loadFile(remainingFiles[0]);
        }
        deleteModal.style.display = 'none';
    };

    document.getElementById('closeDeleteFileModal').onclick = () => {
        deleteModal.style.display = 'none';
    };
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

document.getElementById('newFile').onclick = () => {
    const newFileModal = document.getElementById('newFileModal');
    newFileModal.style.display = 'flex';
    const newFileNameInput = document.getElementById('newFileName');
    const newFileMessage = document.getElementById('newFileMessage');
    newFileNameInput.value = 'new.sgc';

    const resetModal = () => {
        newFileMessage.textContent = '';
        newFileNameInput.value = 'new.sgc';
    };

    document.getElementById('createNewFile').onclick = () => {
        const newFileName = newFileNameInput.value;
        if (!newFileName) {
            newFileMessage.textContent = 'File name cannot be empty!';
        } else if (files[newFileName]) {
            newFileMessage.textContent = 'File already exists!';
        } else {
            files[newFileName] = '';
            const newFileItem = createFileItem(newFileName);
            fileList.appendChild(newFileItem);
            loadFile(newFileName);
            saveFiles();
            newFileModal.style.display = 'none';
            resetModal();
        }
    };

    document.getElementById('closeNewFileModal').onclick = () => {
        newFileModal.style.display = 'none';
        resetModal();
    };
};


   

    document.querySelector('#saveFile').addEventListener('click', () => {
        const activeFile = [...fileList.children].find(li => li.classList.contains('active'))?.dataset.file;
        if (activeFile) {
            files[activeFile] = editor.getValue();
            saveFiles();
        } else {
            alert('No file selected to save...');
        }
    });

    if (Object.keys(files).length === 0) {
        editor.setValue('` Welcome to SigmaGreg Code!!!\n` The best way to write SigmaGreg code.\n\n` To get started, press the \'File\' button and then \'New File\'!\n\n\n` 2024-2025 Freakybob-Team. Licenced under MIT, with help from VS Code.');
        document.querySelector('#editor').classList.add('welcome-screen');
    }

    Object.keys(files).forEach(fileName => {
        fileList.appendChild(createFileItem(fileName));
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

    editor.onDidChangeCursorPosition(e => {
        const position = editor.getPosition();
        document.querySelector('#status-bar span').textContent = `Ln ${position.lineNumber}, Col ${position.column}`;
    });

    const lastFile = localStorage.getItem('lastFile');
    if (lastFile && files[lastFile]) {
        loadFile(lastFile);
    } else {
        const firstFile = Object.keys(files)[0];
        if (firstFile) {
            loadFile(firstFile);
        }
    }
    document.body.addEventListener('click', () => {
        document.getElementById('contextMenu').style.display = 'none';
    });

    document.getElementById('openFile').addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.sgc';
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    const fileName = file.name;
                    files[fileName] = e.target.result;
                    const newFileItem = createFileItem(fileName);
                    fileList.appendChild(newFileItem);
                    loadFile(fileName);
                    saveFiles();
                };
                reader.readAsText(file);
            }
        });
        fileInput.click();
    });
});
