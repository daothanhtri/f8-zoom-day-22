const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const taskModal = $("#addTaskModal");
const closeBtn = $(".modal-close");
const cancelBtn = $(".btn-cancel");
const todoForm = $(".todo-app-form");
const todoList = $("#todoList");
const titleInput = $("#taskTitle");
const searchInput = $(".search-input");
const tabs = $(".tabs");
const allTab = $(".all-tab");
const activeTab = $(".active-tab");
const completeTab = $(".completed-tab");

const tabList = $$(".tab-button");

// console log test
console.log(titleInput);

let editIndex = null;

// Toggle Show/Hide Modal
function toggleModal() {
  taskModal.classList.toggle("show");
  setTimeout(() => titleInput.focus(), 100);
}

// Listen event click on button for open/close form add tasks
[addBtn, closeBtn, cancelBtn].forEach((btn) => {
  btn.addEventListener("click", toggleModal);
});

const todoTasks = JSON.parse(localStorage.getItem("todoTasks")) ?? [
  {
    title: "Cleaning House",
    description: "description for cleaning house",
    category: "other",
    priority: "high",
    startTime: "9:00",
    endTime: "10:00",
    dueDate: "2025-06-15",
    cardColor: "blue",
    isCompleted: false,
  },
  {
    title: "Home Work",
    description: "description for home work",
    category: "planning",
    priority: "high",
    startTime: "09:00",
    endTime: "23:00",
    dueDate: "2025-06-15",
    cardColor: "purple",
    isCompleted: true,
  },
];

// Form submit
todoForm.addEventListener("submit", addTask);

// Function handle add tasks
function addTask(e) {
  e.preventDefault();

  const formData = Object.fromEntries(new FormData(todoForm));

  if (editIndex) {
    todoTasks[editIndex] = formData;
  } else {
    formData.isCompleted = false;

    // Add new task to first index
    todoTasks.unshift(formData);
  }

  // Save task on local memory
  saveTasks(todoTasks);

  // Close modal
  toggleModal();

  // Reset form input
  todoForm.reset();

  renderTasks(todoTasks);
}

// Save tasks list to local memory
function saveTasks(tasks) {
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
  renderTasks(tasks);
}

// Handle all button in Task
todoList.addEventListener("click", (e) => {
  const editBtn = e.target.closest(".edit-btn");
  const deleteBtn = e.target.closest(".delete-btn");
  const completeBtn = e.target.closest(".complete-btn");

  // When user click edit button
  if (editBtn) {
    const taskIndex = editBtn.dataset.index;
    const task = todoTasks[taskIndex];

    editIndex = taskIndex;

    for (const key in task) {
      const value = task[key];
      const input = $(`[name = "${key}"]`);
      if (input) {
        input.value = value;
      }
    }

    // Change text Title to "Edit Task"
    const formTitle = taskModal.querySelector(".modal-title");
    if (formTitle) {
      formTitle.dataset.original = formTitle.textContent;
      formTitle.textContent = "Edit Task";
    }

    console.log(formTitle);

    // Change text on button from "Create Task" to "Save Task"
    const submitBtn = taskModal.querySelector(".btn-submit");
    if (submitBtn) {
      submitBtn.dataset.original = submitBtn.textContent;
      submitBtn.textContent = "Save Task";
    }

    // Open form for edit task
    toggleModal();
  }

  if (completeBtn) {
    const taskIndex = completeBtn.dataset.index;
    const task = todoTasks[taskIndex];

    task.isCompleted = !task.isCompleted;

    saveTasks(todoTasks);
    renderTasks(todoTasks);
  }

  if (deleteBtn) {
    const taskIndex = deleteBtn.dataset.index;
    const task = todoTasks[taskIndex];

    if (confirm(`Are you sure you want to delete the ${task.title}`)) {
      todoTasks.splice(taskIndex, 1);

      saveTasks(todoTasks);
      renderTasks(todoTasks);
    }
  }
});

