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

    boardLayout.innerHTML = ""; 

    columns.forEach((column) => {

        const columnItem = document.createElement("article");
        columnItem.className = "column-item";

        const columnHeader = document.createElement("header");
        columnHeader.className = "column-header";
        columnHeader.innerHTML = `<h5>${column.Name}</h5>`;

        // Criando o botão ao lado do título
        const columnButton = document.createElement("button");
        columnButton.className = "column-button";
        columnButton.textContent = "Add Task"; // Texto do botão
        columnButton.addEventListener("click", () => {
            console.log(`Botão clicado na coluna: ${column.Name}`);
            // Adicione aqui a funcionalidade do botão
            const titulo = prompt("Digite a Tarefa");
            const descricao = prompt("Digite a Descrição");

            if (titulo) {
                criarTarefa(column.Id, titulo, descricao); // Agora cria e salva a tarefa na API
            }else {
                alert("Título e Coluna são obrigatórios!");
            }
        });

        // Adiciona o botão ao header
        columnHeader.appendChild(columnButton);

        const columnBody = document.createElement("div");
        columnBody.className = "column-body";
        columnBody.id = `tasks-${column.Id}`;


        columnItem.appendChild(columnHeader);
        columnItem.appendChild(columnBody);


        boardLayout.appendChild(columnItem);

        fetchTasksByColumn(column.Id).then((res)=>{
            addTasksToColumn(column.Id, res)
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

// Função para buscar a lista de boards e criar uma coluna com base no nome
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

        const nome_coluna = prompt("Digite o Nome da coluna")

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
        const boardsList = document.getElementById("boardsList");
        if (boardsList) {
            const listItem = document.createElement("li");
            listItem.innerHTML = `<a class="dropdown-item">${newColumn.name}</a>`;
            boardsList.appendChild(listItem);
        }
    } catch (error) {
        console.error("Erro:", error);
    }
}

// Adiciona o evento ao botão
document.getElementById("createColumnButton").addEventListener("click", createColumnFromBoard);




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

