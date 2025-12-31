'use client';

import { useState, useEffect, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { getStyleScore } from '@/lib/styleMatcher';
import MultiSelect from '@/components/MultiSelect';

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
  const [expandedIndex, setExpandedIndex] = useState(null);

  // FLIP animation refs
  const gridRef = useRef(null);
  const cardPositions = useRef(new Map());
  const isFirstRender = useRef(true);

  // Capture card positions before DOM updates
  const capturePositions = useCallback(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll('[data-card-idx]');
    cards.forEach(card => {
      const idx = card.dataset.cardIdx;
      const rect = card.getBoundingClientRect();
      cardPositions.current.set(idx, { x: rect.left, y: rect.top });
    });
  }, []);

  // Apply FLIP animation after DOM updates
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('[data-card-idx]');
    cards.forEach(card => {
      const idx = card.dataset.cardIdx;
      const oldPos = cardPositions.current.get(idx);
      if (!oldPos) return;

      const newRect = card.getBoundingClientRect();
      const deltaX = oldPos.x - newRect.left;
      const deltaY = oldPos.y - newRect.top;

      if (deltaX === 0 && deltaY === 0) return;

      // Apply inverse transform (FLIP: Invert)
      card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      card.style.transition = 'none';

      // Force reflow
      card.offsetHeight;

      // Animate to final position (FLIP: Play)
      card.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      card.style.transform = '';
    });

    // Clear old positions
    cardPositions.current.clear();
  }, [expandedIndex]);

  // Handle expand with position capture
  const handleCardClick = useCallback((idx) => {
    capturePositions();
    setExpandedIndex(prev => prev === idx ? null : idx);
  }, [capturePositions]);

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

  // Handle escape key to collapse expanded card
  useEffect(() => {
    if (expandedIndex !== null) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          capturePositions();
          setExpandedIndex(null);
        }
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [expandedIndex, capturePositions]);

  // Reset expanded card and scroll to top when page changes
  useEffect(() => {
    setExpandedIndex(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // Get available types for dropdowns
  const knifeTypes = useMemo(() => getUniqueTypes(knives), [knives]);
  const gloveTypes = useMemo(() => getUniqueTypes(gloves), [gloves]);

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10'; // God tier
    if (score >= 80) return 'text-purple-400 border-purple-500/50 bg-purple-500/10'; // Elite
    if (score >= 70) return 'text-green-400 border-green-500/50 bg-green-500/10';    // Great
    if (score >= 60) return 'text-blue-400 border-blue-500/50 bg-blue-500/10';       // Good
    return 'text-gray-400 border-gray-500/50 bg-gray-500/10';                        // Acceptable
  };

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

        {/* Results Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 relative z-0">
          {paginatedCombos.map((combo, idx) => {
            const isExpanded = expandedIndex === idx;
            const staggerClass = `stagger-${Math.min((idx % 12) + 1, 12)}`;

            return (
              <div
                key={`${combo.knife}-${combo.glove}-${idx}`}
                data-card-idx={idx}
                className={`opacity-0 animate-fade-in-up ${staggerClass} ${
                  isExpanded ? 'col-span-1 md:col-span-2 card-expanding' : ''
                }`}
                style={{ animationFillMode: 'forwards' }}
              >
                <div
                  onClick={() => handleCardClick(idx)}
                  className={`group bg-gray-800 border rounded-2xl transition-all cursor-pointer overflow-hidden ${
                    isExpanded
                      ? 'border-purple-500 shadow-2xl shadow-purple-500/20 animate-expand'
                      : 'border-gray-700 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 card-hover'
                  }`}
                >
                  {isExpanded ? (
                    /* Expanded View */
                    <div className="p-5 expanded-content">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4 expanded-header">
                        <div className={`px-3 py-1.5 rounded-full text-sm font-bold border ${getScoreColor(combo.styleScore)} animate-pulse-glow`}>
                          {combo.styleScore} Match Score
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); capturePositions(); setExpandedIndex(null); }}
                          className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-400 hover:text-white transition-all btn-press hover:rotate-90"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Images Side by Side */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Knife */}
                        <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-4 border border-gray-700 expanded-image-left hover:border-purple-500/50 transition-colors">
                          <div className="h-40 flex items-center justify-center mb-3 overflow-hidden rounded-lg">
                            {(combo.knifeImage || imageMap[combo.knife]) ? (
                              <img
                                src={combo.knifeImage || imageMap[combo.knife]}
                                alt={combo.knife}
                                className="max-w-full max-h-full object-contain drop-shadow-xl img-zoom expanded-img"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                                <span className="text-gray-600 text-sm">No image</span>
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Knife</span>
                            <h3 className="text-sm font-bold text-white mt-0.5 mb-1 line-clamp-2">{combo.knife}</h3>
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <span className="text-lg font-bold text-green-400 font-mono">${combo.knifePrice.toFixed(2)}</span>
                              {combo.knifeCondition && (
                                <span className="px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-200 text-[10px] border border-gray-600">
                                  {combo.knifeCondition}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Gloves */}
                        <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-xl p-4 border border-gray-700 expanded-image-right hover:border-pink-500/50 transition-colors">
                          <div className="h-40 flex items-center justify-center mb-3 overflow-hidden rounded-lg">
                            {(combo.gloveImage || imageMap[combo.glove]) ? (
                              <img
                                src={combo.gloveImage || imageMap[combo.glove]}
                                alt={combo.glove}
                                className="max-w-full max-h-full object-contain drop-shadow-xl img-zoom expanded-img"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
                                <span className="text-gray-600 text-sm">No image</span>
                              </div>
                            )}
                          </div>
                          <div className="text-center">
                            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">Gloves</span>
                            <h3 className="text-sm font-bold text-white mt-0.5 mb-1 line-clamp-2">{combo.glove}</h3>
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <span className="text-lg font-bold text-green-400 font-mono">${combo.glovePrice.toFixed(2)}</span>
                              {combo.gloveCondition && (
                                <span className="px-1.5 py-0.5 rounded-full bg-gray-700 text-gray-200 text-[10px] border border-gray-600">
                                  {combo.gloveCondition}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer with Total and Buy Buttons */}
                      <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700 expanded-footer">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Total</span>
                            <div className="text-2xl font-black text-white font-mono">${combo.totalPrice.toFixed(2)}</div>
                          </div>
                          <div className="flex gap-2">
                            <a
                              href={combo.knifeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 text-xs btn-press hover:shadow-lg hover:shadow-purple-500/25"
                            >
                              Buy Knife
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                            <a
                              href={combo.gloveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 text-xs btn-press hover:shadow-lg hover:shadow-pink-500/25"
                            >
                              Buy Gloves
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Collapsed View */
                    <div className="p-5 flex flex-col relative">
                      {/* Score Badge */}
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border transition-transform group-hover:scale-110 ${getScoreColor(combo.styleScore)}`}>
                        {combo.styleScore} Score
                      </div>

                      {/* Knife Section */}
                      <div className="mb-4">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Knife</span>
                        <div className="mt-3 flex items-start gap-4">
                          <div className="shrink-0 overflow-hidden rounded-xl">
                            {(combo.knifeImage || imageMap[combo.knife]) ? (
                              <img
                                src={combo.knifeImage || imageMap[combo.knife]}
                                alt={combo.knife}
                                className="w-24 h-24 object-contain bg-gray-800 rounded-xl border border-gray-700 transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-24 h-24 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center animate-shimmer">
                                <span className="text-gray-600 text-xs">Loading...</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-purple-400 transition-colors line-clamp-2">
                              {combo.knife}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="text-green-400 font-mono text-sm">${combo.knifePrice.toFixed(2)}</div>
                              {combo.knifeCondition && (
                                <span className="text-[11px] px-2 py-1 rounded-full bg-gray-700 text-gray-200 border border-gray-600">
                                  {combo.knifeCondition}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Glove Section */}
                      <div className="mb-6">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gloves</span>
                        <div className="mt-3 flex items-start gap-4">
                          <div className="shrink-0 overflow-hidden rounded-xl">
                            {(combo.gloveImage || imageMap[combo.glove]) ? (
                              <img
                                src={combo.gloveImage || imageMap[combo.glove]}
                                alt={combo.glove}
                                className="w-24 h-24 object-contain bg-gray-800 rounded-xl border border-gray-700 transition-transform duration-300 group-hover:scale-110"
                                loading="lazy"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            ) : (
                              <div className="w-24 h-24 bg-gray-800 rounded-xl border border-gray-700 flex items-center justify-center animate-shimmer">
                                <span className="text-gray-600 text-xs">Loading...</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-white leading-tight group-hover:text-purple-400 transition-colors line-clamp-2">
                              {combo.glove}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="text-green-400 font-mono text-sm">${combo.glovePrice.toFixed(2)}</div>
                              {combo.gloveCondition && (
                                <span className="text-[11px] px-2 py-1 rounded-full bg-gray-700 text-gray-200 border border-gray-600">
                                  {combo.gloveCondition}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-auto pt-4 border-t border-gray-700/50 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500 uppercase">Total Cost</span>
                          <div className="text-xl font-bold text-white font-mono">${combo.totalPrice.toFixed(2)}</div>
                        </div>
                        <div className="text-gray-500 text-xs flex items-center gap-1 group-hover:text-purple-400 transition-colors">
                          <svg className="w-4 h-4 transition-transform group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          Expand
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

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
    </main>
  );
}
