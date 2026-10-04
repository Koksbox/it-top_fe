const state = {
  todos: [],
  filter: 'all',
  search: '',
  nextId: 1,
  isSaving: false,
};

const todoForm = document.querySelector('#todoForm');
const todoInput = document.querySelector('#todoInput');
const todoList = document.querySelector('#todoList');
const searchInput = document.querySelector('#searchInput');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.querySelector('#clearCompletedBtn');
const totalCount = document.querySelector('#totalCount');
const activeCount = document.querySelector('#activeCount');
const doneCount = document.querySelector('#doneCount');
const statusMessage = document.querySelector('#statusMessage');
const headerBadge = document.querySelector('.header-badge');

function wait(ms = 500) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function saveTodo(todo) {
  return wait().then(() => todo);
}

function setSavingUI(isSaving) {
  statusMessage.hidden = !isSaving;
  statusMessage.textContent = isSaving ? 'Сохраняем...' : '';
}

function createDeleteHandler(id) {
  return function () {
    deleteTodo(id);
  };
}

function createTodoItem(todo) {
  const li = document.createElement('li');
  li.className = todo.completed ? 'todo-item completed' : 'todo-item';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.completed;
  checkbox.addEventListener('change', function () {
    toggleTodo(todo.id);
  });

  const text = document.createElement('span');
  text.className = 'todo-text';
  text.textContent = todo.text;

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '×';
  deleteBtn.addEventListener('click', createDeleteHandler(todo.id));

  li.append(checkbox, text, deleteBtn);
  return li;
}

async function addTodo() {
  const text = todoInput.value.trim();

  if (!text || state.isSaving) return;

  const todo = {
    id: state.nextId,
    text,
    completed: false,
  };

  state.nextId += 1;
  todoInput.value = '';

  state.isSaving = true;
  setSavingUI(true);

  await saveTodo(todo);

  state.todos.push(todo);
  state.isSaving = false;
  setSavingUI(false);

  renderTodos();
  updateStats();
}

async function deleteTodo(id) {
  if (state.isSaving) return;

  state.isSaving = true;
  setSavingUI(true);

  await wait();

  state.todos = state.todos.filter((todo) => todo.id !== id);
  state.isSaving = false;
  setSavingUI(false);

  renderTodos();
  updateStats();
}

function toggleTodo(id) {
  const todo = state.todos.find((item) => item.id === id);

  if (!todo) return;

  todo.completed = !todo.completed;
  renderTodos();
  updateStats();
}

function searchTodos() {
  state.search = searchInput.value.trim().toLowerCase();
  renderTodos();
}

function getFilteredTodos() {
  return state.todos.filter((todo) => {
    const matchesFilter =
      state.filter === 'all' ||
      (state.filter === 'active' && !todo.completed) ||
      (state.filter === 'completed' && todo.completed);

    const matchesSearch =
      state.search === '' || todo.text.toLowerCase().includes(state.search);

    return matchesFilter && matchesSearch;
  });
}

function renderTodos() {
  const todos = getFilteredTodos();
  todoList.innerHTML = '';

  if (todos.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent =
      state.todos.length === 0
        ? 'Список пуст. Добавьте первую задачу.'
        : 'Ничего не найдено.';
    todoList.append(empty);
    return;
  }

  todos.forEach((todo) => {
    todoList.append(createTodoItem(todo));
  });
}

function updateStats() {
  const total = state.todos.length;
  const active = state.todos.filter((todo) => !todo.completed).length;
  const done = state.todos.filter((todo) => todo.completed).length;

  totalCount.textContent = String(total);
  activeCount.textContent = String(active);
  doneCount.textContent = String(done);
  headerBadge.textContent = `${total} tasks`;
}

function clearCompleted() {
  state.todos = state.todos.filter((todo) => !todo.completed);
  renderTodos();
  updateStats();
}

function setActiveFilter(button) {
  state.filter = button.dataset.filter;

  filterButtons.forEach((btn) => {
    btn.classList.toggle('active', btn === button);
  });

  renderTodos();
}

todoForm.addEventListener('submit', (event) => {
  event.preventDefault();
  addTodo();
});

searchInput.addEventListener('input', () => {
  searchTodos();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveFilter(button);
  });
});

clearCompletedBtn.addEventListener('click', () => {
  clearCompleted();
});

renderTodos();
updateStats();
