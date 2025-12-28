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
import { Star, Grid, List, X } from 'lucide-react';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
type ViewMode = 'list' | 'grid';

export default function HistoryPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCafeId, setFilterCafeId] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  // Filter and sort drinks
  const filteredDrinks = drinks
    .filter(d => filterRating === null || Math.floor(Number(d.rating)) === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime();
        case 'highest':
          return Number(b.rating) - Number(a.rating);
        case 'lowest':
          return Number(a.rating) - Number(b.rating);
        default:
          return new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime();
      }
    });

  // Group drinks by date for list view
  const groupedDrinks = filteredDrinks.reduce((acc, drink) => {
    const dateKey = new Date(drink.logged_at).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(drink);
    return acc;
  }, {} as Record<string, Drink[]>);

  // Rating counts for filter chips
  const ratingCounts = drinks.reduce((acc, d) => {
    const r = Math.floor(Number(d.rating));
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={clsx(
              "w-3.5 h-3.5",
              n <= rating ? "fill-terracotta text-terracotta" : "text-taupe/30"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-coffee mb-1">Archive</h1>
        <p className="text-sm text-taupe-dark">{drinks.length} entries</p>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Cafe Filter */}
        <Select value={filterCafeId} onValueChange={setFilterCafeId}>
          <SelectTrigger className="w-[160px] border-(--taupe)/30 focus:ring-(--coffee)/20 h-9 text-sm">
            <SelectValue placeholder="All Cafes" />
          </SelectTrigger>
          <SelectContent className="bg-white border-(--taupe)/20">
            <SelectItem value="all" className="focus:bg-linen">All Cafes</SelectItem>
            {cafes.map((cafe) => (
              <SelectItem key={cafe.id} value={String(cafe.id)} className="focus:bg-linen">
                {cafe.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[140px] border-(--taupe)/30 focus:ring-(--coffee)/20 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white border-(--taupe)/20">
            <SelectItem value="newest" className="focus:bg-linen">Newest</SelectItem>
            <SelectItem value="oldest" className="focus:bg-linen">Oldest</SelectItem>
            <SelectItem value="highest" className="focus:bg-linen">Highest Rated</SelectItem>
            <SelectItem value="lowest" className="focus:bg-linen">Lowest Rated</SelectItem>
          </SelectContent>
        </Select>

        {/* View Toggle */}
        <div className="flex border border-(--taupe)/30 rounded-lg overflow-hidden ml-auto">
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              "p-2 transition-colors",
              viewMode === 'list' ? "bg-coffee text-white" : "bg-white text-mocha hover:bg-linen"
            )}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              "p-2 transition-colors",
              viewMode === 'grid' ? "bg-coffee text-white" : "bg-white text-mocha hover:bg-linen"
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rating Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterRating(null)}
          className={clsx(
            "px-3 py-1.5 rounded-full text-sm transition-all",
            filterRating === null
              ? "bg-coffee text-white"
              : "bg-linen text-mocha hover:bg-(--taupe)/20"
          )}
        >
          All ({drinks.length})
        </button>
        {[5, 4, 3, 2, 1].map((r) => (
          <button
            key={r}
            onClick={() => setFilterRating(filterRating === r ? null : r)}
            className={clsx(
              "px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5",
              filterRating === r
                ? "bg-coffee text-white"
                : "bg-linen text-mocha hover:bg-(--taupe)/20"
            )}
          >
            <Star className={clsx("w-3 h-3", filterRating === r ? "fill-white" : "fill-terracotta text-terracotta")} />
            {r} ({ratingCounts[r] || 0})
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-taupe border-t-coffee rounded-full animate-spin" />
        </div>
      ) : filteredDrinks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-mocha">No entries found</p>
          {filterRating !== null && (
            <button
              onClick={() => setFilterRating(null)}
              className="mt-2 text-sm text-terracotta hover:text-coffee"
            >
              Clear filter
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredDrinks.map((drink) => (
              <motion.div
                key={drink.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-xl border border-(--taupe)/20 overflow-hidden group"
              >
                <div className="p-4">
                  {/* Rating */}
                  <div className="mb-2">{renderStars(Number(drink.rating))}</div>

                  {/* Title */}
                  <h3 className="font-medium text-coffee">{drink.drink_type}</h3>
                  <p className="text-sm text-taupe-dark">at {drink.cafe_name}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-2 text-xs text-taupe">
                    <span>{formatDate(drink.logged_at)}</span>
                    {drink.price && <span>${Number(drink.price).toFixed(2)}</span>}
                  </div>

                  {/* Flavor Tags */}
                  {drink.flavor_tags && drink.flavor_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {drink.flavor_tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-xs bg-linen text-mocha rounded-full">
                          {tag}
                        </span>
                      ))}
                      {drink.flavor_tags.length > 3 && (
                        <span className="px-2 py-0.5 text-xs bg-linen text-taupe rounded-full">
                          +{drink.flavor_tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {drink.notes && (
                    <p className="text-sm text-mocha mt-2 line-clamp-2">{drink.notes}</p>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteId(drink.id)}
                    className="mt-3 text-xs text-taupe-dark hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* List View */
        <div className="space-y-4">
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
                      <div
                        className="flex gap-4 p-4 cursor-pointer"
                        onClick={() => setExpandedId(expandedId === drink.id ? null : drink.id)}
                      >
                        {/* Rating */}
                        <div className="w-12 h-12 flex items-center justify-center bg-linen rounded-lg flex-shrink-0">
                          <span className="text-lg font-medium text-coffee">
                            {Number(drink.rating).toFixed(0)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-coffee">{drink.drink_type}</span>
                          </div>
                          <p className="text-sm text-taupe-dark">at {drink.cafe_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {renderStars(Number(drink.rating))}
                            {drink.price && (
                              <span className="text-xs text-taupe">${Number(drink.price).toFixed(2)}</span>
                            )}
                          </div>
                        </div>

                        {/* Delete */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); setDeleteId(drink.id); }}
                          className="text-xs text-taupe-dark hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity h-auto py-1"
                        >
                          Remove
                        </Button>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {expandedId === drink.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0 ml-16">
                              {/* Flavor Tags */}
                              {drink.flavor_tags && drink.flavor_tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {drink.flavor_tags.map((tag) => (
                                    <span key={tag} className="px-2 py-0.5 text-xs bg-linen text-mocha rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Notes */}
                              {drink.notes && (
                                <p className="text-sm text-mocha">{drink.notes}</p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
