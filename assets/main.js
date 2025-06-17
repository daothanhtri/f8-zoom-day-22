const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const taskModal = $("#addTaskModal");
const closeBtn = $(".modal-close");
const cancelBtn = $(".btn-cancel");
const todoForm = $(".todo-app-form");
const todoList = $("#todoList");

const overlay = $(".modal-overlay");

const titleInput = $("#taskTitle");
const searchInput = $(".search-input");

const tabs = $(".tabs");
const tabList = $$(".tab-button");
const allTab = $(".all-tab");
const activeTab = $(".active-tab");
const completeTab = $(".completed-tab");

// console log test
console.log(titleInput);

let editIndex = null;

// Toggle Show/Hide Modal
function toggleModal() {
  taskModal.classList.toggle("show");
}

// Handle Show/Hide Modal
function handleToggleModal(e) {
  todoForm.reset();

  toggleModal();

  editIndex = null;

  if (e.currentTarget === addBtn) {
    setTimeout(() => titleInput.focus(), 100);
  }

  if (e.currentTarget === closeBtn || e.currentTarget === cancelBtn) {
    confirm(`Are you sure you want to close?`);

    const formTitle = taskModal.querySelector(".modal-title");

    if (formTitle) {
      formTitle.textContent =
        formTitle.dataset.original || formTitle.textContent;
      delete formTitle.dataset.original;
    }

    const submitBtn = todoForm.querySelector(".btn-submit");
    if (submitBtn) {
      submitBtn.textContent =
        submitBtn.dataset.original || submitBtn.textContent;
      delete submitBtn.dataset.original;
    }

    setTimeout(() => {
      taskModal.querySelector(".modal").scrollTop = 0;
    }, 300);
  }
}

// Listen event click on button for open/close form add tasks
[addBtn, closeBtn, cancelBtn].forEach((btn) => {
  btn.addEventListener("click", handleToggleModal);
});

// Close modal when user click on overlay
overlay.addEventListener("click", (e) => {
  if (e.target === overlay) {
    toggleModal();
  }
});

// Close modal when user press 'ESC'
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && overlay.classList.contains("show")) {
    toggleModal();
  }
});

const todoTasks = JSON.parse(localStorage.getItem("todoTasks")) ?? [];

// Form submit
todoForm.addEventListener("submit", addTask);

// Function handle add tasks
function addTask(e) {
  e.preventDefault();

  const formData = Object.fromEntries(new FormData(todoForm));

  if (editIndex) {
    if (isDuplicateTask(formData, editIndex)) {
      showToast(
        "The title already exists, please enter another title.",
        "warning"
      );
      return;
    }

    formData.title = formData.title.trim();
    formData.isCompleted = todoTasks[editIndex].isCompleted;
    todoTasks[editIndex] = formData;
  } else {
    if (isDuplicateTask(formData)) {
      showToast(
        "The title already exists, please enter another title.",
        "warning"
      );
      return;
    }

    formData.title = formData.title.trim();
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

  if (editIndex) {
    showToast("Task updated successfully.", "success");
  } else {
    showToast("Task added successfully.", "success");
  }
}

// Save tasks list to local memory
function saveTasks(tasks) {
  localStorage.setItem("todoTasks", JSON.stringify(tasks));
  renderTasks(tasks);
}

// Check duplicate task title ==============> task này ở bài day23 anh bị xót, anh cập nhật ở day24 nha Dũng XD
function isDuplicateTask(newTask, taskIndex = -1) {
  return todoTasks.some(
    (task, index) =>
      task.title.trim().toLowerCase() === newTask.title.trim().toLowerCase() &&
      taskIndex !== index
  );
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
    showToast("Task updated successfully.", "info");
  }

  if (deleteBtn) {
    const taskIndex = deleteBtn.dataset.index;
    const task = todoTasks[taskIndex];

    if (confirm(`Are you sure you want to delete task "${task.title}"`)) {
      todoTasks.splice(taskIndex, 1);

      saveTasks(todoTasks);
      renderTasks(todoTasks);
      showToast("Task deleted successfully.", "info");
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

// Handle action on tab button
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

// Toast function
function showToast(message = "", type = "info") {
  const toastContainer = $("#toast-container");

  const toast = document.createElement("div");

  // Auto remove toast
  const autoRemoveId = setTimeout(function () {
    toastContainer.removeChild(toast);
  }, 5000);

  // Remove toast when clicked
  toast.onclick = function (e) {
    if (e.target.closest(".toast-close")) {
      toastContainer.removeChild(toast);
      clearTimeout(autoRemoveId);
    }
  };

  const icons = {
    success: "fa-solid fa-circle-check",
    info: "fa-solid fa-circle-info",
    warning: "fa-solid fa-circle-exclamation",
    error: "fa-solid fa-circle-exclamation",
  };

  const icon = icons[type];

  toast.classList.add("toast", `toast-${type}`);
  toast.style.animation = `slideInLeft ease-out .3s, fadeOut ease-in 0.6s 3.4s forwards`;

  toast.innerHTML = `
                    <div class="toast-icon">
                        <i class="${icon}"></i>
                    </div>
                    <div class="toast-body">
                        <p class="toast-msg">${message}</p>
                    </div>
                    <div class="toast-close">
                        <i class="fas fa-times"></i>
                    </div>
                `;
  toastContainer.appendChild(toast);
}

// Function render tasks list to html
function renderTasks(tasks) {
  const todoList = $("#todoList");
  todoList.innerHTML = "";

  if (!tasks.length) {
    todoList.textContent = "No results found!";
    return;
  }

  tasks.map((task, index) => {
    const taskCard = document.createElement("div");
    taskCard.classList.add("task-card", task.cardColor);

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
