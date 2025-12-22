'use client';

import { useState, useEffect } from 'react';
import { getDrinks, getCafes, deleteDrink, type Drink, type Cafe } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import * as Select from '@radix-ui/react-select';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { clsx } from 'clsx';

export default function HistoryPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCafeId, setFilterCafeId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'logged_at' | 'rating'>('logged_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [filterCafeId, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [drinksData, cafesData] = await Promise.all([
        getDrinks({
          cafe_id: filterCafeId !== 'all' ? Number(filterCafeId) : undefined,
          sort: sortBy,
          order: sortOrder,
        }),
        getCafes(),
      ]);
      setDrinks(drinksData);
      setCafes(cafesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteDrink(deleteId);
      setDrinks(drinks.filter(d => d.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting drink:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      day: date.toLocaleDateString('en-US', { day: 'numeric' }),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.toLocaleDateString('en-US', { year: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };
  };

  const getRatingColor = (rating: number | string) => {
    const r = Number(rating);
    if (r >= 4.5) return 'bg-[var(--sage)] text-white';
    if (r >= 3.5) return 'bg-[var(--terracotta-muted)] text-white';
    if (r >= 2.5) return 'bg-[var(--taupe)] text-[var(--coffee)]';
    return 'bg-[var(--linen)] text-[var(--mocha)]';
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="font-[family-name:var(--font-serif)] text-4xl md:text-5xl text-[var(--coffee)] mb-4">
          Archive
        </h1>
        <p className="text-[var(--latte)] tracking-wide">
          Your coffee journey, preserved
        </p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-wrap gap-4 mb-10 pb-8 border-b border-[var(--taupe)]/20"
      >
        {/* Cafe Filter */}
        <div className="space-y-2">
          <label className="block text-xs tracking-[0.15em] uppercase text-[var(--mocha)]">
            Cafe
          </label>
          <Select.Root value={filterCafeId} onValueChange={setFilterCafeId}>
            <Select.Trigger
              className={clsx(
                "min-w-[180px] px-4 py-2.5 text-left bg-[var(--card)] border border-[var(--taupe)]/40 rounded-lg text-sm text-[var(--espresso)]",
                "hover:border-[var(--taupe)] transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/30"
              )}
            >
              <Select.Value />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                className="bg-white border border-[var(--taupe)]/30 rounded-lg shadow-xl overflow-hidden z-50"
                position="popper"
                sideOffset={4}
              >
                <Select.Viewport className="p-2">
                  <Select.Item
                    value="all"
                    className="px-4 py-2.5 rounded-md cursor-pointer outline-none text-sm hover:bg-[var(--linen)] data-[highlighted]:bg-[var(--linen)]"
                  >
                    <Select.ItemText>All Cafes</Select.ItemText>
                  </Select.Item>
                  {cafes.map((cafe) => (
                    <Select.Item
                      key={cafe.id}
                      value={String(cafe.id)}
                      className="px-4 py-2.5 rounded-md cursor-pointer outline-none text-sm hover:bg-[var(--linen)] data-[highlighted]:bg-[var(--linen)]"
                    >
                      <Select.ItemText>{cafe.name}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <label className="block text-xs tracking-[0.15em] uppercase text-[var(--mocha)]">
            Sort
          </label>
          <Select.Root value={sortBy} onValueChange={(v) => setSortBy(v as 'logged_at' | 'rating')}>
            <Select.Trigger
              className={clsx(
                "min-w-[140px] px-4 py-2.5 text-left bg-[var(--card)] border border-[var(--taupe)]/40 rounded-lg text-sm text-[var(--espresso)]",
                "hover:border-[var(--taupe)] transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/30"
              )}
            >
              <Select.Value />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                className="bg-white border border-[var(--taupe)]/30 rounded-lg shadow-xl overflow-hidden z-50"
                position="popper"
                sideOffset={4}
              >
                <Select.Viewport className="p-2">
                  <Select.Item
                    value="logged_at"
                    className="px-4 py-2.5 rounded-md cursor-pointer outline-none text-sm hover:bg-[var(--linen)] data-[highlighted]:bg-[var(--linen)]"
                  >
                    <Select.ItemText>Date</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value="rating"
                    className="px-4 py-2.5 rounded-md cursor-pointer outline-none text-sm hover:bg-[var(--linen)] data-[highlighted]:bg-[var(--linen)]"
                  >
                    <Select.ItemText>Rating</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        {/* Order */}
        <div className="space-y-2">
          <label className="block text-xs tracking-[0.15em] uppercase text-[var(--mocha)]">
            Order
          </label>
          <Select.Root value={sortOrder} onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')}>
            <Select.Trigger
              className={clsx(
                "min-w-[160px] px-4 py-2.5 text-left bg-[var(--card)] border border-[var(--taupe)]/40 rounded-lg text-sm text-[var(--espresso)]",
                "hover:border-[var(--taupe)] transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-[var(--sage)]/30"
              )}
            >
              <Select.Value />
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                className="bg-white border border-[var(--taupe)]/30 rounded-lg shadow-xl overflow-hidden z-50"
                position="popper"
                sideOffset={4}
              >
                <Select.Viewport className="p-2">
                  <Select.Item
                    value="desc"
                    className="px-4 py-2.5 rounded-md cursor-pointer outline-none text-sm hover:bg-[var(--linen)] data-[highlighted]:bg-[var(--linen)]"
                  >
                    <Select.ItemText>Newest First</Select.ItemText>
                  </Select.Item>
                  <Select.Item
                    value="asc"
                    className="px-4 py-2.5 rounded-md cursor-pointer outline-none text-sm hover:bg-[var(--linen)] data-[highlighted]:bg-[var(--linen)]"
                  >
                    <Select.ItemText>Oldest First</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </motion.div>

      {/* Drinks List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-[var(--taupe)] border-t-[var(--coffee)] rounded-full"
          />
        </div>
      ) : drinks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <p className="text-[var(--latte)] text-lg mb-2">No entries yet</p>
          <p className="text-[var(--taupe-dark)] text-sm">Your coffee journey awaits</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {drinks.map((drink, index) => {
              const date = formatDate(drink.logged_at);
              return (
                <motion.div
                  key={drink.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group bg-white border border-[var(--taupe)]/20 rounded-xl p-6 hover:shadow-lg hover:border-[var(--taupe)]/40 transition-all duration-300"
                >
                  <div className="flex gap-6">
                    {/* Date Column */}
                    <div className="flex-shrink-0 w-16 text-center">
                      <div className="text-3xl font-[family-name:var(--font-serif)] text-[var(--coffee)]">
                        {date.day}
                      </div>
                      <div className="text-xs uppercase tracking-wider text-[var(--latte)]">
                        {date.month}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="text-xl font-[family-name:var(--font-serif)] text-[var(--coffee)] mb-1">
                            {drink.drink_type}
                          </h3>
                          <p className="text-sm text-[var(--mocha)]">
                            {drink.cafe_name}
                            {drink.cafe_city && (
                              <span className="text-[var(--taupe-dark)]"> &middot; {drink.cafe_city}</span>
                            )}
                          </p>
                        </div>

                        {/* Rating Badge */}
                        <div className={clsx(
                          "flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium",
                          getRatingColor(drink.rating)
                        )}>
                          {Number(drink.rating).toFixed(1)}
                        </div>
                      </div>

                      {drink.notes && (
                        <p className="text-[var(--mocha)] mt-3 leading-relaxed">
                          {drink.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--linen)]">
                        <span className="text-xs text-[var(--taupe-dark)]">
                          {date.time}
                        </span>
                        <button
                          onClick={() => setDeleteId(drink.id)}
                          className="text-xs text-[var(--taupe-dark)] hover:text-[var(--terracotta)] transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-[var(--espresso)]/40 backdrop-blur-sm z-50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl z-50">
            <AlertDialog.Title className="font-[family-name:var(--font-serif)] text-xl text-[var(--coffee)] mb-3">
              Remove Entry
            </AlertDialog.Title>
            <AlertDialog.Description className="text-[var(--mocha)] mb-6">
              This will permanently remove this entry from your archive.
            </AlertDialog.Description>
            <div className="flex gap-3">
              <AlertDialog.Cancel asChild>
                <button className="flex-1 py-3 px-4 rounded-lg border border-[var(--taupe)]/40 text-[var(--mocha)] hover:bg-[var(--bone-light)] transition-colors">
                  Keep
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 px-4 rounded-lg bg-[var(--terracotta)] text-white hover:bg-[var(--coffee)] transition-colors"
                >
                  Remove
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
