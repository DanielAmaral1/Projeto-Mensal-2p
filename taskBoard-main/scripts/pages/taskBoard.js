import { API_BASE_URL } from "../../config/apiConfig.js";
import { getFromLocalStorage } from "../utils/storage.js";

const boardsList = document.getElementById("boardsList");
const userNameSpan = document.getElementById("userName");
const logoutButton = document.getElementById("logoutButton");
const boardTitle = document.getElementById("boardTitle");
const boardLayout = document.getElementById("board");

async function loadBoards() {
    try {
        const response = await fetch(`${API_BASE_URL}/Boards`);
        if (!response.ok) {
            throw new Error("Erro ao carregar boards");
        }
        const boards = await response.json();
        populateBoardsDropdown(boards);
    } catch (error) {
        console.error("Erro ao carregar boards:", error);
    }
}

function populateBoardsDropdown(boards) {
    
    boards.forEach((board) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a class="dropdown-item" id="dropdown-item" value="${board.Id}">${board.Name}</a>`;
        listItem.addEventListener("click", (event) => {
            // console.log(board.Id)
            boardTitle.innerHTML = event.target.innerHTML;
            loadBoard(board.Id);
        })
        boardsList.appendChild(listItem);
    });
}

async function loadBoard(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/ColumnByBoardId?BoardId=${id}`)
        if(!response.ok) {
            throw new Error("Erro ao carregar colunas");
        }
        const columns = await response.json();
        populateColumns(columns);
    } catch (error) {
        console.error("Erro ao carregar colunas:", error);
    }
}

function populateColumns(columns) {
    boardLayout.innerHTML = ""; // Limpa as colunas existentes

    columns.forEach((column) => {
        const columnItem = document.createElement("article");
        columnItem.className = "column-item";

        const columnHeader = document.createElement("header");
        columnHeader.className = "column-header";
        columnHeader.innerHTML = `<h5>${column.Name}</h5>`;

        // Botão de adicionar tarefa
        const columnButton = document.createElement("button");
        columnButton.className = "column-button";
        columnButton.textContent = "Adicionar Tarefa"; // Texto do botão
        columnButton.addEventListener("click", () => {
            console.log(`Botão clicado na coluna: ${column.Name}`);
            const titulo = prompt("Digite a Tarefa");
            const descricao = prompt("Digite a Descrição");

            if (titulo) {
                criarTarefa(column.Id, titulo, descricao); // Agora cria e salva a tarefa na API
            } else {
                alert("Título e Coluna são obrigatórios!");
            }
        });

        // Botão de excluir coluna
        const deleteButton = document.createElement("button");
        deleteButton.className = "column-button";
        deleteButton.textContent = "Excluir Coluna"; // Texto do botão
        deleteButton.addEventListener("click", () => {
            if (confirm(`Você tem certeza que deseja excluir a coluna "${column.Name}"?`)) {
                excluirColuna(column.Id);
            }
        });

        // Adiciona os botões no header da coluna
        columnHeader.appendChild(columnButton);
        columnHeader.appendChild(deleteButton);

        const columnBody = document.createElement("div");
        columnBody.className = "column-body";
        columnBody.id = `tasks-${column.Id}`;

        columnItem.appendChild(columnHeader);
        columnItem.appendChild(columnBody);

        boardLayout.appendChild(columnItem);

        // Carregar as tarefas dessa coluna
        fetchTasksByColumn(column.Id).then((res) => {
            addTasksToColumn(column.Id, res);
        });
    });
}


