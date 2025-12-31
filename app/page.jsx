'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { getStyleScore } from '@/lib/styleMatcher';
import MultiSelect from '@/components/MultiSelect';
import ComboCard from '@/components/ComboCard';
import InspectionOverlay from '@/components/InspectionOverlay';

// Condition rankings (higher = better, proxy for lower float)
const conditionRank = {
  'Factory New': 5,
  'Minimal Wear': 4,
  'Field-Tested': 3,
  'Well-Worn': 2,
  'Battle-Scarred': 1,
  'Vanilla': 3, // Treat Vanilla as mid-tier
};
const getRank = (c) => conditionRank[c] || 0;

// Helper to collect unique base types for filters (e.g., "Karambit", "Sport Gloves")
const getUniqueTypes = (items) => {
  const types = new Set();
  items.forEach(item => {
    let name = item.name || '';
    name = name.replace('★ ', '').replace('StatTrak™ ', '');
    const base = name.split('|')[0].trim();
    if (base) types.add(base);
  });
  return Array.from(types).sort();
};

// Helper to find the best condition pair within budget
// We balance condition but don't over-prioritize FN; knife gets slight weight over gloves.
const findBestVariantPair = (knifeVariants, gloveVariants, maxBudget) => {
  let bestPair = null;
  let bestScore = -1;
  let bestPriceScore = -1;

  for (const k of knifeVariants) {
    for (const g of gloveVariants) {
      const total = k.price + g.price;
      if (total > maxBudget) continue;

      // Condition weighting: knife 60%, gloves 40% (but capped so FN isn't absolute king)
      const condScore = getRank(k.condition) * 0.6 + getRank(g.condition) * 0.4;

      // Price tiebreaker: favor spending slightly more on knife (float proxy)
      const priceScore = (k.price * 0.6) + (g.price * 0.4);

      if (condScore > bestScore) {
        bestScore = condScore;
        bestPriceScore = priceScore;
        bestPair = { knife: k, glove: g, totalPrice: total, conditionScore: condScore };
      } else if (condScore === bestScore) {
        if (priceScore > bestPriceScore) {
          bestPriceScore = priceScore;
          bestPair = { knife: k, glove: g, totalPrice: total, conditionScore: condScore };
        }
      }
    }
  }

  return bestPair;
};

