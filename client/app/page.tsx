'use client';

import { useState, useEffect } from 'react';
import { getCafes, createCafe, createDrink, type Cafe } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import * as Select from '@radix-ui/react-select';
import * as Slider from '@radix-ui/react-slider';
import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';

export default function LogPage() {
  const router = useRouter();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewCafe, setShowNewCafe] = useState(false);

  // Form state
  const [selectedCafeId, setSelectedCafeId] = useState<string>('');
  const [drinkType, setDrinkType] = useState('');
  const [rating, setRating] = useState<number>(3.5);
  const [notes, setNotes] = useState('');

  // New cafe form
  const [newCafeName, setNewCafeName] = useState('');
  const [newCafeAddress, setNewCafeAddress] = useState('');
  const [newCafeCity, setNewCafeCity] = useState('');

  useEffect(() => {
    loadCafes();
  }, []);

  const loadCafes = async () => {
    try {
      const data = await getCafes();
      setCafes(data);
    } catch (error) {
      console.error('Error loading cafes:', error);
    }
  };

  const handleCreateCafe = async () => {
    if (!newCafeName.trim()) return;

    try {
      const newCafe = await createCafe({
        name: newCafeName,
        address: newCafeAddress || undefined,
        city: newCafeCity || undefined,
      });

      setCafes([...cafes, newCafe]);
      setSelectedCafeId(String(newCafe.id));
      setNewCafeName('');
      setNewCafeAddress('');
      setNewCafeCity('');
      setShowNewCafe(false);
    } catch (error) {
      console.error('Error creating cafe:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCafeId || !drinkType.trim()) {
      return;
    }

    setLoading(true);

    try {
      await createDrink({
        cafe_id: Number(selectedCafeId),
        drink_type: drinkType,
        rating,
        notes: notes || undefined,
      });

      router.push('/history');
    } catch (error) {
      console.error('Error logging drink:', error);
    } finally {
      setLoading(false);
    }
  };

  const ratingLabels = ['Skip', 'Meh', 'Decent', 'Good', 'Great', 'Perfect'];

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="font-[family-name:var(--font-serif)] text-4xl md:text-5xl text-[var(--coffee)] mb-4">
          New Entry
        </h1>
        <p className="text-[var(--latte)] tracking-wide">
          Document your coffee moment
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-10"
      >
        {/* Cafe Selection */}
        <div className="space-y-3">
          <label className="block text-xs tracking-[0.15em] uppercase text-[var(--mocha)]">
            Where
          </label>
          <Select.Root value={selectedCafeId} onValueChange={setSelectedCafeId}>
            <Select.Trigger
              className={clsx(
                "w-full px-4 py-4 text-left bg-[var(--card)] border border-[var(--taupe)]/40 rounded-lg text-[var(--espresso)]",
                "hover:border-[var(--taupe)] transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/30 focus:border-[var(--sage)]",
                "data-[placeholder]:text-[var(--taupe-dark)]"
              )}
            >
              <Select.Value placeholder="Select a cafe..." />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                className="bg-white border border-[var(--taupe)]/30 rounded-lg shadow-xl overflow-hidden z-50"
                position="popper"
                sideOffset={4}
              >
                <Select.Viewport className="p-2">
                  {cafes.map((cafe) => (
                    <Select.Item
                      key={cafe.id}
                      value={String(cafe.id)}
                      className={clsx(
                        "px-4 py-3 rounded-md cursor-pointer outline-none",
                        "hover:bg-[var(--linen)] focus:bg-[var(--linen)]",
                        "data-[highlighted]:bg-[var(--linen)]"
                      )}
                    >
                      <Select.ItemText>
                        <span className="block font-medium text-[var(--coffee)]">{cafe.name}</span>
                        {cafe.city && (
                          <span className="block text-sm text-[var(--latte)]">{cafe.city}</span>
                        )}
                      </Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          <button
            type="button"
            onClick={() => setShowNewCafe(true)}
            className="text-sm text-[var(--terracotta)] hover:text-[var(--coffee)] transition-colors tracking-wide"
          >
            + Add new cafe
          </button>
        </div>

        {/* Drink Type */}
        <div className="space-y-3">
          <label className="block text-xs tracking-[0.15em] uppercase text-[var(--mocha)]">
            What
          </label>
          <input
            type="text"
            value={drinkType}
            onChange={(e) => setDrinkType(e.target.value)}
            placeholder="Cortado, Latte, Pour Over..."
            className={clsx(
              "w-full px-4 py-4 bg-[var(--card)] border border-[var(--taupe)]/40 rounded-lg text-[var(--espresso)]",
              "hover:border-[var(--taupe)] transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/30 focus:border-[var(--sage)]",
              "placeholder:text-[var(--taupe-dark)]"
            )}
            required
          />
        </div>

        {/* Rating */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="block text-xs tracking-[0.15em] uppercase text-[var(--mocha)]">
              How was it
            </label>
            <span className="text-lg font-[family-name:var(--font-serif)] text-[var(--coffee)]">
              {rating.toFixed(1)} <span className="text-sm text-[var(--latte)]">/ 5</span>
            </span>
          </div>

          <Slider.Root
            value={[rating]}
            onValueChange={([val]) => setRating(val)}
            min={0}
            max={5}
            step={0.5}
            className="relative flex items-center select-none touch-none w-full h-6"
          >
            <Slider.Track className="bg-[var(--linen)] relative grow rounded-full h-2">
              <Slider.Range className="absolute bg-gradient-to-r from-[var(--terracotta-muted)] to-[var(--terracotta)] rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className={clsx(
                "block w-6 h-6 bg-white rounded-full shadow-lg border-2 border-[var(--terracotta)]",
                "hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--terracotta)]/30",
                "transition-transform cursor-grab active:cursor-grabbing"
              )}
            />
          </Slider.Root>

          <div className="flex justify-between text-xs text-[var(--taupe-dark)]">
            {ratingLabels.map((label, i) => (
              <span key={label} className={clsx(
                "transition-colors",
                Math.round(rating) === i && "text-[var(--coffee)] font-medium"
              )}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-3">
          <label className="block text-xs tracking-[0.15em] uppercase text-[var(--mocha)]">
            Notes
            <span className="normal-case tracking-normal text-[var(--taupe-dark)] ml-2">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Tasting notes, the vibe, who you were with..."
            className={clsx(
              "w-full px-4 py-4 bg-[var(--card)] border border-[var(--taupe)]/40 rounded-lg resize-none text-[var(--espresso)]",
              "hover:border-[var(--taupe)] transition-colors duration-200",
              "focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/30 focus:border-[var(--sage)]",
              "placeholder:text-[var(--taupe-dark)]"
            )}
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={loading || !selectedCafeId || !drinkType.trim()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={clsx(
            "w-full py-4 px-6 rounded-lg font-medium tracking-wide transition-all duration-300",
            "bg-[var(--coffee)] text-[var(--cream)] hover:bg-[var(--espresso)]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          )}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-[var(--cream)]/30 border-t-[var(--cream)] rounded-full"
              />
              Saving...
            </span>
          ) : (
            'Save Entry'
          )}
        </motion.button>
      </motion.form>

      {/* New Cafe Dialog */}
      <Dialog.Root open={showNewCafe} onOpenChange={setShowNewCafe}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-[var(--espresso)]/40 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl z-50">
            <Dialog.Title className="font-[family-name:var(--font-serif)] text-2xl text-[var(--coffee)] mb-6">
              Add New Cafe
            </Dialog.Title>

            <div className="space-y-5">
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-[var(--mocha)] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={newCafeName}
                  onChange={(e) => setNewCafeName(e.target.value)}
                  placeholder="Cafe name"
                  className={clsx(
                    "w-full px-4 py-3 bg-[var(--bone-light)] border border-[var(--taupe)]/40 rounded-lg text-[var(--espresso)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/30 focus:border-[var(--sage)]",
                    "placeholder:text-[var(--taupe-dark)]"
                  )}
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-[var(--mocha)] mb-2">
                  Address
                  <span className="normal-case tracking-normal text-[var(--taupe-dark)] ml-2">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newCafeAddress}
                  onChange={(e) => setNewCafeAddress(e.target.value)}
                  placeholder="Street address"
                  className={clsx(
                    "w-full px-4 py-3 bg-[var(--bone-light)] border border-[var(--taupe)]/40 rounded-lg text-[var(--espresso)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/30 focus:border-[var(--sage)]",
                    "placeholder:text-[var(--taupe-dark)]"
                  )}
                />
              </div>
              <div>
                <label className="block text-xs tracking-[0.15em] uppercase text-[var(--mocha)] mb-2">
                  City
                  <span className="normal-case tracking-normal text-[var(--taupe-dark)] ml-2">(optional)</span>
                </label>
                <input
                  type="text"
                  value={newCafeCity}
                  onChange={(e) => setNewCafeCity(e.target.value)}
                  placeholder="City"
                  className={clsx(
                    "w-full px-4 py-3 bg-[var(--bone-light)] border border-[var(--taupe)]/40 rounded-lg text-[var(--espresso)]",
                    "focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/30 focus:border-[var(--sage)]",
                    "placeholder:text-[var(--taupe-dark)]"
                  )}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Dialog.Close asChild>
                <button
                  className="flex-1 py-3 px-4 rounded-lg border border-[var(--taupe)]/40 text-[var(--mocha)] hover:bg-[var(--bone-light)] transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleCreateCafe}
                disabled={!newCafeName.trim()}
                className={clsx(
                  "flex-1 py-3 px-4 rounded-lg font-medium transition-colors",
                  "bg-[var(--coffee)] text-[var(--cream)] hover:bg-[var(--espresso)]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Add Cafe
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
