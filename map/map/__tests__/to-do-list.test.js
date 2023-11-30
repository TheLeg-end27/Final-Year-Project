const { openDatabase, addTask, getAllTasks, displayTasks} = require('../static/myapp/to-do-list.js');
let db;
global.Response = function (body, init) {
    return {
      body: body,
      status: (init && init.status) || 200,
      json: () => Promise.resolve(body),

    };
};
  
const indexedDBMock = {
    open: jest.fn().mockImplementation((name, version) => {
        db = {
            version,
            name,
            objectStoreNames: ['tasks'],
            createObjectStore: jest.fn().mockImplementation((storeName, config) => {
            return {
                name: storeName,
                keyPath: config && config.keyPath,
                autoIncrement: config && config.autoIncrement,
            };
        }),
        transaction: jest.fn().mockImplementation((stores, mode) => {
          return {
            objectStore: jest.fn().mockReturnValue({
              add: jest.fn().mockImplementation((task) => {
                return {
                  onsuccess: null,
                  onerror: null,
                  result: task.id,
                  dispatchEvent: jest.fn((event) => {
                    if (event.type === 'success' && this.onsuccess) {
                      this.onsuccess();
                    }
                  }),
                };
              }),
              getAll: jest.fn().mockImplementation(() => {
                return {
                  onsuccess: null,
                  onerror: null,
                  result: [{ id: 1, text: 'Test Task' }],
                  dispatchEvent: jest.fn((event) => {
                    if (event.type === 'success' && this.onsuccess) {
                      this.onsuccess();
                    }
                  }),
                };
              }),
            }),
          };
        }),
      };
      
      const eventTarget = {
        result: db,
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
        dispatchEvent: jest.fn((event) => {
          if (event.type === 'upgradeneeded' && eventTarget.onupgradeneeded) {
            eventTarget.onupgradeneeded({ target: { result: db } });
          } else if (event.type === 'success' && eventTarget.onsuccess) {
            eventTarget.onsuccess({ target: { result: db } });
          }
        }),
      };
      
      return eventTarget;
    }),
  };
  
  Object.defineProperty(window, 'indexedDB', {
    value: indexedDBMock,
  });
  
  document.body.innerHTML = `
    <input type="text" id="task" placeholder="Enter a new task">
    <button id="addTask">Add Task</button>
    <ul id="taskList"></ul>
  `;
  
describe('openDatabase', () => {
    it('opens the database successfully', async () => {
        expect.assertions(1);
        await expect(openDatabase()).resolves.toBeDefined();
    }); 
});

describe('addTask', () => {
    it('adds a task to the database', async () => {
      expect.assertions(2);

      const taskText = 'Test Task';
      await addTask(db, taskText);
      expect(db.transaction).toHaveBeenCalledWith(["tasks"], "readwrite");
    });
  });

describe('getAllTasks', () => {
    it('fetches all tasks from the database', async () => {
      expect.assertions(1);

      const tasks = await getAllTasks(db);
      expect(db.transaction).toHaveBeenCalledWith(["tasks"], "readonly");
      expect(Array.isArray(tasks)).toBe(true);
    });
});

describe('displayTasks', () => {
    it('displays tasks in the list element', () => {
      const tasks = [{ text: 'Task 1' }, { text: 'Task 2' }];
      const listElement = document.getElementById('taskList');
      displayTasks(tasks, listElement);
      expect(listElement.children.length).toBe(tasks.length);
      expect(listElement.children[0].textContent).toBe('Task 1');
      expect(listElement.children[1].textContent).toBe('Task 2');
    });
});