// Tabs

// Render task list with status
const tabStatus = {
  all() {
    renderTasks(todoTasks);
  },
  active() {
    const activeTaskList = todoTasks.filter((task) => !task.isCompleted);
    renderTasks(activeTaskList);
  },
  completed() {
    const completeTaskList = todoTasks.filter((task) => task.isCompleted);
    renderTasks(completeTaskList);
  },
};

tabs.addEventListener("click", (e) => {
  const activeTabBtn = e.target.closest(".tab-button");
  if (activeTabBtn) {
    [allTab, activeTab, completeTab].forEach((tab) =>
      tab.classList.remove("active")
    );
    activeTabBtn.classList.add("active");

    // Set data-status corresponding to each state
    const status = activeTabBtn.dataset.status;

    tabStatus[status]();
  }
});

// Search Input
searchInput.oninput = function () {
  if (searchInput.value != null) {
    [allTab, activeTab, completeTab].forEach((tab) =>
      tab.classList.remove("active")
    );
    allTab.classList.add("active");

    // get input value and assign to variable str
    let str = searchInput.value.toString().toLowerCase();
    // New list filter with input value
    let searchList = todoTasks.filter(
      (task) =>
        task.title.toString().toLowerCase().includes(str) ||
        task.description.toString().toLowerCase().includes(str)
    );
    renderTasks(searchList);
  }
};

// Function Render tasks list to html
function renderTasks(tasks) {
  const todoList = $("#todoList");

  if (!tasks.length) {
    todoList.innerHTML = `
            <p>No results found!</p>
        `;
    return;
  }

  todoList.innerHTML = "";

  tasks.map((task, index) => {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card");
    taskCard.classList.add(task.cardColor);

    if (task.isCompleted) {
      taskCard.classList.add("completed");
    }

    const taskHeader = document.createElement("div");
    taskHeader.classList.add("task-header");

    const taskTitle = document.createElement("h3");
    taskTitle.classList.add("task-title");
    taskTitle.textContent = task.title;

    const taskMenuBtn = document.createElement("button");
    taskMenuBtn.classList.add("task-menu");
    taskMenuBtn.innerHTML = `
    <i class="fa-solid fa-ellipsis fa-icon"></i>
    <div class="dropdown-menu">
      <div class="dropdown-item edit edit-btn" data-index="${index}">
        <i class="fa-solid fa-pen-to-square fa-icon"></i>
        Edit
      </div>
      <div class="dropdown-item complete complete-btn" data-index="${index}">
        <i class="fa-solid fa-check fa-icon"></i>
        ${task.isCompleted ? "Mark as Active" : "Mark as Complete"}
      </div>
      <div class="dropdown-item delete delete-btn" data-index="${index}">
        <i class="fa-solid fa-trash fa-icon"></i>
        Delete
      </div>
    </div>
    `;

    taskHeader.appendChild(taskTitle);
    taskHeader.appendChild(taskMenuBtn);

    const taskDesc = document.createElement("p");
    taskDesc.classList.add("task-description");
    taskDesc.textContent = task.description;

    const taskTimeRow = document.createElement("div");
    taskTimeRow.classList.add("task-time-row");

    const taskTime = document.createElement("div");
    taskTime.classList.add("task-time");
    taskTime.textContent = `${task.startTime} - ${task.endTime}`;

    const taskDueDate = document.createElement("div");
    taskDueDate.classList.add("task-due-date");
    taskDueDate.textContent = `Due: ${task.dueDate}`;

    taskTimeRow.appendChild(taskTime);
    taskTimeRow.appendChild(taskDueDate);

    taskCard.appendChild(taskHeader);
    taskCard.appendChild(taskDesc);
    taskCard.appendChild(taskTimeRow);

    todoList.appendChild(taskCard);
  });
}

renderTasks(todoTasks);
