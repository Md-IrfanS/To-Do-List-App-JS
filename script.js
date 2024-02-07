const taskInput = document.querySelector(".task-input input");
const todoLists = document.querySelector('.task-lists');
const filters = document.querySelector('.filters');
const clearBtn = document.querySelector('.clear-btn');
const errorMsg = document.querySelector('.error-msg');

// LOCAL STORAGE CONSTANTS
const TODO_LISTS = "todo-list"; // Key for storing todo-list data in localStorage

// if todo-list isn't exist from localStorage, initialize with an empty array
let todos = localStorage.getItem(TODO_LISTS) ? JSON.parse(localStorage.getItem(TODO_LISTS)) : [];

let editId; // Store the index task being edited
let isEditTask = false; // Flag to track whether the user is editing a task 

function isClearBtnShow() {
    clearBtn.style.display = JSON.parse(localStorage.getItem(TODO_LISTS)).length >= 1 ? "block" : "none";
}
isClearBtnShow();

// Function to render todo lists based on filter
function showFilteredTodoLists(todoIs, filter = 'all') {

    const filteredTodos = todoIs.filter((todo) => todo.status == filter || filter == "all");
    const html = filteredTodos.length ? filteredTodos.map(renderTodoItem).join('') : "<span>You don't have any task here</span>"
    todoLists.innerHTML = html
    taskResult()
};

showFilteredTodoLists(todos);

// Function to render individual todo item
function renderTodoItem(todo) {
    const { id, name, status } = todo;
    const isCompletedTask = status == "completed" ? "checked" : ""
    return `
    <li class="task">
            <label for="${id}">
              <input onclick="updateStatus(this)" type="checkbox" ${isCompletedTask} id=${id} />
              <p class=${isCompletedTask}>${name}</p>
            </label>
            <div class="setting">
              <i class="uil uil-ellipsis-h" onclick="showTaskActionMenu(this)"></i>
              <ul class="task-action">
                <li onclick="editTask(${id}, '${name}')"><i class="uil uil-pen"></i>Edit</li>
                <li onclick="deleteTask(${id})"><i class="uil uil-trash"></i>Delete</li>
              </ul>
            </div>
          </li>`;
};

// Function to handle filter click
function handleFilterClick(event) {
    if (event.target.tagName === 'SPAN') {
        document.querySelector('.filters span.active').classList.remove('active');
        event.target.classList.add('active');
        const getTodos = JSON.parse(localStorage.getItem(TODO_LISTS));
        setAndRenderTodos(getTodos);
    }
};

// Event listener for filter clicks
filters.addEventListener('click', handleFilterClick);

function activeCheckTab(checkTab) {
    document.querySelector('span.active').classList.remove('active');
    document.querySelector(`#${checkTab}`).classList.add('active');
    const getTodos = JSON.parse(localStorage.getItem(TODO_LISTS));
    setAndRenderTodos(getTodos);
};

function showTaskActionMenu(selectedMenu) {
    const taskMenu = selectedMenu.parentElement.lastElementChild;
    taskMenu.classList.add("show");

    document.addEventListener('click', ({ target }) => {
        if (target.tagName !== "I" || target !== selectedMenu) {
            taskMenu.classList.remove('show')
        }
    });
};

function updateStatus(selectedTask) {
    const id = selectedTask.id;
    const taskName = selectedTask.parentElement.lastElementChild;
    // checked true if checked remove or add
    const isStatus = taskName.classList.toggle("checked");
    const getTodos = JSON.parse(localStorage.getItem(TODO_LISTS));
    const updateTodos = getTodos.map((todo) => {
        return todo.id === id ? { ...todo, status: isStatus ? "completed" : "pending" } : todo
    });
    setAndRenderTodos(updateTodos);
};

// Function to handle setting todos to local storage and rendering
function setAndRenderTodos(todo, key = TODO_LISTS) {
    setLocalStorage(key, todo);
    showFilteredTodoLists(todo, getActiveFilter());
    taskResult()
};

// Function to get active filter
function getActiveFilter() {
    return document.querySelector('.filters span.active').id;
}

function setLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
};


// Function to handle task input keyup event
function handleTaskInputKeyup(event) {
    if (event.key === "Enter") {
        const userTask = taskInput.value.trim();
        if (userTask !== "") {
            handleEnterKeyWithValidTask(userTask);
        } else {
            errorMsg.innerText = "Please enter a valid task";
        }
    } else {
        errorMsg.innerText = ""; // Clear error message if there is any
    }
};

// Generate Unique ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

function taskResult() {
    const taskResult = document.querySelector(".task-result");
    const getTodos = JSON.parse(localStorage.getItem(TODO_LISTS)) || [];

    const pendingTaskCount = getTodos.filter((item) => item.status == "pending").length;
    const isAllCompleted = getTodos.every((item) => item.status == "completed");

    console.log(isAllCompleted);
    console.log(pendingTaskCount);

    const result = isAllCompleted ? "All Task Completed" : pendingTaskCount == 0 ? "" : `You have ${pendingTaskCount} task's to complete`

    taskResult.style.backgroundColor = pendingTaskCount == 0 ? "palegreen" : "darkgray"
    taskResult.innerHTML = result
}

// Function to handle adding task when enter key is pressed with a valid task
function handleEnterKeyWithValidTask(userTask) {
    const getTodos = JSON.parse(localStorage.getItem(TODO_LISTS));
    if (!isEditTask) {
        getTodos.push({ name: userTask, status: "pending", id: generateUniqueId() });
        activeCheckTab('pending');
        setAndRenderTodos(getTodos);
        isClearBtnShow();
        taskResult()
    } else {

        const updateTodos = getTodos.map((todo) => todo.id == editId ? { ...todo, name: userTask } : todo);
        isEditTask = false;
        setAndRenderTodos(updateTodos)
        isClearBtnShow();
    }
    taskInput.value = "";

};

// Function to handle editing a task
function editTask(todo, taskName) {
    editId = todo.id;
    taskInput.value = taskName;
    isEditTask = true;
};

// Function to handle clearing all tasks
function clearAllTasks() {
    const isConfirmDelete = confirm("Are you sure you want to delete all task?");
    if (isConfirmDelete) {
        todos = [];
        setAndRenderTodos([]);
        isClearBtnShow();
    }
};

function deleteTask(todo) {
    // removing selected task from array todos
    const deleteId = todo.id
    const newTodos = JSON.parse(localStorage.getItem(TODO_LISTS)).filter((todo) => todo.id != deleteId);
    setAndRenderTodos(newTodos);
    clearBtn.style.display = todos.length > 0 ? "block" : "none";
}

taskInput.addEventListener("keyup", handleTaskInputKeyup)
clearBtn.addEventListener('click', clearAllTasks)
