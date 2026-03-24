import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/dashboard/ui/table";
import { Button } from "@/components/dashboard/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface Subject {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

interface SubjectListTableProps {
  subjects: Subject[];
  onEdit: (subject: Subject) => void;
  onDelete: (id: number) => void;
}

export function SubjectListTable({ subjects, onEdit, onDelete }: SubjectListTableProps) {
  return (
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
                  onClick={() => onEdit(subject)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => onDelete(subject.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}