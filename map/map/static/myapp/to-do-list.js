function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ToDoListDB", 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;
            db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });
        };

        request.onerror = function (event) {
            reject(new Error("Database error: " + event.target.errorCode));
        };

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };
    });
}

function addTask(db, taskText) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["tasks"], "readwrite");
        const store = transaction.objectStore("tasks");
        const task = { text: taskText };
        const request = store.add(task);

        request.onsuccess = function () {
            resolve();
        };

        request.onerror = function (event) {
            reject(new Error("Error adding task: " + event.target.error));
        };
    });
}

function getAllTasks(db) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["tasks"], "readonly");
        const store = transaction.objectStore("tasks");
        const request = store.getAll();

        request.onsuccess = function (event) {
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            reject(new Error("Error fetching tasks: " + event.target.error));
        };
    });
}

function displayTasks(tasks, listElement) {
    listElement.innerHTML = ""; 
    tasks.forEach(task => {
        const li = document.createElement("li");
        li.textContent = task.text;
        listElement.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const db = await openDatabase();
    const addTaskButton = document.getElementById("addTask");
    const taskInput = document.getElementById("task");
    const taskList = document.getElementById("taskList");

    addTaskButton.addEventListener("click", async () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            try {
                await addTask(db, taskText);
                taskInput.value = "";
                const tasks = await getAllTasks(db);
                displayTasks(tasks, taskList);
            } catch (error) {
                console.error(error.message);
            }
        } else {
            console.log("Task text is empty or invalid.");
        }
    });

    try {
        const tasks = await getAllTasks(db);
        displayTasks(tasks, taskList);
    } catch (error) {
        console.error(error.message);
    }
});

module.exports = {
    openDatabase,
    addTask,
    getAllTasks,
    displayTasks
}
