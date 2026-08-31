import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'todo-app.tasks.v1';

const FILTERS = {
  all: 'All',
  active: 'Active',
  completed: 'Completed',
};

function createTask(text) {
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    text,
    completed: false,
  };
}

function readStoredTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((task) => task && typeof task.id === 'string' && typeof task.text === 'string')
      .map((task) => ({
        id: task.id,
        text: task.text,
        completed: Boolean(task.completed),
      }));
  } catch {
    return [];
  }
}

function TodoForm({ onAdd }) {
  const [value, setValue] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const next = value.trim();
    if (!next) return;
    onAdd(next);
    setValue('');
  };

  return (
    <form className="todo-form" onSubmit={submit}>
      <label htmlFor="new-task" className="visually-hidden">
        Add a new task
      </label>
      <input
        id="new-task"
        name="new-task"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="What needs to be done?"
      />
      <button type="submit">Add task</button>
    </form>
  );
}

function TodoItem({ task, onToggle, onDelete, onSave }) {
  const [draft, setDraft] = useState(task.text);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setDraft(task.text);
  }, [task.text]);

  const finishEdit = () => {
    const next = draft.trim();
    if (!next) {
      setDraft(task.text);
      setIsEditing(false);
      return;
    }
    onSave(task.id, next);
    setIsEditing(false);
  };

  return (
    <li className="todo-item">
      <input
        id={`toggle-${task.id}`}
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        aria-label={`Mark ${task.text} as ${task.completed ? 'active' : 'completed'}`}
      />

      {isEditing ? (
        <input
          className="todo-edit"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={finishEdit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') finishEdit();
            if (event.key === 'Escape') {
              setDraft(task.text);
              setIsEditing(false);
            }
          }}
          aria-label="Edit task text"
          autoFocus
        />
      ) : (
        <label
          htmlFor={`toggle-${task.id}`}
          className={task.completed ? 'todo-text completed' : 'todo-text'}
        >
          {task.text}
        </label>
      )}

      <div className="todo-actions">
        <button type="button" onClick={() => setIsEditing((current) => !current)}>
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
        <button type="button" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </li>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(() => readStoredTasks());
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (filter === 'active') return tasks.filter((task) => !task.completed);
    if (filter === 'completed') return tasks.filter((task) => task.completed);
    return tasks;
  }, [tasks, filter]);

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - activeCount;

  const addTask = (text) => {
    setTasks((current) => [createTask(text), ...current]);
  };

  const toggleTask = (id) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  };

  const deleteTask = (id) => {
    setTasks((current) => current.filter((task) => task.id !== id));
  };

  const saveTask = (id, text) => {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, text } : task)));
  };

  const clearCompleted = () => {
    setTasks((current) => current.filter((task) => !task.completed));
  };

  return (
    <main className="todo-app" aria-labelledby="todo-heading">
      <section className="todo-card">
        <h1 id="todo-heading">To-Do List</h1>
        <p className="subtitle">Track your tasks and keep progress between sessions.</p>

        <TodoForm onAdd={addTask} />

        <div className="toolbar" role="group" aria-label="Filter tasks">
          {Object.entries(FILTERS).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? 'active-filter' : ''}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
            >
              {label}
            </button>
          ))}
        </div>

        <ul className="todo-list" aria-live="polite">
          {filteredTasks.length === 0 ? (
            <li className="empty-state">No tasks in this view yet. Add one to get started.</li>
          ) : (
            filteredTasks.map((task) => (
              <TodoItem
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onSave={saveTask}
              />
            ))
          )}
        </ul>

        <footer className="todo-footer">
          <span>
            {activeCount} active · {completedCount} completed
          </span>
          <button
            type="button"
            onClick={clearCompleted}
            disabled={completedCount === 0}
            aria-disabled={completedCount === 0}
          >
            Clear completed
          </button>
        </footer>
      </section>
    </main>
  );
}
