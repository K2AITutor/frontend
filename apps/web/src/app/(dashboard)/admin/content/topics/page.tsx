"use client";

import { useState } from "react";
import { BookOpen, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import AdminContentListPage, {
  formatDate,
  StatusBadge,
} from "../_components/AdminContentListPage";
import type { AdminTopic } from "@/lib/api/admin-content";
import { useSubjectOptions } from "@/lib/api/admin-content";
import { createTopic, updateTopic, deleteTopic } from "@/lib/api/topics-admin";
import { useAdminToken } from "@/lib/api/useAdminToken";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Textarea } from "@/components/dashboard/ui/textarea";
import { Combobox } from "@/components/dashboard/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dashboard/ui/dialog";
import { toast } from "@/components/dashboard/ui/sonner";

type TopicForm = {
  subjectCode: string;
  topicCode: string;
  name: string;
  strandCode: string;
  strandName: string;
  description: string;
  unitLabel: string;
  sortOrder: number;
  isActive: boolean;
};

const EMPTY_FORM: TopicForm = {
  subjectCode: "",
  topicCode: "",
  name: "",
  strandCode: "",
  strandName: "",
  description: "",
  unitLabel: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminContentTopicsPage() {
  const token = useAdminToken();
  const queryClient = useQueryClient();
  const { options: subjectOptions } = useSubjectOptions();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTopic | null>(null);
  const [deleting, setDeleting] = useState<AdminTopic | null>(null);
  const [form, setForm] = useState<TopicForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["admin", "content", "topics"] });
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsDialogOpen(true);
  }

  function openEdit(topic: AdminTopic) {
    setEditing(topic);
    setForm({
      subjectCode: topic.subjectCode,
      topicCode: topic.topicCode,
      name: topic.name,
      strandCode: topic.strandCode,
      strandName: topic.strandName,
      description: "",
      unitLabel: topic.unitLabel ?? "",
      sortOrder: topic.sortOrder ?? 0,
      isActive: topic.isActive,
    });
    setIsDialogOpen(true);
  }

  async function handleSave() {
    if (!token) {
      toast.error("Admin session is not ready");
      return;
    }
    if (!form.subjectCode || !form.name || !form.strandCode || !form.strandName) return;
    if (!editing && !form.topicCode) return;

    setIsSubmitting(true);
    try {
      if (editing) {
        await updateTopic(
          editing.id,
          {
            subjectCode: form.subjectCode,
            name: form.name,
            strandCode: form.strandCode,
            strandName: form.strandName,
            description: form.description,
            unitLabel: form.unitLabel,
            sortOrder: form.sortOrder,
            isActive: form.isActive,
          },
          token
        );
      } else {
        await createTopic(
          {
            subjectCode: form.subjectCode,
            topicCode: form.topicCode,
            name: form.name,
            strandCode: form.strandCode,
            strandName: form.strandName,
            description: form.description,
            unitLabel: form.unitLabel,
            sortOrder: form.sortOrder,
            isActive: form.isActive,
          },
          token
        );
      }
      setIsDialogOpen(false);
      refresh();
      toast.success(editing ? "Topic updated successfully" : "Topic created successfully");
    } catch (err) {
      console.error("Failed to save topic:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save topic");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleting || !token) return;
    setIsSubmitting(true);
    try {
      await deleteTopic(deleting.id, token);
      setIsDeleteOpen(false);
      refresh();
      toast.success("Topic deleted successfully");
    } catch (err) {
      console.error("Failed to delete topic:", err);
      toast.error(err instanceof Error ? err.message : "Failed to delete topic");
    } finally {
      setIsSubmitting(false);
      setDeleting(null);
    }
  }

  return (
    <>
      <AdminContentListPage<AdminTopic>
        title="Topics"
        description="Manage the curriculum topic catalogue."
        kind="topics"
        icon={<BookOpen className="h-4 w-4" />}
        filters={[
          { key: "subjectCode", label: "Subject", source: "subjects", placeholder: "All subjects" },
          {
            key: "topicCode",
            label: "Topic",
            source: "topics",
            dependsOn: "subjectCode",
            placeholder: "All topics",
          },
          {
            key: "isActive",
            label: "Status",
            type: "select",
            options: [
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ],
          },
        ]}
        toolbarActions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Topic
          </Button>
        }
        rowActions={(item) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={() => {
                setDeleting(item);
                setIsDeleteOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        columns={[
          { key: "code", label: "Topic Code", render: (item) => <span className="font-mono text-xs">{item.topicCode}</span> },
          { key: "name", label: "Name", render: (item) => <span className="font-medium">{item.name}</span> },
          { key: "subject", label: "Subject", render: (item) => item.subjectCode },
          { key: "strand", label: "Strand", render: (item) => item.strandName },
          { key: "questions", label: "Questions", render: (item) => item._count?.questions ?? 0 },
          { key: "status", label: "Status", render: (item) => <StatusBadge value={item.isActive} /> },
          { key: "updated", label: "Updated", render: (item) => formatDate(item.updatedAt) },
        ]}
      />

      {/* Topic Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Topic" : "Add Topic"}</DialogTitle>
            <DialogDescription>
              {editing ? "Update the topic details." : "Create a new curriculum topic."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Combobox
                options={subjectOptions}
                value={form.subjectCode}
                onChange={(value) => setForm({ ...form, subjectCode: value })}
                placeholder="Select subject"
                searchPlaceholder="Search subjects..."
                allowClear={false}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic Code</label>
              <Input
                value={form.topicCode}
                onChange={(e) => setForm({ ...form, topicCode: e.target.value })}
                placeholder="e.g. MM_FUNC_BASICS"
                disabled={!!editing}
              />
              {editing && (
                <p className="text-xs text-muted-foreground">Topic code cannot be changed.</p>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Topic name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Strand Code</label>
              <Input
                value={form.strandCode}
                onChange={(e) => setForm({ ...form, strandCode: e.target.value })}
                placeholder="e.g. FUNC"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Strand Name</label>
              <Input
                value={form.strandName}
                onChange={(e) => setForm({ ...form, strandName: e.target.value })}
                placeholder="e.g. Functions and graphs"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Unit Label</label>
              <Input
                value={form.unitLabel}
                onChange={(e) => setForm({ ...form, unitLabel: e.target.value })}
                placeholder="e.g. Units 3-4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort Order</label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={form.isActive ? "true" : "false"}
                onValueChange={(value) => setForm({ ...form, isActive: value === "true" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSubmitting ||
                !form.subjectCode ||
                !form.name ||
                !form.strandCode ||
                !form.strandName ||
                (!editing && !form.topicCode)
              }
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete topic{" "}
              <span className="font-mono">{deleting?.topicCode}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
