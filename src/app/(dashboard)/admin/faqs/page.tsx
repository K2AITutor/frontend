"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/dashboard/ui/card";
import { Button } from "@/components/dashboard/ui/button";
import { Input } from "@/components/dashboard/ui/input";
import { Textarea } from "@/components/dashboard/ui/textarea";
import { DataTable, SortHeader } from "@/components/dashboard/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
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
  FAQ,
  FAQCategory,
  fetchAdminFaqCategories,
  fetchAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  createFaqCategory,
  updateFaqCategory,
  deleteFaqCategory,
} from "@/lib/api/admin-faq";
import { useAdminToken } from "@/lib/api/useAdminToken";
import { usePageTitle } from "@/lib/usePageTitle";
import { toast } from "@/components/dashboard/ui/sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  HelpCircle,
  Folder,
} from "lucide-react";

const columnHelper = createColumnHelper<FAQ>();

export default function AdminFaqPage() {
  usePageTitle("FAQ Management");
  const token = useAdminToken();
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [deletingItem, setDeletingItem] = useState<{ type: "category" | "faq"; id: string | number } | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({ id: "", label: "", order: 0 });
  const [faqForm, setFaqForm] = useState({ categoryId: "", question: "", answer: "", order: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter state
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    if (token) loadData();
  }, [token]);

  useEffect(() => {
    if (token) loadFaqs();
  }, [categoryFilter, token]);

  async function loadData() {
    if (!token) return;
    try {
      setIsLoading(true);
      setError(null);
      const [categoriesData, faqsData] = await Promise.all([
        fetchAdminFaqCategories(token),
        fetchAdminFaqs(token),
      ]);
      setCategories(categoriesData);
      setFaqs(faqsData);
    } catch (err) {
      setError("Failed to load FAQ data. Please check if the backend is running.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadFaqs() {
    if (!token) return;
    try {
      const categoryId = categoryFilter !== "all" ? categoryFilter : undefined;
      const faqsData = await fetchAdminFaqs(token, categoryId);
      setFaqs(faqsData);
    } catch (err) {
      console.error("Failed to load FAQs:", err);
    }
  }

  function openCategoryDialog(category?: FAQCategory) {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ id: category.id, label: category.label, order: category.order });
    } else {
      setEditingCategory(null);
      setCategoryForm({ id: "", label: "", order: categories.length });
    }
    setIsCategoryDialogOpen(true);
  }

  function openFaqDialog(faq?: FAQ) {
    if (faq) {
      setEditingFaq(faq);
      setFaqForm({
        categoryId: faq.categoryId,
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
      });
    } else {
      setEditingFaq(null);
      setFaqForm({ categoryId: categories[0]?.id || "", question: "", answer: "", order: faqs.length });
    }
    setIsFaqDialogOpen(true);
  }

  function openDeleteDialog(type: "category" | "faq", id: string | number) {
    setDeletingItem({ type, id });
    setIsDeleteDialogOpen(true);
  }

  async function handleSaveCategory() {
    if (!categoryForm.id || !categoryForm.label) return;
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await updateFaqCategory(editingCategory.id, {
          label: categoryForm.label,
          order: categoryForm.order,
        }, token!);
      } else {
        await createFaqCategory({
          id: categoryForm.id,
          label: categoryForm.label,
          order: categoryForm.order,
        }, token!);
      }
      setIsCategoryDialogOpen(false);
      loadData();
      toast.success(editingCategory ? "Category updated successfully" : "Category created successfully");
    } catch (err) {
      console.error("Failed to save category:", err);
      toast.error("Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveFaq() {
    if (!faqForm.categoryId || !faqForm.question || !faqForm.answer) return;
    setIsSubmitting(true);
    try {
      if (editingFaq) {
        await updateFaq(editingFaq.id, faqForm, token!);
      } else {
        await createFaq(faqForm, token!);
      }
      setIsFaqDialogOpen(false);
      loadFaqs();
      toast.success(editingFaq ? "FAQ updated successfully" : "FAQ created successfully");
    } catch (err) {
      console.error("Failed to save FAQ:", err);
      toast.error("Failed to save FAQ");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deletingItem) return;
    setIsSubmitting(true);
    try {
      if (deletingItem.type === "category") {
        await deleteFaqCategory(deletingItem.id as string, token!);
        loadData();
      } else {
        await deleteFaq(deletingItem.id as number, token!);
        loadFaqs();
      }
      setIsDeleteDialogOpen(false);
      toast.success(`${deletingItem.type === "category" ? "Category" : "FAQ"} deleted successfully`);
    } catch (err) {
      console.error("Failed to delete:", err);
      toast.error(`Failed to delete ${deletingItem?.type || "item"}`);
    } finally {
      setIsSubmitting(false);
      setDeletingItem(null);
    }
  }

  const faqColumns = [
      columnHelper.accessor("question", {
        header: SortHeader("Question"),
        cell: (info) => (
          <span className="block max-w-[250px] truncate font-medium">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("answer", {
        header: SortHeader("Answer"),
        cell: (info) => (
          <span className="block max-w-[300px] truncate text-muted-foreground">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.category?.label || "N/A", {
        id: "category",
        header: SortHeader("Category"),
        enableGlobalFilter: false,
        cell: (info) => <Badge variant="outline">{info.getValue()}</Badge>,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="sr-only">Actions</span>,
        enableSorting: false,
        cell: (info) => {
          const faq = info.row.original;
          return (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => openFaqDialog(faq)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600"
                onClick={() => openDeleteDialog("faq", faq.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      }),
  ];

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
        <h2 className="text-xl font-semibold">Error Loading FAQs</h2>
        <p className="text-muted-foreground max-w-sm">{error}</p>
        <Button onClick={loadData} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">FAQ Management</h1>
          <p className="text-muted-foreground">
            Manage frequently asked questions and categories.
          </p>
        </div>
      </div>

      {/* Categories Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            <CardTitle>Categories</CardTitle>
          </div>
          <Button size="sm" onClick={() => openCategoryDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No categories yet. Add one to get started.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Badge key={cat.id} variant="secondary" className="px-3 py-1">
                  {cat.label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-4 w-4 p-0"
                    onClick={() => openCategoryDialog(cat)}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0 text-red-500 hover:text-red-600"
                    onClick={() => openDeleteDialog("category", cat.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQs Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            <CardTitle>FAQs</CardTitle>
          </div>
          {/* Category filter stays here — it drives the server-side fetch (loadFaqs). */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={faqColumns}
            data={faqs}
            searchPlaceholder="Search questions..."
            emptyMessage="No FAQs yet."
            toolbarActions={
              <Button size="sm" onClick={() => openFaqDialog()} disabled={categories.length === 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add FAQ
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Category Dialog */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the category details." : "Create a new FAQ category."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ID (slug)</label>
              <Input
                value={categoryForm.id}
                onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                placeholder="e.g., general, billing, account"
                disabled={!!editingCategory}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Label</label>
              <Input
                value={categoryForm.label}
                onChange={(e) => setCategoryForm({ ...categoryForm, label: e.target.value })}
                placeholder="Category name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Order</label>
              <Input
                type="number"
                value={categoryForm.order}
                onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory} disabled={isSubmitting || !categoryForm.id || !categoryForm.label}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            <DialogDescription>
              {editingFaq ? "Update the FAQ details." : "Create a new frequently asked question."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={faqForm.categoryId}
                onValueChange={(value) => setFaqForm({ ...faqForm, categoryId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Question</label>
              <Input
                value={faqForm.question}
                onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                placeholder="Enter the question"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Answer</label>
              <Textarea
                value={faqForm.answer}
                onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                placeholder="Enter the answer"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Order</label>
              <Input
                type="number"
                value={faqForm.order}
                onChange={(e) => setFaqForm({ ...faqForm, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFaqDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSaveFaq}
              disabled={isSubmitting || !faqForm.categoryId || !faqForm.question || !faqForm.answer}
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
              Are you sure you want to delete this {deletingItem?.type}? This action cannot be undone.
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
