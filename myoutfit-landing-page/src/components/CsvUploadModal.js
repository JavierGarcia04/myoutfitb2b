import React, { useState, useRef } from 'react';
import styles from '@/styles/Dashboard.module.scss';
import { supabase } from '@/lib/supabase';
import { FiX, FiUpload, FiFile, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useLanguage } from '@/context/LanguageContext';
import { dashboardTranslations } from '@/translations/dashboardTranslations';

// Parsea CSV manejando comillas y comas dentro de campos
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return { headers: [], rows: [] };

  const parseLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/\s/g, '_'));
  const rows = lines.slice(1).map((line) => {
    const values = parseLine(line);
    return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || '' }), {});
  });

  return { headers, rows };
}

// Extrae la categoría principal de "Apparel & Accessories > Clothing > T-Shirts" -> "T-Shirts"
function extractCategory(productCategory) {
  const cat = (productCategory || '').toString().trim();
  if (!cat) return null;
  const parts = cat.split('>').map((p) => p.trim());
  return parts[parts.length - 1] || cat;
}

// Mapea fila CSV a objeto producto para Supabase (formato Shopify export)
function csvRowToProduct(row, storeId) {
  const id = (
    row.handle ||
    row.variant_sku ||
    row.id ||
    row.external_id ||
    ''
  )
    .toString()
    .trim();
  const name = (row.title || row.name || row.product_name || '').toString().trim();
  const price =
    parseFloat(row.variant_price || row.price || row.precio || 0) || null;
  const invQty = parseInt(row.variant_inventory_qty || row.stock_quantity || '', 10);
  const stockQty = Number.isNaN(invQty) ? 0 : Math.max(0, invQty);

  const productCategory = row.product_category || row.category || row.categoria || '';
  const category = extractCategory(productCategory);
  const type = (row.type || row.subcategory || row.subcategoria || '').toString().trim() || null;

  return {
    store_id: storeId,
    external_id: id || `csv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: name || 'Sin nombre',
    description: (
      row.body_html ||
      row['body_(html)'] ||
      row.body ||
      row.description ||
      row.descripcion ||
      ''
    )
      .toString()
      .replace(/<[^>]*>/g, '')
      .trim() || null,
    category,
    subcategory: type,
    price,
    image_url: (
      row.image_src ||
      row.image_url ||
      row.imageurl ||
      row.imagen ||
      row.image ||
      ''
    )
      .toString()
      .trim() || null,
    product_url: (row.product_url || row.url || row.link || '').toString().trim() || null,
    color: (row.option1_value || row.color || row.colour || '').toString().trim() || null,
    style: (row.style || row.estilo || '').toString().trim() || null,
    season: (row.season || row.temporada || '').toString().trim() || null,
    stock_quantity: stockQty,
    currency: 'EUR',
    is_active: String(row.status || 'active').toLowerCase() !== 'draft',
  };
}

// Formato Shopify: Handle, Title, Variant Price, Product Category, Image Src
const REQUIRED_HEADERS = [
  ['handle', 'variant_sku', 'id', 'external_id', 'sku'],
  ['title', 'name', 'product_name'],
  ['variant_price', 'price', 'precio'],
  ['product_category', 'category', 'categoria'],
  ['image_src', 'image_url', 'imageurl', 'imagen', 'image'],
];
const EXAMPLE_CSV = `Handle,Title,Body (HTML),Vendor,Product Category,Type,Variant SKU,Variant Inventory Qty,Variant Price,Image Src,Status
camiseta-azul,Camiseta azul,"",Mi Tienda,Apparel & Accessories > Clothing > T-Shirts,T-Shirts,,10,20.00,https://ejemplo.com/camisa.webp,active
pantalon-vaquero,Pantalón Vaquero Azul,"",Mi Tienda,Apparel & Accessories > Clothing > Jeans,Jeans,,5,25.00,https://ejemplo.com/pantalon.png,active
sudadera-blanca,Sudadera Blanca,"",Mi Tienda,Apparel & Accessories > Activewear > Hoodies,Hoodies,,3,45.00,https://ejemplo.com/sudadera.png,active`;

export default function CsvUploadModal({ isOpen, onClose, store, onSuccess }) {
  const { language } = useLanguage();
  const t = dashboardTranslations[language] || dashboardTranslations.en;
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setError('');
    setResult(null);
    setPreview(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    setError('');
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setError(t.csvFileError);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result || '';
        const { headers, rows } = parseCSV(text);

        const hasRequired = REQUIRED_HEADERS.every((group) =>
          group.some((h) => headers.includes(h))
        );
        if (!hasRequired) {
          setError(
            `El CSV debe incluir: Handle, Title, Variant Price, Product Category, Image Src (formato Shopify). Encontradas: ${headers.join(', ')}`
          );
          setPreview(null);
        } else if (rows.length === 0) {
          setError('El archivo no contiene filas de datos.');
          setPreview(null);
        } else {
          setPreview({ headers, rows, total: rows.length });
          setError('');
        }
      } catch (err) {
        setError('Error al leer el archivo CSV: ' + err.message);
        setPreview(null);
      } finally {
        setParsing(false);
      }
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };

  const handleUpload = async () => {
    if (!store?.id || !preview?.rows?.length) return;

    setUploading(true);
    setError('');

    try {
      const products = preview.rows
        .map((row) => csvRowToProduct(row, store.id))
        .filter((p) => p.name && p.external_id);

      if (products.length === 0) {
        setError('No se encontraron productos válidos en el CSV.');
        setUploading(false);
        return;
      }

      const maxProducts = store.max_products || 500;
      const currentCount = store.catalog_size || 0;
      const afterCount = currentCount + products.length;

      // Comprobar límite (considerando upsert, algunos pueden actualizarse)
      const { data: existingProducts } = await supabase
        .from('products')
        .select('external_id')
        .eq('store_id', store.id)
        .eq('is_active', true);

      const existingIds = new Set((existingProducts || []).map((p) => p.external_id));
      const newProducts = products.filter((p) => !existingIds.has(p.external_id));
      const updatedCount = products.length - newProducts.length;
      const finalCount = existingIds.size + newProducts.length;

      if (finalCount > maxProducts) {
        setError(
          `Límite de tu plan: ${maxProducts} productos. Actualmente ${currentCount}. El CSV añadiría ${newProducts.length} nuevos. Reduce el archivo o actualiza tu plan.`
        );
        setUploading(false);
        return;
      }

      const { error: insertError } = await supabase.from('products').upsert(products, {
        onConflict: 'store_id,external_id',
        ignoreDuplicates: false,
      });

      if (insertError) throw insertError;

      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)
        .eq('is_active', true);

      await supabase
        .from('stores')
        .update({
          catalog_size: productCount ?? finalCount,
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', store.id);

      setResult({
        total: products.length,
        added: newProducts.length,
        updated: updatedCount,
      });
      onSuccess?.();
    } catch (err) {
      console.error('CSV upload error:', err);
      setError(err.message || 'Error al importar productos. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div
        className={styles.modalContent}
        style={{ maxWidth: '560px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>
            <FiUpload className="me-2" />
            {t.importFromCsv}
          </h3>
          <button className={styles.closeButton} onClick={handleClose} title={t.close}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          {!result ? (
            <>
              <p className="text-muted mb-3">
                {t.csvUploadDesc}
              </p>

              <div className="mb-3">
                <label className="form-label">{t.csvFile}</label>
                <div className="input-group">
                  <span className="input-group-text bg-light">
                    <FiFile />
                  </span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="form-control"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {parsing && (
                <div className="alert alert-info py-2">
                  <span className="spinner-border spinner-border-sm me-2" />
                  {t.readingFile}
                </div>
              )}

              {preview && !parsing && (
                <div className="alert alert-success py-2 mb-3">
                  <FiCheckCircle className="me-2" />
                  {preview.total} {t.productsDetected}
                </div>
              )}

              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  <FiAlertCircle className="me-2" />
                  {error}
                </div>
              )}

              <details className="mb-3">
                <summary className="text-muted" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>
                  {t.viewExampleFormat}
                </summary>
                <pre
                  className="bg-light p-3 rounded mt-2"
                  style={{ fontSize: '0.75rem', overflow: 'auto', maxHeight: '150px' }}
                >
                  {EXAMPLE_CSV}
                </pre>
              </details>
            </>
          ) : (
            <div className="text-center py-3">
              <FiCheckCircle size={48} className="text-success mb-3" />
              <h5>{t.importCompleted}</h5>
              <p className="text-muted mb-0">
                {result.added} {t.newProducts}, {result.updated} {t.updated}. {t.totalProcessed} {result.total}.
              </p>
            </div>
          )}
        </div>

        {!result && (
          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-outline-secondary" onClick={handleClose}>
              {t.cancel}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!preview || uploading}
              onClick={handleUpload}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  {t.importing}
                </>
              ) : (
                <>
                  <FiUpload className="me-2" />
                  {t.importProducts} {preview?.total || 0} {t.productsLabel}
                </>
              )}
            </button>
          </div>
        )}

        {result && (
          <div className={styles.modalFooter}>
            <button type="button" className="btn btn-primary" onClick={handleClose}>
              {t.close}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
