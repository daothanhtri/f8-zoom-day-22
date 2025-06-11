const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const addBtn = $(".add-btn");
const taskModal = $("#addTaskModal");
const closeBtn = $(".modal-close");
const cancelBtn = $(".btn-cancel");
const todoForm = $(".todo-app-form");
const titleInput = $("#taskTitle");

// console log test
console.log(titleInput);

let todoTasks = [];

// Toggle Modal
function toggleModal() {
  taskModal.classList.toggle("show");

  setTimeout(() => titleInput.focus(), 100);
}

[addBtn, closeBtn, cancelBtn].forEach((btn) => {
  btn.addEventListener("click", toggleModal);
});

// Form submit
todoForm.addEventListener("submit", addTask);

// Function handle add tasks
function addTask(e) {
  e.preventDefault();

  const newTask = Object.fromEntries(new FormData(todoForm));
  newTask.isCompleted = false;

  // Add new task to first index
  todoTasks.unshift(newTask);

  // Reset form input
  todoForm.reset();

  // Close modal
  toggleModal();

  renderTasks(todoTasks);
}

// Function Render tasks list to html
function renderTasks(tasks) {
  const todoList = $("#todoList");

  if (!tasks.length) {
    todoList.innerHTML = `
            <p>Chưa có công việc nào.</p>
        `;
    return;
  }

  const html = tasks
    .map(
      (task) => `
    <div class="task-card ${task.cardColor} ${
        task.isCompleted ? "complete" : ""
      }">
          <div class="task-header">
            <h3 class="task-title">${task.title}</h3>
            <button class="task-menu">
              <i class="fa-solid fa-ellipsis fa-icon"></i>
              <div class="dropdown-menu">
                <div class="dropdown-item">
                  <i class="fa-solid fa-pen-to-square fa-icon"></i>
                  Edit
                </div>
                <div class="dropdown-item complete">
                  <i class="fa-solid fa-check fa-icon"></i>
                  ${task.isCompleted ? "Mark as Active" : "Mark as Complete"}
                </div>
                <div class="dropdown-item delete">
                  <i class="fa-solid fa-trash fa-icon"></i>
                  Delete
                </div>
              </div>
            </button>
          </div>
          <p class="task-description">
            ${task.description}
          </p>
           <div class="task-time-row">
            <div class="task-time">${task.startTime} - ${task.endTime}</div>
            <div class="task-due-date">Due: ${task.dueDate}</div>
          </div>
        </div>
        `
    )
    .join("");

  todoList.innerHTML = html;
}

renderTasks(todoTasks);
