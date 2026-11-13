import { useState } from "react";
import { Tag } from "lucide-react";
import { Modal, Button, Input } from "../../../common/components";
import type { Category } from "../../../api/categoriesApi";
import { useCreateCategory, useUpdateCategory } from "../../../hooks/use-menu";
import toast from "react-hot-toast";

function CategoryForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Category;
  onSubmit: (p: { name: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");

  return (
    <form
      className="grid gap-3 rounded-xl bg-zinc-50 p-4 ring-1 ring-zinc-200 dark:bg-zinc-800/40 dark:ring-zinc-700"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) {
          toast.error("Name is required");
          return;
        }
        onSubmit({ name: name.trim() });
      }}
    >
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Starters" />
      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button type="submit" className="w-full">
          Save
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function AddCategoryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createCategory = useCreateCategory();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add category"
      size="md"
      icon={<Tag size={18} />}
    >
      <CategoryForm
        onSubmit={(p) =>
          createCategory.mutate(p, {
            onSuccess: () => {
              toast.success("Category added");
              onClose();
            },
            onError: () => toast.error("Could not add category"),
          })
        }
        onCancel={onClose}
      />
    </Modal>
  );
}

export function EditCategoryModal({
  category,
  onClose,
}: {
  category: Category | null;
  onClose: () => void;
}) {
  const updateCategory = useUpdateCategory();

  return (
    <Modal
      open={category !== null}
      onClose={onClose}
      title="Edit category"
      size="xl"
      icon={<Tag size={18} />}
    >
      {category && (
        <CategoryForm
          key={category.id}
          initial={category}
          onSubmit={(p) =>
            updateCategory.mutate(
              { id: category.id, name: p.name },
              {
                onSuccess: () => {
                  toast.success("Category updated");
                  onClose();
                },
                onError: () => toast.error("Could not update category"),
              },
            )
          }
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}