function fetchTasksByColumn(columnId) {
    const endpoint = `${API_BASE_URL}/TasksByColumnId?ColumnId=${columnId}`;
    return fetch(endpoint)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Erro ao buscar tasks para ColumnId ${columnId}: ${response.status}`);
            }
            return response.json();
        })
        .catch((error) => {
            console.error(error);
            return [];
        });
}

function addTasksToColumn(columnId, tasks) {
    const columnBody = document.getElementById(`tasks-${columnId}`);

    tasks.forEach((task) => {
        const taskItem = document.createElement("div");
        taskItem.className = "task-item";
        taskItem.innerHTML = `
            <h6>${task.Title || "Sem título"}</h6>
            <p>${task.Description || "Sem descrição"}</p>
        `;
        columnBody.appendChild(taskItem);
    });
}

async function createColumnFromBoard() {
    try {
        // Captura o nome da board do HTML
        const boardNameElement = document.getElementById("boardTitle");
        const boardName = boardNameElement ? boardNameElement.textContent.trim() : null;

        if (!boardName) {
            console.error("Erro: Nome da board não encontrado no HTML.");
            return;
        }

        console.log("Buscando ID para a board com nome:", boardName);

        // Requisição GET para obter a lista de boards
        const boardsResponse = await fetch(`${API_BASE_URL}/Boards`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!boardsResponse.ok) {
            throw new Error(`Erro ao buscar boards: ${boardsResponse.status}`);
        }

        // Processa a resposta para encontrar o board com o nome desejado
        const boards = await boardsResponse.json();
        const board = boards.find((b) => b.Name === boardName);

        if (!board) {
            console.error(`Erro: Board com nome "${boardName}" não encontrado.`);
            return;
        }

        console.log("Board encontrado:", board);

        const nome_coluna = prompt("Digite o Nome da coluna");

        // Usa o ID da board para criar uma nova coluna
        const newColumnResponse = await fetch(`${API_BASE_URL}/Column`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                boardId: board.Id, // Usa o ID encontrado
                name: nome_coluna, // Nome da coluna
            }),
        });

        if (!newColumnResponse.ok) {
            throw new Error(`Erro ao criar coluna: ${newColumnResponse.status}`);
        }

        const newColumn = await newColumnResponse.json();
        console.log("Coluna criada com sucesso:", newColumn);

        // Atualiza o DOM com a nova coluna
        populateColumns([newColumn]); // Atualiza a lista de colunas
    } catch (error) {
        console.error("Erro:", error);
    }
}

// Adiciona o evento ao botão para criar coluna
document.getElementById("createColumnButton").addEventListener("click", createColumnFromBoard);



async function excluirColuna(colunaId) {
    try {
        // Substituindo a URL pela URL fornecida para excluir a coluna
        const response = await fetch(`https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/Column?ColumnId=${colunaId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Erro ao excluir coluna: ${response.status}`);
        }

        console.log(`Coluna com ID ${colunaId} excluída com sucesso`);

        // Atualiza a interface removendo a coluna
        const columnElement = document.getElementById(`tasks-${colunaId}`);
        if (columnElement) {
            columnElement.parentElement.remove(); // Remove o item da coluna
        }
    } catch (error) {
        console.error("Erro ao excluir coluna:", error);
    }
}






function loadUserName() {
    const userName = getFromLocalStorage("user");
    console.log(userName)
    if (userName.name) {
        userNameSpan.textContent = `Olá, ${userName.name.split(' ')[0]}`;
    } else {
        userNameSpan.textContent = "Usuário não identificado";
    }
}

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
});

// Função para criar a tarefa via API
async function criarTarefa(colunaId, titulo, descricao) {
    try {
        const response = await fetch(`${API_BASE_URL}/Task`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                columnId: colunaId,
                title: titulo,
                description: descricao
            })
        });

        if (!response.ok) {
            throw new Error("Erro ao criar tarefa");
        }

        // Atualiza o DOM
        addTasksToColumn(colunaId, [{ Title: titulo, Description: descricao }]);

    } catch (error) {
        console.error("Erro ao criar tarefa:", error);
    }
}

async function criarColuna(boardId, nomeColuna) {
    try {
        const response = await fetch('https://personal-ga2xwx9j.outsystemscloud.com/TaskBoard_CS/rest/TaskBoard/Column', {
            method: 'PUT', // Usando PUT para adicionar uma nova coluna
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                BoardId: boardId, // ID do Board
                Name: nomeColuna, // Nome da nova coluna
            }),
        });

        if (!response.ok) {
            throw new Error('Erro ao criar coluna');
        }

        const novaColuna = await response.json();
        console.log('Coluna criada com sucesso:', novaColuna);

        // Atualiza o DOM com a nova coluna
        addNewColumnToBoard(novaColuna);  // Função para adicionar a coluna na interface
    } catch (error) {
        console.error('Erro ao criar coluna:', error);
    }
}

function addNewColumnToBoard(novaColuna) {
    const columnItem = document.createElement("article");
    columnItem.className = "column-item";

    const columnHeader = document.createElement("header");
    columnHeader.className = "column-header";
    columnHeader.innerHTML = `<h5>${novaColuna.Name}</h5>`;

    // Botão para adicionar tarefa na nova coluna
    const columnButton = document.createElement("button");
    columnButton.className = "column-button";
    columnButton.textContent = "Adicionar Tarefa"; // Texto do botão
    columnButton.addEventListener("click", () => {
        console.log(`Botão clicado na coluna: ${novaColuna.Name}`);
        const titulo = prompt("Digite a Tarefa");
        const descricao = prompt("Digite a Descrição");

        if (titulo) {
            criarTarefa(novaColuna.Id, titulo, descricao); // Cria a tarefa na nova coluna
        } else {
            alert("Título e Descrição são obrigatórios!");
        }
    });

    // Adiciona o botão de adicionar tarefa ao header da coluna
    columnHeader.appendChild(columnButton);

    const columnBody = document.createElement("div");
    columnBody.className = "column-body";
    columnBody.id = `tasks-${novaColuna.Id}`;

    columnItem.appendChild(columnHeader);
    columnItem.appendChild(columnBody);

    boardLayout.appendChild(columnItem);

    // Após adicionar a coluna, pode-se carregar as tarefas dessa coluna (se houver)
    fetchTasksByColumn(novaColuna.Id).then((tasks) => {
        addTasksToColumn(novaColuna.Id, tasks);
    });
}

// Adiciona evento ao botão para criar nova coluna
document.getElementById("createColumnButton").addEventListener("click", () => {
    const nomeColuna = prompt("Digite o nome da nova coluna");

    if (nomeColuna) {
        const boardId = getBoardId(); // Função para obter o ID do board selecionado
        criarColuna(boardId, nomeColuna);  // Cria a nova coluna
    } else {
        alert("O nome da coluna não pode estar vazio!");
    }
});

function getBoardId() {
    const boardTitle = document.getElementById("boardTitle");
    // Recupera o boardId de acordo com o nome do board ou do estado da aplicação
    return boardTitle ? boardTitle.getAttribute("data-board-id") : null;
}





function init() {
    loadUserName();
    loadBoards();
}

init();


document.addEventListener("DOMContentLoaded", () => {
    const themeToggleButton = document.getElementById("themeToggleButton");
    const body = document.body;

    // Verifica o tema atual salvo no armazenamento local ou define o padrão
    const currentTheme = localStorage.getItem("theme") || "light-theme";
    body.classList.add(currentTheme);

    // Atualiza o ícone do botão com base no tema atual
    themeToggleButton.textContent = currentTheme === "dark-theme" ? "☀️" : "🌙";

    // Alterna entre os temas claro e escuro
    themeToggleButton.addEventListener("click", () => {
        const isDarkTheme = body.classList.contains("dark-theme");

        // Alterna o tema
        body.classList.toggle("dark-theme", !isDarkTheme);
        body.classList.toggle("light-theme", isDarkTheme);

        // Salva o tema no armazenamento local
        localStorage.setItem("theme", isDarkTheme ? "light-theme" : "dark-theme");

        // Atualiza o ícone do botão
        themeToggleButton.textContent = isDarkTheme ? "🌙" : "☀️";
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const themeToggleButton = document.getElementById("themeToggleButton");
    const body = document.body;

    // Verifica o tema atual, que pode vir da API ou do armazenamento local
    let currentTheme = localStorage.getItem("theme") || "light-theme";

    // Se o tema não estiver salvo, tenta carregar da API
    fetch(`https://seuapp.outsystems.com/api/userpreferences/${getUserId()}`)
        .then(response => response.json())
        .then(data => {
            if (data.theme) {
                currentTheme = data.theme;
            }
            applyTheme(currentTheme);
        })
        .catch(error => console.error("Erro ao carregar tema:", error));

    // Aplica o tema no body
    function applyTheme(theme) {
        body.classList.add(theme);
        themeToggleButton.textContent = theme === "dark-theme" ? "☀️" : "🌙";
    }

    // Alterna entre os temas claro e escuro e salva a preferência
    themeToggleButton.addEventListener("click", () => {
        const isDarkTheme = body.classList.contains("dark-theme");

        // Alterna o tema
        body.classList.toggle("dark-theme", !isDarkTheme);
        body.classList.toggle("light-theme", isDarkTheme);

        // Atualiza o ícone do botão
        themeToggleButton.textContent = isDarkTheme ? "🌙" : "☀️";

        // Salva a preferência de tema no localStorage
        localStorage.setItem("theme", isDarkTheme ? "light-theme" : "dark-theme");

        // Salva o tema na API
        const themeToSave = isDarkTheme ? "light" : "dark";
        saveThemeToAPI(themeToSave);
    });

    // Função para salvar a preferência de tema no Outsystems
    function saveThemeToAPI(theme) {
        const userId = getUserId(); // Função para pegar o ID do usuário (seja do localStorage ou da sessão)
        fetch("https://seuapp.outsystems.com/api/userpreferences", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                UserId: userId,
                Theme: theme
            })
        })
            .then(response => response.json())
            .then(data => console.log("Tema salvo com sucesso:", data))
            .catch(error => console.error("Erro ao salvar tema:", error));
    }
});

