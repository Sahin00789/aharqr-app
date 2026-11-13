import { useState } from "react";
import { X, UtensilsCrossed, ImagePlus, Leaf, Beef } from "lucide-react";
import { Modal, Button, SectionTitle } from "../../../common/components";
import type { Dish, DishImage } from "../../../api/menuApi";
import {
  useCategories,
  useCreateDish,
  useUpdateDish,
  useRemoveDishImage,
} from "../../../hooks/use-menu";
import toast from "react-hot-toast";

interface DishFormModalProps {
  initial?: Dish | null;
  onClose: () => void;
}

function DishFormModal({ initial, onClose }: DishFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price / 100) : "");
  const [isVeg, setIsVeg] = useState(initial?.isVeg ?? true);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearError = (key: string) =>
    setFieldErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  const categories = useCategories().data ?? [];

  const categoryOptions = Array.from(
    new Set([...(initial?.category ? [initial.category] : []), ...categories.map((c) => c.name)]),
  );

  const existingImages: DishImage[] = initial?.images ?? [];
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  function onPickImages(files: FileList | null) {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    setNewImageFiles((prev) => [...prev, ...arr]);
    setNewImagePreviews((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  }

  function revokeNewImagePreview(idx: number) {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => {
      const url = prev[idx];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== idx);
    });
  }

  const createDish = useCreateDish();
  const updateDish = useUpdateDish();
  const removeImage = useRemoveDishImage();

  const isSaving = createDish.isPending || updateDish.isPending;

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Dish name is required";
    if (!category) e.category = "Select a category";
    const parsed = parseFloat(price);
    if (!price.trim()) e.price = "Price is required";
    else if (!Number.isFinite(parsed) || parsed <= 0) e.price = "Enter a valid price";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  }

  function serverError(err: unknown): string {
    const res = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
    return res?.message ?? res?.error ?? "Something went wrong. Please try again.";
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    const paise = Math.round(parseFloat(price) * 100);
    const payload = {
      name: name.trim(),
      category: category.trim(),
      price: paise,
      isVeg,
      images: newImageFiles.length > 0 ? newImageFiles : undefined,
    };
    if (initial) {
      updateDish.mutate({ id: initial.id, ...payload }, {
        onSuccess: () => {
          toast.success("Dish updated");
          onClose();
        },
        onError: (err) => toast.error(serverError(err)),
      });
    } else {
      createDish.mutate(payload, {
        onSuccess: () => {
          toast.success("Dish added");
          onClose();
        },
        onError: (err) => toast.error(serverError(err)),
      });
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="full"
      icon={<UtensilsCrossed size={18} />}
      title={initial ? "Edit dish" : "Add dish"}
      description="Set the dish details and photos."
      footer={
        <div className="flex w-full items-center gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" form="dish-form" size="lg" loading={isSaving} className="flex-1">
            {initial ? "Save changes" : "Add dish"}
          </Button>
        </div>
      }
    >
      <form id="dish-form" className="flex h-full flex-col gap-5" onSubmit={handleSubmit}>
        {/* ── Basic details ─────────────────────────────── */}
        <section className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/40 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-400">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
              placeholder="Paneer Butter Masala"
              className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${
                fieldErrors.name ? "border-red-400" : "border-zinc-300"
              }`}
            />
            {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-400">Price</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">₹</span>
              <input
                type="number"
                min="0"
                step="any"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value);
                  clearError("price");
                }}
                placeholder="250"
                className={`w-full rounded-lg border bg-white py-2.5 pr-3 pl-7 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 ${
                  fieldErrors.price ? "border-red-400" : "border-zinc-300"
                }`}
              />
            </div>
            {fieldErrors.price && <p className="text-xs text-red-600">{fieldErrors.price}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-400">Category</label>
            {categoryOptions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {categoryOptions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      clearError("category");
                    }}
                    aria-pressed={category === c}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition select-none ${
                      category === c
                        ? "bg-accent-600 text-white shadow-sm"
                        : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:ring-accent-300 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700 dark:hover:ring-accent-500/50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400">No categories yet. Add one from the Dishes screen to assign this dish.</p>
            )}
            {fieldErrors.category && <p className="text-xs text-red-600">{fieldErrors.category}</p>}
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium tracking-wide text-zinc-600 uppercase dark:text-zinc-400">Type</span>
            <button
              type="button"
              onClick={() => setIsVeg((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition select-none ring-1 ${
                isVeg
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/30"
                  : "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:ring-orange-500/30"
              }`}
            >
              {isVeg ? <Leaf size={14} /> : <Beef size={14} />}
              {isVeg ? "Veg" : "Non-veg"}
            </button>
          </div>
        </section>

        {/* ── Photos ─────────────────────────────────────── */}
        <section className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <SectionTitle>Photos</SectionTitle>
          {(existingImages.length > 0 || newImagePreviews.length > 0) && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
              {existingImages.map((img) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-800">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage.mutate({ dishId: initial!.id, imageId: img.id })}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {newImagePreviews.map((url, idx) => (
                <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg ring-1 ring-zinc-200 dark:ring-zinc-800">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => revokeNewImagePreview(idx)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-3.5 py-2.5 text-sm font-medium text-zinc-500 transition hover:border-accent-400 hover:text-accent-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-accent-500/50 dark:hover:text-accent-400">
            <ImagePlus size={15} /> Add photos
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onPickImages(e.target.files)} />
          </label>
        </section>

        </form>
    </Modal>
  );
}

export { DishFormModal };