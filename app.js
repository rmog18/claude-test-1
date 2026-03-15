const STORAGE_KEY = 'todos';

// --- State ---
let todos = load();
let currentFilter = 'all';

// --- DOM refs ---
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const remainingCount = document.getElementById('remaining-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');

// --- Persistence ---
function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// --- Mutations ---
function addTodo(text) {
  todos.push({ id: Date.now(), text, completed: false });
  save();
  render();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    save();
    render();
  }
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  save();
  render();
}

function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  save();
  render();
}

// --- Render ---
function filteredTodos() {
  if (currentFilter === 'active')    return todos.filter(t => !t.completed);
  if (currentFilter === 'completed') return todos.filter(t => t.completed);
  return todos;
}

function render() {
  const visible = filteredTodos();

  if (visible.length === 0) {
    list.innerHTML = '<li class="empty-state">タスクがありません</li>';
  } else {
    list.innerHTML = visible.map(todo => `
      <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
        <input type="checkbox" ${todo.completed ? 'checked' : ''} aria-label="完了にする">
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="delete-btn" aria-label="削除">×</button>
      </li>
    `).join('');
  }

  const activeCount = todos.filter(t => !t.completed).length;
  remainingCount.textContent = `残り ${activeCount} 件`;
  clearCompletedBtn.style.display = todos.some(t => t.completed) ? '' : 'none';
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- Events ---
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = '';
});

list.addEventListener('change', e => {
  if (e.target.type === 'checkbox') {
    const id = Number(e.target.closest('.todo-item').dataset.id);
    toggleTodo(id);
  }
});

list.addEventListener('click', e => {
  if (e.target.classList.contains('delete-btn')) {
    const id = Number(e.target.closest('.todo-item').dataset.id);
    deleteTodo(id);
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.toggle('active', b === btn));
    render();
  });
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// --- Init ---
render();
