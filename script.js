// متغیرهای اصلی
let todos = [];
let currentFilter = 'all';

// عناصر DOM رو می‌گیریم
const todoInput = document.getElementById('todoInput');
const dueDateInput = document.getElementById('dueDateInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const stats = document.getElementById('stats');

// وقتی صفحه لود شد، داده‌ها رو از localStorage بخون
window.addEventListener('load', () => {
  const saved = localStorage.getItem('todos');
  if (saved) {
    todos = JSON.parse(saved);
  }
  renderTodos(); // اول لیست رو نشون بده
  updateStats();  // آمار رو هم آپدیت کن
});

// تابع اصلی برای رندر کردن لیست
function renderTodos() {
  todoList.innerHTML = ''; // اول پاک کن
  
  let filteredTodos = todos;
  
  if (currentFilter === 'active') {
    filteredTodos = todos.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filteredTodos = todos.filter(t => t.completed);
  }
  
  filteredTodos.forEach(todo => {
    // ساختن li
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'todo-item');
    if (todo.completed) li.classList.add('completed');
    
    // چک کردن overdue
    if (todo.dueDate && !todo.completed) {
      const today = new Date().toISOString().split('T')[0];
      if (todo.dueDate < today) {
        li.classList.add('overdue');
      }
    }
    
    // متن تسک
    const textSpan = document.createElement('span');
    textSpan.classList.add('todo-text');
    textSpan.textContent = todo.text;
    
    // امکان ویرایش با دابل کلیک
    textSpan.addEventListener('dblclick', () => {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = todo.text;
      input.classList.add('form-control');
      li.insertBefore(input, textSpan);
      li.removeChild(textSpan);
      input.focus();
      
      input.addEventListener('blur', () => {
        todo.text = input.value.trim() || todo.text; // اگه خالی بود همون قبلی بمونه
        saveTodos();
        renderTodos();
        updateStats();
      });
      
      input.addEventListener('keypress', e => {
        if (e.key === 'Enter') input.blur();
      });
    });
    
    // تاریخ سررسید
    const dateSpan = document.createElement('span');
    dateSpan.classList.add('todo-date');
    if (todo.dueDate) {
      dateSpan.textContent = todo.dueDate;
    }
    
    // دکمه انجام شده
    const doneBtn = document.createElement('button');
    doneBtn.classList.add('btn', 'btn-sm', 'btn-outline-success', 'me-2');
    doneBtn.textContent = todo.completed ? '↺' : '✔';
    doneBtn.addEventListener('click', () => {
      todos = todos.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t);
      saveTodos();
      renderTodos();
      updateStats();
    });
    
    // دکمه حذف
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-sm', 'btn-outline-danger');
    deleteBtn.textContent = '✖';
    deleteBtn.addEventListener('click', () => {
      todos = todos.filter(t => t.id !== todo.id);
      saveTodos();
      renderTodos();
      updateStats();
    });
    
    // اضافه کردن همه به li
    li.appendChild(textSpan);
    if (todo.dueDate) li.appendChild(dateSpan);
    li.appendChild(doneBtn);
    li.appendChild(deleteBtn);
    
    todoList.appendChild(li);
  });
}

// تابع ذخیره در localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// تابع آپدیت آمار
function updateStats() {
  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;
  stats.textContent = `${completedCount} از ${totalCount} کامل شده`;
}

// افزودن تسک جدید
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTodo();
});

function addTodo() {
  const text = todoInput.value.trim();
  if (text === '') return; // خالی نباشه
  
  const newTodo = {
    id: Date.now(),
    text: text,
    completed: false,
    dueDate: dueDateInput.value || null
  };
  
  todos = [...todos, newTodo]; // با spread اضافه کن
  saveTodos();
  renderTodos();
  updateStats();
  
  todoInput.value = '';
  dueDateInput.value = '';
  todoInput.focus();
}

// مدیریت فیلترها
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTodos();
  });
});

// پاک کردن همه کامل شده‌ها
clearCompletedBtn.addEventListener('click', () => {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  renderTodos();
  updateStats();
});