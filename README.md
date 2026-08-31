# To-Do List App

A simple and accessible React + Vite to-do list application for managing daily tasks.

## Setup and run

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Features

- Add new tasks
- Mark tasks as completed or active
- Edit task text inline
- Delete tasks
- Filter by **All**, **Active**, and **Completed**
- Clear completed tasks
- Empty-state messaging when no tasks match the current view

## localStorage persistence

Tasks are automatically saved to browser `localStorage` under the key `todo-app.tasks.v1`.
On startup, the app loads saved tasks from that key, so task state persists across refreshes and browser restarts.
