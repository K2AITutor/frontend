"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Textarea } from "@/components/dashboard/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/dashboard/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/dashboard/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/dashboard/ui/select";
import { Badge } from "@/components/dashboard/ui/badge";
import {
  Subject,
  fetchSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from "@/lib/api/subjects";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  HelpCircle,
  Folder,
} from "lucide-react";
import { usePageTitle } from "@/lib/usePageTitle";
import { toast } from "@/components/dashboard/ui/sonner";
import { useAdminToken } from "@/lib/api/useAdminToken";

export default function AdminSubjectsPage() {
  usePageTitle("Subjects Management");
  const token = useAdminToken();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deletingSubject, setDeletingSubject] = useState<number | null>(null);

  // Form states
  const [subjectForm, setSubjectForm] = useState({
    id: "",
    name: "",
    description: "",
    icon: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchSubjects();
      setSubjects(data);
    } catch (err) {
      setError("Failed to load subjects. Please check if the backend is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function openDialog(subject?: Subject) {
    if (subject) {
      setEditingSubject(subject);
      setSubjectForm({
        id: subject.id.toString(),
        name: subject.name,
        description: subject.description || "",
        icon: subject.icon || "",
      });
    } else {
      setEditingSubject(null);
      setSubjectForm({
        id: "",
        name: "",
        description: "",
        icon: "",
      });
    }
    setIsDialogOpen(true);
  }

  function openDeleteDialog(id: number) {
    setDeletingSubject(id);
    setIsDeleteDialogOpen(true);
  }

  async function handleSaveSubject() {
    if (!subjectForm.name) return;
    if (!token) {
      toast.error("Admin session is not ready");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingSubject) {
        await updateSubject(editingSubject.id, {
          name: subjectForm.name,
          description: subjectForm.description,
          icon: subjectForm.icon,
        }, token);
      } else {
        await createSubject({
          name: subjectForm.name,
          description: subjectForm.description,
          icon: subjectForm.icon,
        }, token);
      }
      setIsDialogOpen(false);
      loadSubjects();
      toast.success(editingSubject ? "Subject updated successfully" : "Subject created successfully");
    } catch (err) {
      console.error("Failed to save subject:", err);
      toast.error("Failed to save subject");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteSubject() {
    if (!deletingSubject) return;
    if (!token) {
      toast.error("Admin session is not ready");
      return;
    }
    setIsSubmitting(true);
    try {
      await deleteSubject(deletingSubject, token);
      setIsDeleteDialogOpen(false);
      loadSubjects();
      toast.success("Subject deleted successfully");
    } catch (err) {
      console.error("Failed to delete subject:", err);
      toast.error("Failed to delete subject");
    } finally {
      setIsSubmitting(false);
      setDeletingSubject(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen flex-col gap-4 text-center p-6">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Error Loading Subjects</h2>
        <p className="text-muted-foreground max-w-sm">{error}</p>
        <Button onClick={loadSubjects} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subjects Management</h1>
          <p className="text-muted-foreground">
            Manage subjects offered in the curriculum.
          </p>
        </div>
        <Button size="sm" onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      {subjects.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No subjects yet. Add one to get started.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium max-w-[250px] truncate">
                  {subject.name}
                </TableCell>
                <TableCell className="max-w-[300px] truncate line-clamp-2">
                  {subject.description || "No description"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDialog(subject)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => openDeleteDialog(subject.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Subject Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSubject ? "Edit Subject" : "Add Subject"}</DialogTitle>
            <DialogDescription>
              {editingSubject ? "Update the subject details." : "Create a new subject."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                placeholder="Enter subject name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={subjectForm.description}
                onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                placeholder="Enter subject description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Icon (optional)</label>
              <Input
                value={subjectForm.icon}
                onChange={(e) => setSubjectForm({ ...subjectForm, icon: e.target.value })}
                placeholder="e.g. calculator, flask-conical, book-open"
              />
              <p className="text-xs text-muted-foreground">
                Browse icon names at{" "}
                <a
                  href="https://lucide.dev/icons"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                >
                  lucide.dev/icons
                </a>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSubject} disabled={isSubmitting || !subjectForm.name}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subject? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSubject} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
