import { useState } from "react";
import { Input } from "@/components/dashboard/ui/input";
import { Textarea } from "@/components/dashboard/ui/textarea";
import { Button } from "@/components/dashboard/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";

interface SubjectFormProps {
  onSubmit: (data: { name: string; description?: string; imageUrl?: string }) => Promise<void>;
  initialData?: {
    name: string;
    description?: string;
    imageUrl?: string;
  };
  isEditing?: boolean;
}

export function SubjectForm({ 
  onSubmit, 
  initialData, 
  isEditing = false 
}: SubjectFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    imageUrl: initialData?.imageUrl || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        name: formData.name,
        description: formData.description || undefined,
        imageUrl: formData.imageUrl || undefined,
      });
    } catch (err) {
      setError("Failed to save subject. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <Input
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Enter subject name"
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Enter subject description"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Image URL (optional)</label>
        <Input
          value={formData.imageUrl}
          onChange={(e) => handleChange("imageUrl", e.target.value)}
          placeholder="Enter image URL"
        />
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          onClick={() => {
            // Reset form or close dialog - handled by parent
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !formData.name}
        >
          {isSubmitting && (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            </>
          )}
          {isEditing ? "Update" : "Add"}
        </Button>
      </div>
    </form>
  );
}