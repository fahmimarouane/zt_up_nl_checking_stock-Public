import React, { useState } from 'react';
<<<<<<< HEAD
<<<<<<< HEAD
import { Upload, CheckCircle, TrendingUp, TrendingDown, Download, BarChart3, Filter, Menu } from 'lucide-react';
=======
import { Upload, CheckCircle, TrendingUp, TrendingDown, Download, BarChart3, Filter, Menu } from 'lucide-react'; 
>>>>>>> c486de989c9f6ce3fb05a643b9883b1e70e5e71b
import * as XLSX from 'xlsx';

const PriceComparator = () => {
  // États pour la sélection du mode de comparaison
  const [comparisonMode, setComparisonMode] = useState('zt-up'); // 'zt-up' ou 'zt-nl'
  
  // États pour les fichiers ZoneTech vs UltraPC
  const [zonetechFile, setZonetechFile] = useState(null);
  const [ultrapcFile, setUltrapcFile] = useState(null);
  
  // États pour les fichiers ZoneTech vs NextLevelPC
  const [zonetechFile2, setZonetechFile2] = useState(null);
  const [nextlevelFile, setNextlevelFile] = useState(null);
  
=======
import { Upload, CheckCircle, TrendingUp, TrendingDown, Download, BarChart3, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

const PriceComparator = () => {
  const [zonetechFile, setZonetechFile] = useState(null);
  const [ultrapcFile, setUltrapcFile] = useState(null);
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
  const [results, setResults] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState('all');

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
<<<<<<< HEAD
      switch(type) {
        case 'zonetech':
          setZonetechFile(file);
          break;
        case 'ultrapc':
          setUltrapcFile(file);
          break;
        case 'zonetech2':
          setZonetechFile2(file);
          break;
        case 'nextlevel':
          setNextlevelFile(file);
          break;
        default:
          break;
=======
      if (type === 'zonetech') {
        setZonetechFile(file);
      } else {
        setUltrapcFile(file);
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
      }
    }
  };

<<<<<<< HEAD
  const handleModeChange = (mode) => {
    setComparisonMode(mode);
    // Réinitialiser les résultats lors du changement de mode
    setResults(null);
    setSelectedCategory(null);
  };

  const processComparison = async () => {
    let file1, file2, site1Name, site2Name;

    if (comparisonMode === 'zt-up') {
      if (!zonetechFile || !ultrapcFile) {
        alert('Veuillez charger les deux fichiers Excel (ZoneTech et UltraPC)');
        return;
      }
      file1 = zonetechFile;
      file2 = ultrapcFile;
      site1Name = 'ZoneTech';
      site2Name = 'UltraPC';
    } else {
      if (!zonetechFile2 || !nextlevelFile) {
        alert('Veuillez charger les deux fichiers Excel (ZoneTech et NextLevelPC)');
        return;
      }
      file1 = zonetechFile2;
      file2 = nextlevelFile;
      site1Name = 'ZoneTech';
      site2Name = 'NextLevelPC';
=======
  const processComparison = async () => {
    if (!zonetechFile || !ultrapcFile) {
      alert('Veuillez charger les deux fichiers Excel');
      return;
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
    }

    setLoading(true);
    
    try {
<<<<<<< HEAD
      const data1 = await file1.arrayBuffer();
      const workbook1 = XLSX.read(data1);
      
      const data2 = await file2.arrayBuffer();
      const workbook2 = XLSX.read(data2);

      const sheetName1 = workbook1.SheetNames[0];
      const sheetName2 = workbook2.SheetNames[0];
      
      const allData1 = XLSX.utils.sheet_to_json(workbook1.Sheets[sheetName1]);
      const allData2 = XLSX.utils.sheet_to_json(workbook2.Sheets[sheetName2]);
=======
      const ztData = await zonetechFile.arrayBuffer();
      const ztWorkbook = XLSX.read(ztData);
      
      const upData = await ultrapcFile.arrayBuffer();
      const upWorkbook = XLSX.read(upData);

      const ztSheetName = ztWorkbook.SheetNames[0];
      const upSheetName = upWorkbook.SheetNames[0];
      
      const ztAllData = XLSX.utils.sheet_to_json(ztWorkbook.Sheets[ztSheetName]);
      const upAllData = XLSX.utils.sheet_to_json(upWorkbook.Sheets[upSheetName]);
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830

      const comparisonResults = {};

      const allCategories = new Set([
<<<<<<< HEAD
        ...allData1.map(row => row.categorie),
        ...allData2.map(row => row.categorie)
=======
        ...ztAllData.map(row => row.categorie),
        ...upAllData.map(row => row.categorie)
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
      ]);

      allCategories.forEach(category => {
        if (!category) return;

<<<<<<< HEAD
        const categoryData1 = allData1
=======
        const ztCategoryData = ztAllData
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
          .filter(row => row.categorie === category)
          .map(row => ({
            ...row,
            reference: normalizeReference(row.reference),
            price_num: priceToFloat(row.price)
          }))
          .filter(row => row.reference !== 'nan');

<<<<<<< HEAD
        const categoryData2 = allData2
=======
        const upCategoryData = upAllData
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
          .filter(row => row.categorie === category)
          .map(row => ({
            ...row,
            reference: normalizeReference(row.reference),
            price_num: priceToFloat(row.price)
          }))
          .filter(row => row.reference !== 'nan');

<<<<<<< HEAD
        const map1 = new Map(categoryData1.map(item => [item.reference, item]));
        const map2 = new Map(categoryData2.map(item => [item.reference, item]));

        const important = [];
        
        map1.forEach((item1, ref) => {
          const item2 = map2.get(ref);
          if (!item2) return;

          const stockMismatch = item1.availability !== item2.availability;
          const priceMismatch = item1.price_num !== item2.price_num;

          if (stockMismatch || priceMismatch) {
            const diff = item1.price_num - item2.price_num;
            const diffPercent = item2.price_num ? (diff / item2.price_num) * 100 : 0;
=======
        const ztMap = new Map(ztCategoryData.map(item => [item.reference, item]));
        const upMap = new Map(upCategoryData.map(item => [item.reference, item]));

        const important = [];
        
        ztMap.forEach((ztItem, ref) => {
          const upItem = upMap.get(ref);
          if (!upItem) return;

          const stockMismatch = ztItem.availability !== upItem.availability;
          const priceMismatch = ztItem.price_num !== upItem.price_num;

          if (stockMismatch || priceMismatch) {
            const diff = ztItem.price_num - upItem.price_num;
            const diffPercent = upItem.price_num ? (diff / upItem.price_num) * 100 : 0;
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830

            let caseType = '';
            let differenceType = '';
            
            if (stockMismatch && priceMismatch) {
              differenceType = 'both';
<<<<<<< HEAD
              if (item1.availability === 'outofstock' && item2.availability === 'instock') {
                caseType = `Out of stock at ${site1Name} / In stock at ${site2Name}`;
              } else {
                caseType = `In stock at ${site1Name} / Out of stock at ${site2Name}`;
=======
              if (ztItem.availability === 'outofstock' && upItem.availability === 'instock') {
                caseType = 'Out of stock at ZoneTech / In stock at UltraPC';
              } else {
                caseType = 'In stock at ZoneTech / Out of stock at UltraPC';
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
              }
            } else if (priceMismatch) {
              differenceType = 'price';
              caseType = 'Différence de prix uniquement';
            } else if (stockMismatch) {
              differenceType = 'stock';
<<<<<<< HEAD
              if (item1.availability === 'outofstock' && item2.availability === 'instock') {
                caseType = `Out of stock at ${site1Name} / In stock at ${site2Name}`;
              } else {
                caseType = `In stock at ${site1Name} / Out of stock at ${site2Name}`;
=======
              if (ztItem.availability === 'outofstock' && upItem.availability === 'instock') {
                caseType = 'Out of stock at ZoneTech / In stock at UltraPC';
              } else {
                caseType = 'In stock at ZoneTech / Out of stock at UltraPC';
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
              }
            }

            important.push({
<<<<<<< HEAD
              product_name: item1.product_name || item1.nom_produit || 'N/A',
              reference: ref,
              site1_price: item1.price_num,
              site2_price: item2.price_num,
              difference: diff,
              diff_percent: diffPercent,
              site1_stock: item1.availability,
              site2_stock: item2.availability,
              case: caseType,
              difference_type: differenceType,
              site1_url: item1.url_produit || item1.url || '',
              site2_url: item2.url_produit || item2.url || '',
              site1_name: site1Name,
              site2_name: site2Name
=======
              product_name: ztItem.product_name || ztItem.nom_produit || 'N/A',
              reference: ref,
              zt_price: ztItem.price_num,
              up_price: upItem.price_num,
              difference: diff,
              diff_percent: diffPercent,
              zt_stock: ztItem.availability,
              up_stock: upItem.availability,
              case: caseType,
              difference_type: differenceType,
              zt_url: ztItem.url_produit || ztItem.url || '',
              up_url: upItem.url_produit || upItem.url || ''
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
            });
          }
        });

        if (important.length > 0) {
          comparisonResults[category] = important;
        }
      });

      setResults(comparisonResults);
      if (Object.keys(comparisonResults).length > 0) {
        setSelectedCategory(Object.keys(comparisonResults)[0]);
      } else {
        alert('Aucune différence trouvée entre les deux fichiers');
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
<<<<<<< HEAD
    const currentData = results[Object.keys(results)[0]];
    const site1Name = currentData[0]?.site1_name || 'Site1';
    const site2Name = currentData[0]?.site2_name || 'Site2';
=======
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830

    Object.entries(results).forEach(([category, data]) => {
      const exportData = data.map(item => ({
        'Product Name': item.product_name,
        'Reference': item.reference,
<<<<<<< HEAD
        [`${site1Name} Price`]: formatPrice(item.site1_price),
        [`${site2Name} Price`]: formatPrice(item.site2_price),
        'Difference': formatPrice(item.difference),
        'Diff %': item.diff_percent.toFixed(2) + '%',
        [`${site1Name} Stock`]: item.site1_stock === 'instock' ? 'In Stock' : 'Out of Stock',
        [`${site2Name} Stock`]: item.site2_stock === 'instock' ? 'In Stock' : 'Out of Stock',
        'Case': item.case,
        'Type': item.difference_type === 'both' ? 'Prix + Stock' : 
                item.difference_type === 'price' ? 'Prix seulement' : 'Stock seulement',
        [`${site1Name} URL`]: item.site1_url,
        [`${site2Name} URL`]: item.site2_url
=======
        'ZoneTech Price': formatPrice(item.zt_price),
        'UltraPC Price': formatPrice(item.up_price),
        'Difference': formatPrice(item.difference),
        'Diff %': item.diff_percent.toFixed(2) + '%',
        'ZoneTech Stock': item.zt_stock === 'instock' ? 'In Stock' : 'Out of Stock',
        'UltraPC Stock': item.up_stock === 'instock' ? 'In Stock' : 'Out of Stock',
        'Case': item.case,
        'Type': item.difference_type === 'both' ? 'Prix + Stock' : 
                item.difference_type === 'price' ? 'Prix seulement' : 'Stock seulement',
        'ZoneTech URL': item.zt_url,
        'UltraPC URL': item.up_url
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const sheetName = category.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
<<<<<<< HEAD
    XLSX.writeFile(wb, `COMPARAISON_${site1Name}_vs_${site2Name}_${timestamp}.xlsx`);
=======
    XLSX.writeFile(wb, `COMPARAISON_COMPLETE_${timestamp}.xlsx`);
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
  };

  const getFilteredData = () => {
    if (!results || !selectedCategory) return [];
    
    const categoryData = results[selectedCategory];
    
    if (filterMode === 'all') return categoryData;
    if (filterMode === 'both') return categoryData.filter(d => d.difference_type === 'both');
    if (filterMode === 'price') return categoryData.filter(d => d.difference_type === 'price');
    if (filterMode === 'stock') return categoryData.filter(d => d.difference_type === 'stock');
    
    return categoryData;
  };

  const currentData = getFilteredData();

  const getSummaryStats = () => {
    if (!currentData.length) return null;

<<<<<<< HEAD
    const site1InSite2In = currentData.filter(d => d.site1_stock === 'instock' && d.site2_stock === 'instock').length;
    const site1InSite2Out = currentData.filter(d => d.site1_stock === 'instock' && d.site2_stock === 'outofstock').length;
    const site1OutSite2In = currentData.filter(d => d.site1_stock === 'outofstock' && d.site2_stock === 'instock').length;
    const site1OutSite2Out = currentData.filter(d => d.site1_stock === 'outofstock' && d.site2_stock === 'outofstock').length;

    return { site1InSite2In, site1InSite2Out, site1OutSite2In, site1OutSite2Out };
=======
    const ztInStockUpIn = currentData.filter(d => d.zt_stock === 'instock' && d.up_stock === 'instock').length;
    const ztInStockUpOut = currentData.filter(d => d.zt_stock === 'instock' && d.up_stock === 'outofstock').length;
    const ztOutStockUpIn = currentData.filter(d => d.zt_stock === 'outofstock' && d.up_stock === 'instock').length;
    const ztOutStockUpOut = currentData.filter(d => d.zt_stock === 'outofstock' && d.up_stock === 'outofstock').length;

    return { ztInStockUpIn, ztInStockUpOut, ztOutStockUpIn, ztOutStockUpOut };
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
  };

  const getGlobalStats = () => {
    if (!results) return null;

    let totalProducts = 0;
    let totalBoth = 0;
    let totalPriceOnly = 0;
    let totalStockOnly = 0;

    Object.values(results).forEach(categoryData => {
      totalProducts += categoryData.length;
      totalBoth += categoryData.filter(d => d.difference_type === 'both').length;
      totalPriceOnly += categoryData.filter(d => d.difference_type === 'price').length;
      totalStockOnly += categoryData.filter(d => d.difference_type === 'stock').length;
    });

    return { totalProducts, totalBoth, totalPriceOnly, totalStockOnly, totalCategories: Object.keys(results).length };
  };

  const summaryStats = getSummaryStats();
  const globalStats = getGlobalStats();

<<<<<<< HEAD
  // Obtenir les noms des sites pour l'affichage
  const site1Name = currentData[0]?.site1_name || 'Site 1';
  const site2Name = currentData[0]?.site2_name || 'Site 2';
=======
  // PARTIE 1 SE TERMINE ICI
  // VOIR PARTIE 2 POUR LE RETURN ET LE JSX

// SUITE DE LA PARTIE 1
  // Ajoutez ce code après les fonctions de la Partie 1
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        
<<<<<<< HEAD
        {/* Header avec sélection du mode */}
        <div className="bg-white rounded-lg shadow-lg border-b-4 border-blue-600 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎯 Comparateur de Prix Multi-Sites
=======
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg border-b-4 border-blue-600 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🎯 Comparateur ZoneTech vs UltraPC
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
              </h1>
              <p className="text-gray-600">Analyse complète des prix et disponibilités par catégorie</p>
            </div>
            {globalStats && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{globalStats.totalCategories}</div>
                    <div className="text-gray-600">Catégories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{globalStats.totalProducts}</div>
                    <div className="text-gray-600">Produits</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="flex gap-2 justify-center text-xs">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {globalStats.totalBoth} Prix+Stock
                      </span>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                        {globalStats.totalPriceOnly} Prix
                      </span>
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        {globalStats.totalStockOnly} Stock
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
<<<<<<< HEAD

          {/* Menu de sélection du mode */}
          <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <Menu className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Mode de comparaison :
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleModeChange('zt-up')}
                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                  comparisonMode === 'zt-up'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                ZoneTech vs UltraPC
              </button>
              <button
                onClick={() => handleModeChange('zt-nl')}
                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                  comparisonMode === 'zt-nl'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                ZoneTech vs NextLevelPC
              </button>
            </div>
          </div>
        </div>

        {/* Upload Files - Affichage conditionnel selon le mode */}
        {comparisonMode === 'zt-up' && (
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
        )}

        {comparisonMode === 'zt-nl' && (
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
                  onChange={(e) => handleFileUpload(e, 'zonetech2')}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </label>
              {zonetechFile2 && (
                <div className="flex items-center text-green-600 text-sm mt-3 bg-green-50 p-2 rounded-md">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium">{zonetechFile2.name}</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
              <label className="block cursor-pointer">
                <div className="flex items-center mb-3">
                  <Upload className="w-5 h-5 mr-2 text-blue-600" />
                  <span className="text-base font-semibold text-gray-700">Fichier NextLevelPC</span>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => handleFileUpload(e, 'nextlevel')}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </label>
              {nextlevelFile && (
                <div className="flex items-center text-green-600 text-sm mt-3 bg-green-50 p-2 rounded-md">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="font-medium">{nextlevelFile.name}</span>
                </div>
              )}
            </div>
          </div>
        )}
=======
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
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={processComparison}
<<<<<<< HEAD
            disabled={
              (comparisonMode === 'zt-up' && (!zonetechFile || !ultrapcFile)) ||
              (comparisonMode === 'zt-nl' && (!zonetechFile2 || !nextlevelFile)) ||
              loading
            }
=======
            disabled={!zonetechFile || !ultrapcFile || loading}
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
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

            {/* Filter Buttons */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Filtrer par type
                  </h3>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setFilterMode('all')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      filterMode === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tout ({results[selectedCategory]?.length || 0})
                  </button>
                  <button
                    onClick={() => setFilterMode('both')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      filterMode === 'both'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Prix + Stock ({results[selectedCategory]?.filter(d => d.difference_type === 'both').length || 0})
                  </button>
                  <button
                    onClick={() => setFilterMode('price')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      filterMode === 'price'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Prix ({results[selectedCategory]?.filter(d => d.difference_type === 'price').length || 0})
                  </button>
                  <button
                    onClick={() => setFilterMode('stock')}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      filterMode === 'stock'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Stock ({results[selectedCategory]?.filter(d => d.difference_type === 'stock').length || 0})
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            {summaryStats && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                  Résumé - {selectedCategory}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-green-700 font-semibold text-sm">✓ Disponibles partout</span>
                    </div>
<<<<<<< HEAD
                    <div className="text-4xl font-bold text-green-700 mb-3">{summaryStats.site1InSite2In}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded-md font-medium">{site1Name} ✓</span>
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded-md font-medium">{site2Name} ✓</span>
=======
                    <div className="text-4xl font-bold text-green-700 mb-3">{summaryStats.ztInStockUpIn}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded-md font-medium">ZT ✓</span>
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded-md font-medium">UP ✓</span>
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
<<<<<<< HEAD
                      <span className="text-blue-700 font-semibold text-sm">Seulement {site1Name}</span>
                    </div>
                    <div className="text-4xl font-bold text-blue-700 mb-3">{summaryStats.site1InSite2Out}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-md font-medium">{site1Name} ✓</span>
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded-md font-medium">{site2Name} ✗</span>
=======
                      <span className="text-blue-700 font-semibold text-sm">Seulement ZoneTech</span>
                    </div>
                    <div className="text-4xl font-bold text-blue-700 mb-3">{summaryStats.ztInStockUpOut}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded-md font-medium">ZT ✓</span>
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded-md font-medium">UP ✗</span>
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
<<<<<<< HEAD
                      <span className="text-orange-700 font-semibold text-sm">Seulement {site2Name}</span>
                    </div>
                    <div className="text-4xl font-bold text-orange-700 mb-3">{summaryStats.site1OutSite2In}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded-md font-medium">{site1Name} ✗</span>
                      <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-md font-medium">{site2Name} ✓</span>
=======
                      <span className="text-orange-700 font-semibold text-sm">Seulement UltraPC</span>
                    </div>
                    <div className="text-4xl font-bold text-orange-700 mb-3">{summaryStats.ztOutStockUpIn}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-red-200 text-red-800 px-2 py-1 rounded-md font-medium">ZT ✗</span>
                      <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-md font-medium">UP ✓</span>
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gray-700 font-semibold text-sm">✗ Rupture partout</span>
                    </div>
<<<<<<< HEAD
                    <div className="text-4xl font-bold text-gray-700 mb-3">{summaryStats.site1OutSite2Out}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md font-medium">{site1Name} ✗</span>
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md font-medium">{site2Name} ✗</span>
=======
                    <div className="text-4xl font-bold text-gray-700 mb-3">{summaryStats.ztOutStockUpOut}</div>
                    <div className="flex gap-2 text-xs">
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md font-medium">ZT ✗</span>
                      <span className="bg-gray-200 text-gray-800 px-2 py-1 rounded-md font-medium">UP ✗</span>
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Price Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <p className="text-xs text-gray-600 mb-2 uppercase tracking-wide">Produits</p>
                <p className="text-3xl font-bold text-gray-900">{currentData.length}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-4 h-4 text-red-600 mr-1" />
<<<<<<< HEAD
                  <p className="text-xs text-gray-600 uppercase tracking-wide">{site1Name} Plus Cher</p>
=======
                  <p className="text-xs text-gray-600 uppercase tracking-wide">ZT Plus Cher</p>
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
                </div>
                <p className="text-3xl font-bold text-red-600">{currentData.filter(d => d.difference > 0).length}</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                <div className="flex items-center mb-2">
                  <TrendingDown className="w-4 h-4 text-green-600 mr-1" />
<<<<<<< HEAD
                  <p className="text-xs text-gray-600 uppercase tracking-wide">{site1Name} Moins Cher</p>
=======
                  <p className="text-xs text-gray-600 uppercase tracking-wide">ZT Moins Cher</p>
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
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
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 uppercase tracking-wide">Type</th>
<<<<<<< HEAD
                      <th className="px-4 py-3 text-right font-semibold text-gray-700 uppercase tracking-wide">{site1Name}</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700 uppercase tracking-wide">{site2Name}</th>
=======
                      <th className="px-4 py-3 text-right font-semibold text-gray-700 uppercase tracking-wide">ZoneTech</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700 uppercase tracking-wide">UltraPC</th>
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
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
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                            item.difference_type === 'both' ? 'bg-purple-100 text-purple-700' :
                            item.difference_type === 'price' ? 'bg-green-100 text-green-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {item.difference_type === 'both' ? '💰📦' : 
                             item.difference_type === 'price' ? '💰' : '📦'}
                          </span>
                        </td>
<<<<<<< HEAD
                        <td className="px-4 py-3 text-right text-gray-800 font-semibold">{formatPrice(item.site1_price)}</td>
                        <td className="px-4 py-3 text-right text-gray-800 font-semibold">{formatPrice(item.site2_price)}</td>
=======
                        <td className="px-4 py-3 text-right text-gray-800 font-semibold">{formatPrice(item.zt_price)}</td>
                        <td className="px-4 py-3 text-right text-gray-800 font-semibold">{formatPrice(item.up_price)}</td>
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
                        <td className="px-4 py-3 text-right">
                          <div className="text-right">
                            <div className={`font-bold ${
                              item.difference > 0 ? 'text-red-600' : 
                              item.difference < 0 ? 'text-green-600' : 'text-gray-600'
                            }`}>
                              {item.difference !== 0 ? (
                                <>{item.difference > 0 ? '+' : ''}{formatPrice(Math.abs(item.difference))}</>
                              ) : (
                                <span className="text-gray-400">Identique</span>
                              )}
                            </div>
                            {item.difference !== 0 && (
                              <div className="text-xs text-gray-500 font-medium">
                                {item.diff_percent > 0 ? '+' : ''}{item.diff_percent.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
<<<<<<< HEAD
                            <span className={`text-center px-2 py-1 text-xs rounded-md font-medium ${item.site1_stock === 'instock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {site1Name}: {item.site1_stock === 'instock' ? '✓' : '✗'}
                            </span>
                            <span className={`text-center px-2 py-1 text-xs rounded-md font-medium ${item.site2_stock === 'instock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {site2Name}: {item.site2_stock === 'instock' ? '✓' : '✗'}
=======
                            <span className={`text-center px-2 py-1 text-xs rounded-md font-medium ${item.zt_stock === 'instock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              ZT: {item.zt_stock === 'instock' ? '✓ Stock' : '✗ Rupture'}
                            </span>
                            <span className={`text-center px-2 py-1 text-xs rounded-md font-medium ${item.up_stock === 'instock' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              UP: {item.up_stock === 'instock' ? '✓ Stock' : '✗ Rupture'}
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
<<<<<<< HEAD
                            {item.site1_url && (
                              <a 
                                href={item.site1_url} 
=======
                            {item.zt_url && (
                              <a 
                                href={item.zt_url} 
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-semibold hover:bg-blue-200 transition-colors"
                              >
<<<<<<< HEAD
                                {site1Name === 'ZoneTech' ? 'ZT' : 'S1'} →
                              </a>
                            )}
                            {item.site2_url && (
                              <a 
                                href={item.site2_url} 
=======
                                ZT →
                              </a>
                            )}
                            {item.up_url && (
                              <a 
                                href={item.up_url} 
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-semibold hover:bg-blue-200 transition-colors"
                              >
<<<<<<< HEAD
                                {site2Name === 'UltraPC' ? 'UP' : site2Name === 'NextLevelPC' ? 'NL' : 'S2'} →
=======
                                UP →
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mt-4">
                <p className="text-yellow-800 font-medium">Aucun produit ne correspond au filtre sélectionné</p>
              </div>
            )}
          </>
        )}

        {!results && !loading && (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Prêt à comparer</h3>
<<<<<<< HEAD
            <p className="text-gray-500">
              {comparisonMode === 'zt-up' 
                ? 'Chargez vos fichiers ZoneTech et UltraPC' 
                : 'Chargez vos fichiers ZoneTech et NextLevelPC'}
            </p>
=======
            <p className="text-gray-500">Chargez vos fichiers Excel et cliquez sur "Comparer les fichiers"</p>
>>>>>>> b2e6925eec7e21566b0e35efe02751bfcdba3830
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceComparator;
