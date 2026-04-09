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
import { Badge } from "@/components/dashboard/ui/badge";
import {
  Testimonial,
  fetchAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "@/lib/api/admin-testimonials";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Star,
  Quote,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import { useAdminToken } from "@/lib/api/useAdminToken";
import { usePageTitle } from "@/lib/usePageTitle";
import { toast } from "@/components/dashboard/ui/sonner";

export default function AdminTestimonialsPage() {
  usePageTitle("Testimonials Management");
  const token = useAdminToken();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    role: "",
    subject: "",
    image: "",
    quote: "",
    rating: 5,
    atarImprovement: "",
    order: 0,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [showInactive, setShowInactive] = useState(true);

  useEffect(() => {
    if (token) loadData();
  }, [showInactive, token]);

  async function loadData() {
    if (!token) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchAdminTestimonials(token, showInactive);
      setTestimonials(data);
    } catch (err) {
      setError("Failed to load testimonials. Please check if the backend is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function openDialog(testimonial?: Testimonial) {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setForm({
        name: testimonial.name,
        role: testimonial.role,
        subject: testimonial.subject,
        image: testimonial.image || "",
        quote: testimonial.quote,
        rating: testimonial.rating,
        atarImprovement: testimonial.atarImprovement || "",
        order: testimonial.order,
        isActive: testimonial.isActive,
      });
    } else {
      setEditingTestimonial(null);
      setForm({
        name: "",
        role: "",
        subject: "",
        image: "",
        quote: "",
        rating: 5,
        atarImprovement: "",
        order: testimonials.length,
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  }

  function openDeleteDialog(id: number) {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  }

  async function handleSave() {
    if (!form.name || !form.role || !form.subject || !form.quote) return;
    setIsSubmitting(true);
    try {
      const data = {
        name: form.name,
        role: form.role,
        subject: form.subject,
        image: form.image || undefined,
        quote: form.quote,
        rating: form.rating,
        atarImprovement: form.atarImprovement || undefined,
        order: form.order,
        isActive: form.isActive,
      };

      if (editingTestimonial) {
        await updateTestimonial(editingTestimonial.id, data, token!);
      } else {
        await createTestimonial(data, token!);
      }
      setIsDialogOpen(false);
      loadData();
      toast.success(editingTestimonial ? "Testimonial updated successfully" : "Testimonial created successfully");
    } catch (err) {
      console.error("Failed to save testimonial:", err);
      toast.error("Failed to save testimonial");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingId) return;
    setIsSubmitting(true);
    try {
      await deleteTestimonial(deletingId, token!);
      setIsDeleteDialogOpen(false);
      loadData();
      toast.success("Testimonial deleted successfully");
    } catch (err) {
      console.error("Failed to delete testimonial:", err);
      toast.error("Failed to delete testimonial");
    } finally {
      setIsSubmitting(false);
      setDeletingId(null);
    }
  }

  async function toggleActive(testimonial: Testimonial) {
    try {
      await updateTestimonial(testimonial.id, { isActive: !testimonial.isActive }, token!);
      loadData();
      toast.success(testimonial.isActive ? "Testimonial deactivated" : "Testimonial activated");
    } catch (err) {
      console.error("Failed to toggle active status:", err);
      toast.error("Failed to update testimonial");
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
        <h2 className="text-xl font-semibold">Error Loading Testimonials</h2>
        <p className="text-muted-foreground max-w-sm">{error}</p>
        <Button onClick={loadData} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Testimonials Management</h1>
          <p className="text-muted-foreground">
            Manage student and parent testimonials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInactive(!showInactive)}
          >
            {showInactive ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
            {showInactive ? "Hide Inactive" : "Show All"}
          </Button>
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Quote className="h-5 w-5" />
            <CardTitle>Testimonials</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {testimonials.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No testimonials yet. Add one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Role / Subject</TableHead>
                  <TableHead>Quote</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id} className={!testimonial.isActive ? "opacity-50" : ""}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {testimonial.image ? (
                          <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              src={testimonial.image}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {testimonial.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{testimonial.name}</div>
                          {testimonial.atarImprovement && (
                            <div className="text-xs text-green-600">
                              {testimonial.atarImprovement}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{testimonial.role}</div>
                        <div className="text-muted-foreground">{testimonial.subject}</div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <p className="text-sm truncate">{testimonial.quote}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < testimonial.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={testimonial.isActive ? "default" : "secondary"}>
                        {testimonial.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(testimonial)}
                          title={testimonial.isActive ? "Deactivate" : "Activate"}
                        >
                          {testimonial.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog(testimonial)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => openDeleteDialog(testimonial.id)}
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
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
            <DialogDescription>
              {editingTestimonial
                ? "Update the testimonial details."
                : "Add a new student or parent testimonial."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Student name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Input
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="e.g., Year 12 Student, Parent"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g., Mathematical Methods"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ATAR Improvement</label>
                <Input
                  value={form.atarImprovement}
                  onChange={(e) => setForm({ ...form, atarImprovement: e.target.value })}
                  placeholder="e.g., Improved from 65 to 92"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quote</label>
              <Textarea
                value={form.quote}
                onChange={(e) => setForm({ ...form, quote: e.target.value })}
                placeholder="Testimonial quote..."
                rows={4}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rating (1-5)</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Order</label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <div className="flex items-center gap-2 h-10">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm">
                    Active
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting || !form.name || !form.role || !form.subject || !form.quote}
            >
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
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