export default function Home() {
  const [budget, setBudget] = useState('1000'); // Default budget
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [knives, setKnives] = useState([]);
  const [gloves, setGloves] = useState([]);
  
  // Filter States (arrays for multi-select)
  const [selectedKnifeTypes, setSelectedKnifeTypes] = useState([]);
  const [selectedGloveTypes, setSelectedGloveTypes] = useState([]);
  const [sortBy, setSortBy] = useState('score'); // 'score' or 'price'
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 24;
  const [imageMap, setImageMap] = useState({});
  const inFlightImages = useRef(new Set());
  const gridRef = useRef(null);
  const [selectedComboId, setSelectedComboId] = useState(null);

  // Fetch prices on mount
  useEffect(() => {
    async function fetchPrices() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/prices');
        if (!response.ok) throw new Error('Failed to fetch prices');
        const data = await response.json();
        setKnives(data.knives || []);
        setGloves(data.gloves || []);
        setDataLoaded(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPrices();
  }, []);

  // Compute combinations with filters
  const filteredCombos = useMemo(() => {
    if (!dataLoaded || !budget || budget <= 0) return [];

    const results = [];
    const maxBudget = parseFloat(budget);

    // Filter lists first to reduce iterations
    const filteredKnives = knives.filter(k =>
      selectedKnifeTypes.length === 0 || selectedKnifeTypes.some(type => k.name.includes(type))
    );
    const filteredGloves = gloves.filter(g =>
      selectedGloveTypes.length === 0 || selectedGloveTypes.some(type => g.name.includes(type))
    );

    // Generate valid combos
    for (const knife of filteredKnives) {
      for (const glove of filteredGloves) {
        // Find best specific variants (FN/MW/etc) for this knife/glove type
        const bestVariantPair = findBestVariantPair(knife.variants, glove.variants, maxBudget);
        
        if (bestVariantPair) {
          const styleScore = getStyleScore(knife.name, glove.name);
          
          // Only keep decent matches to reduce noise (lowered threshold for new algorithm)
          if (styleScore >= 45) {
            results.push({
              knife: bestVariantPair.knife.fullName,
              glove: bestVariantPair.glove.fullName,
              knifePrice: bestVariantPair.knife.price,
              glovePrice: bestVariantPair.glove.price,
              totalPrice: bestVariantPair.totalPrice,
              styleScore: styleScore,
              conditionScore: bestVariantPair.conditionScore,
              knifeBasePrice: knife.min_price || bestVariantPair.knife.price,
              knifeCondition: bestVariantPair.knife.condition,
              gloveCondition: bestVariantPair.glove.condition,
              knifeImage: knife.image,
              gloveImage: glove.image,
              knifeLink: `https://skinport.com/market?search=${encodeURIComponent(bestVariantPair.knife.fullName)}`,
              gloveLink: `https://skinport.com/market?search=${encodeURIComponent(bestVariantPair.glove.fullName)}`,
            });
          }
        }
      }
    }

    // Sort: style -> knife desirability -> condition -> weighted price (knife weighted higher)
    results.sort((a, b) => {
      if (sortBy === 'score') {
        if (b.styleScore !== a.styleScore) return b.styleScore - a.styleScore;
        // Knife desirability: higher base price → more sought after knife
        const aKnifeTier = Math.log((a.knifeBasePrice || 0) + 1);
        const bKnifeTier = Math.log((b.knifeBasePrice || 0) + 1);
        if (bKnifeTier !== aKnifeTier) return bKnifeTier - aKnifeTier;
        if ((b.conditionScore || 0) !== (a.conditionScore || 0)) {
          return (b.conditionScore || 0) - (a.conditionScore || 0);
        }
        const aPriceScore = (a.knifePrice || 0) * 0.6 + (a.glovePrice || 0) * 0.4;
        const bPriceScore = (b.knifePrice || 0) * 0.6 + (b.glovePrice || 0) * 0.4;
        return bPriceScore - aPriceScore;
      } else { // price
        return b.totalPrice - a.totalPrice;
      }
    });

    return results;
  }, [budget, knives, gloves, dataLoaded, selectedKnifeTypes, selectedGloveTypes, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredCombos.length / ITEMS_PER_PAGE);
  const paginatedCombos = filteredCombos.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // Fetch images only for items on the current page
  useEffect(() => {
    if (!paginatedCombos.length) return;
    const names = new Set();
    paginatedCombos.forEach((c) => {
      // Only fetch if item doesn't already have an image from the prices API
      if (c.knife && !c.knifeImage) names.add(c.knife);
      if (c.glove && !c.gloveImage) names.add(c.glove);
    });
    const missing = [...names].filter((n) => {
      // Only skip if we have a valid URL (not null/undefined)
      if (imageMap[n]) return false;
      if (inFlightImages.current.has(n)) return false;
      return true;
    });
    if (!missing.length) return;

    // Mark as in-flight
    missing.forEach((n) => inFlightImages.current.add(n));

    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        missing.map(async (name) => {
          try {
            const res = await fetch(`/api/image?name=${encodeURIComponent(name)}`);
            if (!res.ok) return [name, null];
            const data = await res.json();
            return [name, data.url || null];
          } catch {
            return [name, null];
          }
        })
      );
      if (cancelled) return;
      setImageMap((prev) => {
        const next = { ...prev };
        entries.forEach(([n, url]) => {
          // Only cache successful lookups - allow retry for failed ones
          if (url) {
            next[n] = url;
          }
        });
        return next;
      });
      // Clear in-flight marks
      entries.forEach(([n]) => inFlightImages.current.delete(n));
    })();

    return () => {
      cancelled = true;
      // Clear in-flight on cancel to allow refetch if needed
      missing.forEach((n) => inFlightImages.current.delete(n));
    };
  }, [paginatedCombos]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [budget, selectedKnifeTypes, selectedGloveTypes, sortBy]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // Handle escape key to close overlay & lock body scroll when overlay is open
  useEffect(() => {
    if (selectedComboId !== null) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e) => {
        if (e.key === 'Escape') setSelectedComboId(null);
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [selectedComboId]);

  // Get selected combo data
  const selectedCombo = selectedComboId !== null ? paginatedCombos.find((_, idx) =>
    `combo-${page}-${idx}` === selectedComboId
  ) : null;

  // Get available types for dropdowns
  const knifeTypes = useMemo(() => getUniqueTypes(knives), [knives]);
  const gloveTypes = useMemo(() => getUniqueTypes(gloves), [gloves]);

  return (
    <main className="min-h-screen bg-gray-900 text-gray-100 font-sans selection:bg-purple-500/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <header className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight animate-gradient">
            ComboScout
          </h1>
          <p className="text-gray-400 text-lg animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Build your dream CS2 loadout with live market data.
          </p>
        </header>

        {/* Controls Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8 shadow-xl animate-fade-in-up relative z-30" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Budget */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Max Budget (USD)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-400">$</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-gray-900/80 border border-gray-700 rounded-xl py-3 pl-8 pr-4 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:shadow-lg focus:shadow-purple-500/10 transition-all outline-none font-mono"
                  placeholder="1000"
                />
              </div>
            </div>

            {/* Knife Filter */}
            <MultiSelect
              label="Knife Types"
              placeholder="All Knives"
              searchPlaceholder="Search knife types..."
              options={knifeTypes}
              selected={selectedKnifeTypes}
              onChange={setSelectedKnifeTypes}
              variant="knife"
            />

            {/* Glove Filter */}
            <MultiSelect
              label="Glove Types"
              placeholder="All Gloves"
              searchPlaceholder="Search glove types..."
              options={gloveTypes}
              selected={selectedGloveTypes}
              onChange={setSelectedGloveTypes}
              variant="glove"
            />

            {/* Sort */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Sort By
              </label>
              <div className="flex bg-gray-900/80 rounded-xl p-1 border border-gray-700">
                <button
                  onClick={() => setSortBy('score')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all btn-press ${
                    sortBy === 'score' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Best Match
                </button>
                <button
                  onClick={() => setSortBy('price')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all btn-press ${
                    sortBy === 'price' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  Highest Price
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-between items-center mb-6 px-2 animate-fade-in relative z-10" style={{ animationDelay: '0.2s' }}>
          <p className="text-gray-400 text-sm">
            Found <span className="text-white font-bold">{filteredCombos.length.toLocaleString()}</span> combos
          </p>
          {filteredCombos.length > 0 && (
            <p className="text-gray-500 text-sm">
              Page {page} of {totalPages}
            </p>
          )}
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="text-center py-20 animate-fade-in">
            <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-purple-500/20"></div>
            <p className="text-gray-400 animate-pulse text-lg">Scanning market prices...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-center text-red-200 mb-8 animate-fade-in-up">
            {error}
          </div>
        )}

        {/* Results Grid - 3D Parallax Holo Cards */}
        <AnimatePresence mode="sync">
          <div ref={gridRef} className="card-grid mb-8 relative z-0">
            {paginatedCombos.map((combo, idx) => {
              const comboId = `combo-${page}-${idx}`;
              return (
                <ComboCard
                  key={comboId}
                  combo={combo}
                  imageMap={imageMap}
                  comboId={comboId}
                  isSelected={selectedComboId === comboId}
                  onClick={() => setSelectedComboId(comboId)}
                />
              );
            })}
          </div>
        </AnimatePresence>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-8 animate-fade-in">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all btn-press hover:shadow-lg"
            >
              Previous
            </button>

            <div className="flex gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                // Smart pagination logic to show relevant page numbers
                let pNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pNum = page - 2 + i;
                }
                if (pNum > totalPages) return null;

                return (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all btn-press ${
                      page === pNum
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-110'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-800 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-all btn-press hover:shadow-lg"
            >
              Next
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCombos.length === 0 && (
          <div className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-800 border-dashed animate-fade-in-up">
            <div className="text-6xl mb-4 opacity-50">🔍</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No combos found</h3>
            <p className="text-gray-500">Try adjusting your filters or increasing your budget.</p>
          </div>
        )}

      </div>

      {/* Cinematic Inspection Overlay */}
      <InspectionOverlay
        combo={selectedCombo}
        imageMap={imageMap}
        comboId={selectedComboId}
        isOpen={selectedComboId !== null}
        onClose={() => setSelectedComboId(null)}
      />
    </main>
  );
}
