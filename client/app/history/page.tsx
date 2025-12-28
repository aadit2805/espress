'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDrinks, getCafes, deleteDrink, type Drink, type Cafe } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { clsx } from 'clsx';

export default function HistoryPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCafeId, setFilterCafeId] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [drinksData, cafesData] = await Promise.all([
        getDrinks({
          cafe_id: filterCafeId !== 'all' ? Number(filterCafeId) : undefined,
          sort: 'logged_at',
          order: 'desc',
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
  }, [filterCafeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRatingStyle = (rating: number | string) => {
    const r = Number(rating);
    if (r >= 4) return 'text-[var(--sage)]';
    if (r >= 3) return 'text-[var(--terracotta)]';
    return 'text-[var(--taupe-dark)]';
  };

  // Group drinks by date
  const groupedDrinks = drinks.reduce((acc, drink) => {
    const dateKey = new Date(drink.logged_at).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(drink);
    return acc;
  }, {} as Record<string, Drink[]>);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Filter */}
      <div className="mb-6">
        <Select value={filterCafeId} onValueChange={setFilterCafeId}>
          <SelectTrigger className="w-full max-w-[200px] border-(--taupe)/30 focus:ring-(--coffee)/20">
            <SelectValue placeholder="Filter by cafe" />
          </SelectTrigger>
          <SelectContent className="bg-white border-(--taupe)/20">
            <SelectItem value="all" className="focus:bg-linen">All Cafes</SelectItem>
            {cafes.map((cafe) => (
              <SelectItem
                key={cafe.id}
                value={String(cafe.id)}
                className="focus:bg-linen"
              >
                {cafe.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Drinks List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-taupe border-t-coffee rounded-full animate-spin" />
        </div>
      ) : drinks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-mocha">No entries yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDrinks).map(([dateKey, dayDrinks]) => (
            <div key={dateKey}>
              <p className="text-xs font-medium text-taupe-dark mb-2 px-1">
                {formatDate(dayDrinks[0].logged_at)}
              </p>
              <div className="bg-white rounded-xl border border-(--taupe)/20 divide-y divide-(--taupe)/10">
                <AnimatePresence mode="popLayout">
                  {dayDrinks.map((drink) => (
                    <motion.div
                      key={drink.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="group"
                    >
                      <div className="flex items-center gap-4 p-4">
                        {/* Rating */}
                        <div className={clsx("text-lg font-medium w-8 text-center", getRatingStyle(drink.rating))}>
                          {Number(drink.rating).toFixed(0)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="font-medium text-coffee">{drink.drink_type}</span>
                            <span className="text-sm text-taupe-dark">at {drink.cafe_name}</span>
                          </div>
                          {drink.notes && (
                            <p className="text-sm text-mocha mt-0.5 truncate">{drink.notes}</p>
                          )}
                        </div>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(drink.id)}
                          className="text-xs text-taupe-dark hover:text-terracotta opacity-0 group-hover:opacity-100 transition-opacity h-auto py-1"
                        >
                          Remove
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white max-w-xs">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-coffee">Remove entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-mocha">
              This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-(--taupe)/30 text-mocha hover:bg-linen">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-terracotta hover:bg-(--terracotta)/90 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
