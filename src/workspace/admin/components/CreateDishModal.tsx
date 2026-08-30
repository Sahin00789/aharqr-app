import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, UtensilsCrossed, Leaf, Beef } from "lucide-react";
import {
  Modal,
  Stepper,
  Field,
  Input,
  Textarea,
  Select,
  Segmented,
  Toggle,
  Button,
} from "../../../common/ui";
import { formatINR, type Dish } from "../../../common/mock";
import toast from "react-hot-toast";

interface CreateDishModalProps {
  open: boolean;
  onClose: () => void;
  categories: string[];
  onCreate: (dish: Omit<Dish, "id">) => void;
}

const STEPS = ["Basics", "Pricing & diet", "Review"];

const fade = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
};

export function CreateDishModal({
  open,
  onClose,
  categories,
  onCreate,
}: CreateDishModalProps) {
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0] ?? "");
  const [newCategory, setNewCategory] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [stock, setStock] = useState("0");

  const finalCategory = newCategory.trim() || category;

  function reset() {
    setStep(0);
    setName("");
    setCategory(categories[0] ?? "");
    setNewCategory("");
    setDescription("");
    setPrice("");
    setIsVeg(true);
    setIsAvailable(true);
    setStock("0");
  }

  function close() {
    reset();
    onClose();
  }

  function next() {
    if (step === 0) {
      if (!name.trim()) return toast.error("Dish name is required");
      if (!finalCategory.trim())
        return toast.error("Choose or create a category");
    }
    if (step === 1) {
      const paise = Math.round(parseFloat(price) * 100);
      if (Number.isNaN(paise) || paise <= 0)
        return toast.error("Enter a valid price");
      if (Number.isNaN(Number(stock)) || Number(stock) < 0)
        return toast.error("Stock must be a number");
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function submit() {
    const dish: Omit<Dish, "id"> = {
      name: name.trim(),
      category: finalCategory.trim(),
      price: Math.round(parseFloat(price) * 100),
      isVeg,
      isAvailable,
      stock: Number(stock) || 0,
    };
    onCreate(dish);
    toast.success(`Added ${dish.name}`);
    close();
  }

  const previewPrice = (() => {
    const n = parseFloat(price);
    return Number.isNaN(n) ? 0 : n;
  })();

  return (
    <Modal
      open={open}
      onClose={close}
      size="lg"
      icon={<UtensilsCrossed size={18} />}
      title="Add a dish"
      description="Build a menu item in three quick steps."
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={step === 0 ? close : () => setStep((s) => s - 1)}>
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button size="sm" onClick={next}>
              Continue
            </Button>
          ) : (
            <Button size="sm" onClick={submit}>
              <Plus size={14} /> Create dish
            </Button>
          )}
        </>
      }
    >
      <div className="mb-5">
        <Stepper steps={STEPS} current={step} />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="basics" {...fade} className="grid gap-3">
            <Field label="Dish name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Paneer Butter Masala"
                autoFocus
              />
            </Field>
            <Field label="Category" hint="Pick an existing category or type a new one.">
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  ...categories.map((c) => ({ value: c, label: c })),
                  { value: "__new", label: "➕ New category…" },
                ]}
              />
              {category === "__new" && (
                <Input
                  className="mt-2"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Starters"
                />
              )}
            </Field>
            <Field label="Description" hint="Optional — shown to guests scanning the menu.">
              <Textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Creamy tomato gravy with grilled cottage cheese."
              />
            </Field>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="pricing" {...fade} className="grid gap-4">
            <Field label="Price (₹)">
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="250"
                autoFocus
              />
            </Field>
            <Field label="Diet">
              <Segmented
                value={isVeg ? "veg" : "nonveg"}
                onChange={(v) => setIsVeg(v === "veg")}
                options={[
                  { value: "veg", label: <span className="flex items-center justify-center gap-1.5"><Leaf size={14} /> Veg</span> },
                  { value: "nonveg", label: <span className="flex items-center justify-center gap-1.5"><Beef size={14} /> Non-veg</span> },
                ]}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Initial stock">
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                />
              </Field>
              <div className="flex items-end justify-between rounded-lg border border-zinc-200 px-3 py-2.5 dark:border-zinc-700">
                <span className="text-sm text-zinc-600 dark:text-zinc-300">Available now</span>
                <Toggle checked={isAvailable} onChange={setIsAvailable} label="Available" />
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="review" {...fade} className="grid gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-accent-50 p-4 dark:bg-accent-500/10">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${isVeg ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {isVeg ? <Leaf size={18} /> : <Beef size={18} />}
              </span>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{name || "Untitled dish"}</p>
                <p className="text-xs text-zinc-500">{finalCategory}</p>
              </div>
              <p className="ml-auto text-lg font-bold text-accent-600">{formatINR(Math.round(previewPrice * 100))}</p>
            </div>
            {description && (
              <p className="text-sm text-zinc-500">{description}</p>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                <p className="text-xs text-zinc-400">Status</p>
                <p className="font-medium">{isAvailable ? "Available" : "Hidden"}</p>
              </div>
              <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                <p className="text-xs text-zinc-400">Stock</p>
                <p className="font-medium">{Number(stock) || 0} units</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
}
