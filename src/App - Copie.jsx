import React, { useState } from 'react';
import { Upload, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import * as XLSX from 'xlsx';

const PriceComparator = () => {
  const [zonetechFile, setZonetechFile] = useState(null);
  const [ultrapcFile, setUltrapcFile] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
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
      const ztData = await zonetechFile.arrayBuffer();
      const ztWorkbook = XLSX.read(ztData);
      
      const upData = await ultrapcFile.arrayBuffer();
      const upWorkbook = XLSX.read(upData);

      const comparisonResults = {};

      ztWorkbook.SheetNames.forEach(sheetName => {
        if (!upWorkbook.SheetNames.includes(sheetName)) return;

        const ztSheet = XLSX.utils.sheet_to_json(ztWorkbook.Sheets[sheetName]);
        const upSheet = XLSX.utils.sheet_to_json(upWorkbook.Sheets[sheetName]);

        const ztData = ztSheet
          .map(row => ({
            ...row,
            reference: normalizeReference(row.reference),
            price_num: priceToFloat(row.price)
          }))
          .filter(row => row.reference !== 'nan');

        const upData = upSheet
          .map(row => ({
            ...row,
            reference: normalizeReference(row.reference),
            price_num: priceToFloat(row.price)
          }))
          .filter(row => row.reference !== 'nan');

        const ztMap = new Map(ztData.map(item => [item.reference, item]));
        const upMap = new Map(upData.map(item => [item.reference, item]));

        const important = [];
        
        ztMap.forEach((ztItem, ref) => {
          const upItem = upMap.get(ref);
          if (!upItem) return;

          const stockMismatch = ztItem.availability !== upItem.availability;
          const priceMismatch = ztItem.price_num !== upItem.price_num;

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

        if (important.length > 0) {
          comparisonResults[sheetName] = important;
        }
      });

      setResults(comparisonResults);
      if (Object.keys(comparisonResults).length > 0) {
        setSelectedSheet(Object.keys(comparisonResults)[0]);
      }
    } catch (error) {
      alert('Erreur lors du traitement: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!results) return;

    const wb = XLSX.utils.book_new();

    Object.entries(results).forEach(([sheetName, data]) => {
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
      XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
    });

    XLSX.writeFile(wb, 'IMPORTANT_STOCK_PRICE_MISMATCH.xlsx');
  };

  const currentData = results && selectedSheet ? results[selectedSheet] : [];

  const getSummaryStats = () => {
    if (!currentData.length) return null;

    const ztInStockUpIn = currentData.filter(d => d.zt_stock === 'instock' && d.up_stock === 'instock').length;
    const ztInStockUpOut = currentData.filter(d => d.zt_stock === 'instock' && d.up_stock === 'outofstock').length;
    const ztOutStockUpIn = currentData.filter(d => d.zt_stock === 'outofstock' && d.up_stock === 'instock').length;
    const ztOutStockUpOut = currentData.filter(d => d.zt_stock === 'outofstock' && d.up_stock === 'outofstock').length;

    return { ztInStockUpIn, ztInStockUpOut, ztOutStockUpIn, ztOutStockUpOut };
  };

  const summaryStats = getSummaryStats();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white border-b-2 border-blue-600 p-4 mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Comparateur ZoneTech vs UltraPC</h1>
        </div>

        {/* Upload Files */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white border border-gray-200 p-3">
            <label className="block">
              <div className="flex items-center mb-2">
                <Upload className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">ZoneTech</span>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileUpload(e, 'zonetech')}
                className="block w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:border file:border-gray-300 file:text-xs file:bg-white file:text-gray-700 hover:file:bg-gray-50"
              />
            </label>
            {zonetechFile && (
              <div className="flex items-center text-green-600 text-xs mt-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                {zonetechFile.name}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 p-3">
            <label className="block">
              <div className="flex items-center mb-2">
                <Upload className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">UltraPC</span>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => handleFileUpload(e, 'ultrapc')}
                className="block w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:border file:border-gray-300 file:text-xs file:bg-white file:text-gray-700 hover:file:bg-gray-50"
              />
            </label>
            {ultrapcFile && (
              <div className="flex items-center text-green-600 text-xs mt-2">
                <CheckCircle className="w-3 h-3 mr-1" />
                {ultrapcFile.name}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={processComparison}
            disabled={!zonetechFile || !ultrapcFile || loading}
            className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Analyse...' : 'Comparer'}
          </button>
          
          {results && (
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white font-semibold py-2 px-4 text-sm hover:bg-green-700"
            >
              Exporter
            </button>
          )}
        </div>

        {results && (
          <>
            {/* Tabs */}
            <div className="bg-white border border-gray-200 p-2 mb-4">
              <div className="flex flex-wrap gap-2">
                {Object.keys(results).map(sheet => (
                  <button
                    key={sheet}
                    onClick={() => setSelectedSheet(sheet)}
                    className={`px-3 py-1 text-sm font-medium rounded-lg ${
                      selectedSheet === sheet
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {sheet} ({results[sheet].length})
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Stats - Simplified */}
            {summaryStats && (
              <div className="bg-white border border-gray-200 p-4 mb-4">
                <h3 className="text-sm font-bold text-gray-900 mb-3">Résumé de Disponibilité</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* Both In Stock */}
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-green-700 font-semibold text-sm">✓ Les Deux Disponibles</span>
                      <span className="text-3xl font-bold text-green-700">{summaryStats.ztInStockUpIn}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded">ZoneTech ✓</span>
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded">UltraPC ✓</span>
                    </div>
                  </div>

                  {/* Only ZoneTech */}
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-700 font-semibold text-sm">Seulement ZoneTech</span>
                      <span className="text-3xl font-bold text-blue-700">{summaryStats.ztInStockUpOut}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">ZoneTech ✓</span>
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded">UltraPC ✗</span>
                    </div>
                  </div>

                  {/* Only UltraPC */}
                  <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-orange-700 font-semibold text-sm">Seulement UltraPC</span>
                      <span className="text-3xl font-bold text-orange-700">{summaryStats.ztOutStockUpIn}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded">ZoneTech ✗</span>
                      <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded">UltraPC ✓</span>
                    </div>
                  </div>

                  {/* Both Out of Stock */}
                  <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-semibold text-sm">✗ Les Deux en Rupture</span>
                      <span className="text-3xl font-bold text-gray-700">{summaryStats.ztOutStockUpOut}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">ZoneTech ✗</span>
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded">UltraPC ✗</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-white border border-gray-200 p-3">
                <p className="text-xs text-gray-600 mb-1">Total Produits</p>
                <p className="text-2xl font-bold text-gray-900">{currentData.length}</p>
              </div>
              
              <div className="bg-white border border-gray-200 p-3">
                <div className="flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                  <p className="text-xs text-gray-600">ZT Plus Cher</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{currentData.filter(d => d.difference > 0).length}</p>
              </div>
              
              <div className="bg-white border border-gray-200 p-3">
                <div className="flex items-center">
                  <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                  <p className="text-xs text-gray-600">ZT Moins Cher</p>
                </div>
                <p className="text-2xl font-bold text-red-600">{currentData.filter(d => d.difference < 0).length}</p>
              </div>
              
              <div className="bg-white border border-gray-200 p-3">
                <p className="text-xs text-gray-600 mb-1">Diff. Moyenne</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentData.length > 0 
                    ? (currentData.reduce((sum, d) => sum + Math.abs(d.diff_percent), 0) / currentData.length).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Produit</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Réf.</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">ZoneTech</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">UltraPC</th>
                    <th className="px-3 py-2 text-right font-semibold text-gray-700">Diff.</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Stock</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Liens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-800">{item.product_name}</td>
                      <td className="px-3 py-2 font-mono text-gray-600">{item.reference}</td>
                      <td className="px-3 py-2 text-right text-gray-800">{formatPrice(item.zt_price)}</td>
                      <td className="px-3 py-2 text-right text-gray-800">{formatPrice(item.up_price)}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="text-right">
                          <div className={`font-semibold ${item.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatPrice(item.difference)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.diff_percent > 0 ? '+' : ''}{item.diff_percent.toFixed(1)}%
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-1">
                          <span className={`text-center px-2 py-0.5 text-xs ${item.zt_stock === 'instock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            ZT: {item.zt_stock === 'instock' ? 'Stock' : 'Rupture'}
                          </span>
                          <span className={`text-center px-2 py-0.5 text-xs ${item.up_stock === 'instock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            UP: {item.up_stock === 'instock' ? 'Stock' : 'Rupture'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          {item.zt_url && (
                            <a href={item.zt_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              ZT
                            </a>
                          )}
                          {item.up_url && (
                            <a href={item.up_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              UP
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PriceComparator;