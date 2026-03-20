import express from "express";
import { z } from "zod";

const app = express();
app.use(express.json());

interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  assignee?: string;
  created_at: string;
}

// In-memory store
const tasks: Task[] = [];

// BUG: No input validation on POST
app.post("/tasks", (req, res) => {
  const task: Task = {
    id: String(tasks.length + 1),
    title: req.body.title,
    status: req.body.status || "todo",
    assignee: req.body.assignee,
    created_at: new Date().toISOString(),
  };
  tasks.push(task);
  res.status(201).json(task);
});

// BUG: Returns 200 with empty body when task not found
app.get("/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  res.json(task);
});

app.get("/tasks", (_req, res) => {
  res.json(tasks);
});

// BUG: No validation, allows invalid status transitions
app.patch("/tasks/:id", (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  Object.assign(task, req.body);
  res.json(task);
});

// BUG: No 404 handling for delete
app.delete("/tasks/:id", (req, res) => {
  const index = tasks.findIndex((t) => t.id === req.params.id);
  tasks.splice(index, 1);
  res.status(204).send();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };
