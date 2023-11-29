const request = indexedDB.open("ToDoListDB", 1);
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("tasks", {keypath: "id", autoIncrement: true});
};

request.onsuccess = function (event) {
    const db = event.target.result;
    const addTaskButton = document.getElementById("addTask");
    const taskInput = document.getElementById("task");
    const taskList = document.getElementById("taskList");

    addTaskButton.addEventListener("click", function() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const transaction = db.transaction(["tasks"], "readwrite");
            const store = transaction.objectStore("tasks");
            const task = {text: taskText}
            const addRequest = store.add(task);
            addRequest.onsuccess = function (event) {
                taskInput.value = "";
                displayTasks(store, taskList);
            };
            addRequest.onerror = function (event) {
            console.error("Error adding task:", event.target.error);
            };
        } else {
            console.log("Task text is empty or invalid.");
        }
    })

    function displayTasks(store, list) {
        const request = store.getAll();
        request.onsuccess = function (event) {
            list.innerHTML = "";
            const tasks = event.target.result;
            tasks.forEach(function (task) {
                const li = document.createElement("li");
                li.textContent = task.text;
                list.appendChild(li);                        
            });
        }
    }
    displayTasks(db.transaction(["tasks"]).objectStore("tasks"), taskList);
};