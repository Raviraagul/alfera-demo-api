import express from "express";
import { z } from "zod";

const app = express();
app.use(express.json());

const createTaskSchema = z.object({
  title: z.string({ required_error: "Title is required" }).min(1, "Title is required"),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  assignee: z.string().optional()
});

type TaskInput = z.infer<typeof createTaskSchema>;

type Task = TaskInput & {
  id: string;
  created_at: string;
};

const tasks: Task[] = [];
app.post("/tasks", (req, res) => {
  const result = createTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: result.error.issues[0].message
    });
  }

  const task: Task = {
    id: String(tasks.length + 1),
    created_at: new Date().toISOString(),
    ...result.data
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
