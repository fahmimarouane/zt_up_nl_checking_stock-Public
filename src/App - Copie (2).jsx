import React, { useState } from 'react';
import { Upload, CheckCircle, TrendingUp, TrendingDown, Download, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';

const PriceComparator = () => {
  const [zonetechFile, setZonetechFile] = useState(null);
  const [ultrapcFile, setUltrapcFile] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const normalizeReference = (ref) => {
    if (!ref) return 'nan';
    return String(ref).replace(/\.0$/, '').trim();
  };

  const priceToFloat = (price) => {
    if (!price) return null;
    const cleaned = String(price).replace(/[^\d,]/g, '').replace(',', '.');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  const formatPrice = (val) => {
    if (val === null || val === undefined) return '';
    return val.toLocaleString('fr-MA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD';
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'zonetech') {
        setZonetechFile(file);
      } else {
        setUltrapcFile(file);
      }
    }
  };

  const processComparison = async () => {
    if (!zonetechFile || !ultrapcFile) {
      alert('Veuillez charger les deux fichiers Excel');
      return;
    }

    setLoading(true);
    
    try {
      // Charger les fichiers Excel
      const ztData = await zonetechFile.arrayBuffer();
      const ztWorkbook = XLSX.read(ztData);
      
      const upData = await ultrapcFile.arrayBuffer();
      const upWorkbook = XLSX.read(upData);

      // Lire les données de la première feuille de chaque fichier
      const ztSheetName = ztWorkbook.SheetNames[0];
      const upSheetName = upWorkbook.SheetNames[0];
      
      const ztAllData = XLSX.utils.sheet_to_json(ztWorkbook.Sheets[ztSheetName]);
      const upAllData = XLSX.utils.sheet_to_json(upWorkbook.Sheets[upSheetName]);

      // Grouper par catégorie
      const comparisonResults = {};

      // Obtenir toutes les catégories uniques
      const allCategories = new Set([
        ...ztAllData.map(row => row.categorie),
        ...upAllData.map(row => row.categorie)
      ]);

      // Traiter chaque catégorie
      allCategories.forEach(category => {
        if (!category) return;

        // Filtrer les données par catégorie
        const ztCategoryData = ztAllData
          .filter(row => row.categorie === category)
          .map(row => ({
            ...row,
            reference: normalizeReference(row.reference),
            price_num: priceToFloat(row.price)
          }))
          .filter(row => row.reference !== 'nan');

        const upCategoryData = upAllData
          .filter(row => row.categorie === category)
          .map(row => ({
            ...row,
            reference: normalizeReference(row.reference),
            price_num: priceToFloat(row.price)
          }))
          .filter(row => row.reference !== 'nan');

        // Créer des maps pour la comparaison
        const ztMap = new Map(ztCategoryData.map(item => [item.reference, item]));
        const upMap = new Map(upCategoryData.map(item => [item.reference, item]));

        const important = [];
        
        // Comparer les produits ayant la même référence
        ztMap.forEach((ztItem, ref) => {
          const upItem = upMap.get(ref);
          if (!upItem) return;

          const stockMismatch = ztItem.availability !== upItem.availability;
          const priceMismatch = ztItem.price_num !== upItem.price_num;

          // Garder uniquement les cas où stock ET prix sont différents
          if (stockMismatch && priceMismatch) {
            const diff = ztItem.price_num - upItem.price_num;
            const diffPercent = upItem.price_num ? (diff / upItem.price_num) * 100 : 0;

            let caseType = '';
            if (ztItem.availability === 'outofstock' && upItem.availability === 'instock') {
              caseType = 'Out of stock at ZoneTech / In stock at UltraPC';
            } else {
              caseType = 'In stock at ZoneTech / Out of stock at UltraPC';
            }

            important.push({
              product_name: ztItem.product_name || ztItem.nom_produit || 'N/A',
              reference: ref,
              zt_price: ztItem.price_num,
              up_price: upItem.price_num,
              difference: diff,
              diff_percent: diffPercent,
              zt_stock: ztItem.availability,
              up_stock: upItem.availability,
              case: caseType,
              zt_url: ztItem.url_produit || ztItem.url || '',
              up_url: upItem.url_produit || upItem.url || ''
            });
          }
        });

        // Ajouter la catégorie seulement si elle contient des produits
        if (important.length > 0) {
          comparisonResults[category] = important;
        }
      });

      setResults(comparisonResults);
      if (Object.keys(comparisonResults).length > 0) {
        setSelectedCategory(Object.keys(comparisonResults)[0]);
      } else {
        alert('Aucune différence importante trouvée entre les deux fichiers');
      }
    } catch (error) {
      console.error('Erreur détaillée:', error);
      alert('Erreur lors du traitement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!results) return;

    const wb = XLSX.utils.book_new();

    // Créer une sheet par catégorie
    Object.entries(results).forEach(([category, data]) => {
      const exportData = data.map(item => ({
        'Product Name': item.product_name,
        'Reference': item.reference,
        'ZoneTech Price': formatPrice(item.zt_price),
        'UltraPC Price': formatPrice(item.up_price),
        'Difference': formatPrice(item.difference),
        'Diff %': item.diff_percent.toFixed(2) + '%',
        'ZoneTech Stock': item.zt_stock === 'instock' ? 'In Stock' : 'Out of Stock',
        'UltraPC Stock': item.up_stock === 'instock' ? 'In Stock' : 'Out of Stock',
        'Case': item.case,
        'ZoneTech URL': item.zt_url,
        'UltraPC URL': item.up_url
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // Limiter le nom de la sheet à 31 caractères (limite Excel)
      const sheetName = category.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Générer le nom du fichier avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    XLSX.writeFile(wb, `IMPORTANT_STOCK_PRICE_MISMATCH_${timestamp}.xlsx`);
  };

  const currentData = results && selectedCategory ? results[selectedCategory] : [];

  const getSummaryStats = () => {
    if (!currentData.length) return null;

    const ztInStockUpIn = currentData.filter(d => d.zt_stock === 'instock' && d.up_stock === 'instock').length;
    const ztInStockUpOut = currentData.filter(d => d.zt_stock === 'instock' && d.up_stock === 'outofstock').length;
    const ztOutStockUpIn = currentData.filter(d => d.zt_stock === 'outofstock' && d.up_stock === 'instock').length;
    const ztOutStockUpOut = currentData.filter(d => d.zt_stock === 'outofstock' && d.up_stock === 'outofstock').length;

    return { ztInStockUpIn, ztInStockUpOut, ztOutStockUpIn, ztOutStockUpOut };
  };

  const getGlobalStats = () => {
    if (!results) return null;

    let totalProducts = 0;
    let totalZtCheaper = 0;
    let totalUpCheaper = 0;

    Object.values(results).forEach(categoryData => {
      totalProducts += categoryData.length;
      totalZtCheaper += categoryData.filter(d => d.difference < 0).length;
      totalUpCheaper += categoryData.filter(d => d.difference > 0).length;
    });

    return { totalProducts, totalZtCheaper, totalUpCheaper, totalCategories: Object.keys(results).length };
  };

  const summaryStats = getSummaryStats();
  const globalStats = getGlobalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg border-b-4 border-blue-600 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎯 Comparateur ZoneTech vs UltraPC
              </h1>
              <p className="text-gray-600">Analyse des prix et disponibilités par catégorie</p>
            </div>
            {globalStats && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{globalStats.totalCategories}</div>
                    <div className="text-gray-600">Catégories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{globalStats.totalProducts}</div>
                    <div className="text-gray-600">Produits</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Files */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
            <label className="block cursor-pointer">
              <div className="flex items-center mb-3">
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-base font-semibold text-gray-700">Fichier ZoneTech</span>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileUpload(e, 'zonetech')}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </label>
            {zonetechFile && (
              <div className="flex items-center text-green-600 text-sm mt-3 bg-green-50 p-2 rounded-md">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="font-medium">{zonetechFile.name}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
            <label className="block cursor-pointer">
              <div className="flex items-center mb-3">
                <Upload className="w-5 h-5 mr-2 text-blue-600" />
                <span className="text-base font-semibold text-gray-700">Fichier UltraPC</span>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileUpload(e, 'ultrapc')}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </label>
            {ultrapcFile && (
              <div className="flex items-center text-green-600 text-sm mt-3 bg-green-50 p-2 rounded-md">
                <CheckCircle className="w-4 h-4 mr-2" />
                <span className="font-medium">{ultrapcFile.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={processComparison}
            disabled={!zonetechFile || !ultrapcFile || loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyse en cours...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5" />
                Comparer les fichiers
              </>
            )}
          </button>
          
          {results && (
            <button
              onClick={exportToExcel}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exporter Excel
            </button>
          )}
        </div>

        {results && (
          <>
            {/* Category Tabs */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Catégories ({Object.keys(results).length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {Object.keys(results).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                    <span className="ml-2 bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                      {results[category].length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            {summaryStats && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Résumé de Disponibilité - {selectedCategory}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Both In Stock */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-green-700 font-semibold text-sm">✓ Les Deux Disponibles</span>
                    </div>
                    <div className="text-4xl font-bold text-green-700 mb-3">{summaryStats.ztInStockUpIn}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded-md font-medium">ZoneTech ✓</span>
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded-md font-medium">UltraPC ✓</span>
                    </div>
                  </div>

                  {/* Only ZoneTech */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-blue-700 font-semibold text-sm">Seulement ZoneTech</span>
                    </div>
                    <div className="text-4xl font-bold text-blue-700 mb-3">{summaryStats.ztInStockUpOut}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-md font-medium">ZoneTech ✓</span>
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded-md font-medium">UltraPC ✗</span>
                    </div>
                  </div>

                  {/* Only UltraPC */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-orange-700 font-semibold text-sm">Seulement UltraPC</span>
                    </div>
                    <div className="text-4xl font-bold text-orange-700 mb-3">{summaryStats.ztOutStockUpIn}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded-md font-medium">ZoneTech ✗</span>
                      <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-md font-medium">UltraPC ✓</span>
                    </div>
                  </div>

                  {/* Both Out of Stock */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-700 font-semibold text-sm">✗ Les Deux en Rupture</span>
                    </div>
                    <div className="text-4xl font-bold text-gray-700 mb-3">{summaryStats.ztOutStockUpOut}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md font-medium">ZoneTech ✗</span>
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md font-medium">UltraPC ✗</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Price Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">Total Produits</p>
                <p className="text-3xl font-bold text-gray-900">{currentData.length}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
                  <p className="text-xs text-gray-600 uppercase tracking-wide">ZT Plus Cher</p>
                </div>
                <p className="text-3xl font-bold text-red-600">{currentData.filter(d => d.difference > 0).length}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex items-center mb-2">
                  <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
                  <p className="text-xs text-gray-600 uppercase tracking-wide">ZT Moins Cher</p>
                </div>
                <p className="text-3xl font-bold text-green-600">{currentData.filter(d => d.difference < 0).length}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">Diff. Moyenne</p>
                <p className="text-3xl font-bold text-blue-600">
                  {currentData.length > 0 
                    ? (currentData.reduce((sum, d) => sum + Math.abs(d.diff_percent), 0) / currentData.length).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wide">Produit</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 uppercase tracking-wide">Réf.</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700 uppercase tracking-wide">ZoneTech</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700 uppercase tracking-wide">UltraPC</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700 uppercase tracking-wide">Diff.</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 uppercase tracking-wide">Stock</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 uppercase tracking-wide">Liens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentData.map((item, idx) => (
                      <tr key={idx} className="hover:bg-blue-50 transition-colors">
                        <td className="px-4 py-3 text-gray-800 font-medium">{item.product_name}</td>
                        <td className="px-4 py-3 font-mono text-gray-600 text-xs">{item.reference}</td>
                        <td className="px-4 py-3 text-right text-gray-800 font-semibold">{formatPrice(item.zt_price)}</td>
                        <td className="px-4 py-3 text-right text-gray-800 font-semibold">{formatPrice(item.up_price)}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="text-right">
                            <div className={`font-bold ${item.difference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {item.difference > 0 ? '+' : ''}{formatPrice(Math.abs(item.difference))}
                            </div>
                            <div className="text-xs text-gray-500 font-medium">
                              {item.diff_percent > 0 ? '+' : ''}{item.diff_percent.toFixed(1)}%
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`text-center px-2 py-1 text-xs rounded-md font-medium ${item.zt_stock === 'instock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              ZT: {item.zt_stock === 'instock' ? '✓ Stock' : '✗ Rupture'}
                            </span>
                            <span className={`text-center px-2 py-1 text-xs rounded-md font-medium ${item.up_stock === 'instock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              UP: {item.up_stock === 'instock' ? '✓ Stock' : '✗ Rupture'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            {item.zt_url && (
                              <a 
                                href={item.zt_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-semibold hover:bg-blue-200 transition-colors"
                              >
                                ZT →
                              </a>
                            )}
                            {item.up_url && (
                              <a 
                                href={item.up_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-semibold hover:bg-blue-200 transition-colors"
                              >
                                UP →
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {currentData.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <p className="text-yellow-800 font-medium">Aucune différence importante trouvée pour cette catégorie</p>
              </div>
            )}
          </>
        )}

        {!results && !loading && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Prêt à comparer</h3>
            <p className="text-gray-500">Chargez vos fichiers Excel et cliquez sur "Comparer les fichiers"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceComparator;