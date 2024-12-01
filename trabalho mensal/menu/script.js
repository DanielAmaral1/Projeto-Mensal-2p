// Alternância de Tema
const themeToggleBtn = document.querySelector('.theme-toggle');
themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    themeToggleBtn.textContent = document.body.classList.contains('dark-theme') ? 'Light' : 'Dark';
});

// Função para adicionar tarefa
function addTask(button) {
    const taskText = prompt('Digite o nome da nova tarefa:');
    if (taskText) {
        const taskElement = createTaskElement(taskText);
        button.parentElement.insertBefore(taskElement, button);
    }
}

// Função para criar a estrutura da tarefa
function createTaskElement(taskText) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task';

    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    taskContent.textContent = taskText;
    taskContent.addEventListener('dblclick', () => {
        const newText = prompt('Editar tarefa:', taskContent.textContent);
        if (newText) taskContent.textContent = newText;
    });

    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Excluir';
    deleteBtn.onclick = () => taskElement.remove();

    const moveLeftBtn = document.createElement('button');
    moveLeftBtn.textContent = '←';
    moveLeftBtn.onclick = () => moveTask(taskElement, -1);

    const moveRightBtn = document.createElement('button');
    moveRightBtn.textContent = '→';
    moveRightBtn.onclick = () => moveTask(taskElement, 1);

    taskActions.append(moveLeftBtn, moveRightBtn, deleteBtn);
    taskElement.append(taskContent, taskActions);

    return taskElement;
}

// Função para mover a tarefa entre colunas
function moveTask(taskElement, direction) {
    const currentBoard = taskElement.parentElement;
    const currentIndex = parseInt(currentBoard.getAttribute('data-index'));
    const newIndex = currentIndex + direction;

    const allBoards = document.querySelectorAll('.board');
    if (newIndex >= 0 && newIndex < allBoards.length) {
        allBoards[newIndex].insertBefore(taskElement, allBoards[newIndex].querySelector('button'));
    }
}

// Função para adicionar uma nova coluna
function addColumn() {
    const columnName = prompt('Digite o nome da nova coluna:');
    if (columnName) {
        const boardContainer = document.getElementById('boardContainer');
        const newBoard = document.createElement('div');
        newBoard.className = 'board';
        newBoard.setAttribute('data-index', document.querySelectorAll('.board').length);

        const boardTitle = document.createElement('h3');
        boardTitle.textContent = columnName;

        const deleteColumnBtn = document.createElement('button');
        deleteColumnBtn.className = 'delete-column';
        deleteColumnBtn.textContent = '×';
        deleteColumnBtn.onclick = () => deleteColumn(deleteColumnBtn);

        const addTaskBtn = document.createElement('button');
        addTaskBtn.textContent = 'Nova tarefa';
        addTaskBtn.onclick = () => addTask(addTaskBtn);

        newBoard.append(boardTitle, deleteColumnBtn, addTaskBtn);
        boardContainer.appendChild(newBoard);
    }
}

// Função para excluir uma coluna
function deleteColumn(button) {
    if (confirm('Tem certeza que deseja excluir esta coluna?')) {
        button.parentElement.remove();
    }
}