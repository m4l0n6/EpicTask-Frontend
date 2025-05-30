import React from 'react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Task } from "@/types";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
// import { useTask } from "@/contexts/TaskContext";

// Định ng nghĩa lược đồ biểu mẫu với Zod
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  deadline: z
    .date({
      required_error: "Deadline is required"
    })
    .min(
      new Date(new Date().setHours(0, 0, 0, 0)),
      "Deadline must be in the future"
    ),
  xpReward: z.coerce
    .number({ required_error: "XP reward is required" })
    .min(1, "Minimum XP reward is 1")
    .max(100, "Maximum XP reward is 100"),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskFormProps {
  task?: Task;
  onCancel: () => void;
  onSubmit: (values: TaskFormValues) => void;
  isSubmitting?: boolean;
}


const TaskForm: React.FC<TaskFormProps> = ({ 
  task, 
  onSubmit, 
  onCancel,
  isSubmitting = false 
}) => {
  // const { getTodayTasksCount } = useTask();
  // const tasksToday = getTodayTasksCount();
  const defaultValues: Partial<TaskFormValues> = {
    title: task?.title || "",
    description: task?.description || "",
    deadline: task?.deadline ? new Date(task.deadline) : new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
    xpReward: task?.xpReward || 10,
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues,
  });

  const handleSubmit = (values: TaskFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        action=""
        className="space-y-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter task description"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="deadline"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Deadline</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="opacity-50 ml-auto w-4 h-4" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>                <PopoverContent className="p-0 w-auto" align="start">               
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined}
                    onSelect={(date) => {
                      console.log("Date selected:", date);
                      if (date) {
                        field.onChange(date);
                        // Force the form to update with the new value
                        form.setValue("deadline", date, { shouldValidate: true });
                      }
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Set a deadline for your task to stay on track
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="xpReward"
          render={({ field }) => (
            <FormItem>
              <FormLabel>XP Reward (1-100)</FormLabel>
              <FormControl>
                <Input type="number" min="1" max="100" {...field} />
              </FormControl>
              <FormDescription>
                Higher XP for more challenging tasks (max 100 XP)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2 border-2 border-b-transparent rounded-full w-4 h-4 animate-spin"></span>
                {task ? "Updating..." : "Creating..."}
              </>
            ) : (
              task ? "Update Task" : "Create Task"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaskForm