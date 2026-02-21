import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Package, Search, Filter, AlertCircle } from 'lucide-react';
import { fetchProducts, fetchUoMs } from '../../api/RequisitionsService';
import type { RequisitionLine, Product, UoM } from '../../types/requisition';

interface RequisitionProductLinesProps {
    lines: RequisitionLine[];
    onChange: (lines: RequisitionLine[]) => void;
    readonly?: boolean;
    currency?: string;
    companyId?: number;
}

const RequisitionProductLines: React.FC<RequisitionProductLinesProps> = ({ lines, onChange, readonly, currency = '৳', companyId }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [uoms, setUoms] = useState<UoM[]>([]);
    const [loading, setLoading] = useState(false);
    const [productFor, setProductFor] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [rowSearchTerm, setRowSearchTerm] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showProdResults, setShowProdResults] = useState<number | null>(null);
    const [showHeaderResults, setShowHeaderResults] = useState(false);
    const prodRef = useRef<HTMLDivElement>(null);
    const headerSearchRef = useRef<HTMLDivElement>(null);

    // Debounce search term to prevent excessive API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            const activeSearch = showHeaderResults ? searchTerm : rowSearchTerm;
            setDebouncedSearch(activeSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchTerm, rowSearchTerm, showHeaderResults]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (prodRef.current && !prodRef.current.contains(e.target as Node)) {
                setShowProdResults(null);
            }
            if (headerSearchRef.current && !headerSearchRef.current.contains(e.target as Node)) {
                setShowHeaderResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load UoMs only once on mount
    useEffect(() => {
        const loadUoMs = async () => {
            const res = await fetchUoMs();
            if (res.success && res.data) {
                setUoms(res.data);
            }
        };
        loadUoMs();
    }, []);

    // Load products when search/filters change
    useEffect(() => {
        const loadProducts = async () => {
            if (!debouncedSearch && !productFor) {
                setProducts([]);
                return;
            }
            setLoading(true);
            const res = await fetchProducts({
                searchTerm: debouncedSearch,
                productFor,
                companyId
            }, 100);
            if (res.success && res.data) {
                setProducts(res.data);
            }
            setLoading(false);
        };
        loadProducts();
    }, [companyId, productFor, debouncedSearch]);

    const addLine = () => {
        const newLine: RequisitionLine = {
            product_id: false,
            x_studio_product_description: '',
            product_uom_id: false,
            quantity: 1,
            x_studio_per_unit_price: 0,
            x_studio_estimated_price: 0,
            sequence: lines.length * 10 + 10
        };
        onChange([...lines, newLine]);
    };

    const removeLine = (index: number) => {
        const newLines = [...lines];
        newLines.splice(index, 1);
        onChange(newLines);
    };

    const updateLine = (index: number, field: keyof RequisitionLine, value: any) => {
        const newLines = [...lines];
        const line = { ...newLines[index] };

        // Handle price/qty changes
        if (field === 'quantity' || field === 'x_studio_per_unit_price') {
            const qty = parseFloat((field === 'quantity' ? value : line.quantity) as any) || 0;
            const price = parseFloat((field === 'x_studio_per_unit_price' ? value : line.x_studio_per_unit_price) as any) || 0;
            (line as any)[field] = value;
            line.x_studio_estimated_price = qty * price;
        } else {
            (line as any)[field] = value;
        }

        // Auto-fill from product selection
        if (field === 'product_id' && value) {
            const productId = typeof value === 'number' ? value : (Array.isArray(value) ? value[0] : null);
            if (productId) {
                const product = products.find(p => p.id === productId);
                if (product) {
                    line.x_studio_product_description = product.name;
                    line.product_uom_id = product.uom_id || false;
                    line.x_studio_per_unit_price = product.list_price || product.standard_price || 0;
                    line.x_studio_estimated_price = (parseFloat(line.quantity as any) || 1) * (line.x_studio_per_unit_price || 0);
                }
            }
        }

        newLines[index] = line;
        onChange(newLines);
    };

    const totalAmount = lines.reduce((sum, line) => sum + (parseFloat(line.x_studio_estimated_price as any) || 0), 0);

    return (
        <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={20} color="var(--primary)" />
                    </div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>SERVICE & PRODUCTS</h3>
                </div>

                {!readonly && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        {/* Header Search Bar */}
                        <div style={{ position: 'relative' }} ref={headerSearchRef}>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,254,255,0.05)', borderRadius: '10px', border: '1px solid var(--border-glass)', padding: '2px 8px', width: '240px' }}>
                                <Search size={16} style={{ opacity: 0.5, marginRight: '8px' }} />
                                <input
                                    type="text"
                                    placeholder="Quick Search Products..."
                                    className="input-transparent"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setShowHeaderResults(true);
                                        setShowProdResults(null);
                                    }}
                                    onFocus={() => {
                                        setShowHeaderResults(true);
                                        setShowProdResults(null);
                                    }}
                                    style={{ flex: 1, padding: '6px 0', fontSize: '0.8rem', background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none' }}
                                />
                                {searchTerm && (
                                    <button onClick={() => { setSearchTerm(''); setShowHeaderResults(false); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}>×</button>
                                )}
                            </div>

                            {showHeaderResults && (searchTerm.length > 0 || productFor) && (
                                <div className="non-glass-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, maxHeight: '300px', overflowY: 'auto', marginTop: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)', border: '1px solid var(--border-glass)' }}>
                                    {loading ? (
                                        <div style={{ padding: '20px', textAlign: 'center' }}><div className="spinner-small" style={{ margin: '0 auto 10px' }}></div><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Searching Inventory...</span></div>
                                    ) : products.length > 0 ? (
                                        products.map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    const price = p.list_price || p.standard_price || 0;
                                                    const newLine: RequisitionLine = {
                                                        product_id: [p.id, p.name],
                                                        x_studio_product_description: p.name,
                                                        product_uom_id: (Array.isArray(p.uom_id) ? p.uom_id[0] : (p.uom_id || false)) as any,
                                                        quantity: 1,
                                                        x_studio_per_unit_price: price,
                                                        x_studio_estimated_price: price
                                                    };
                                                    onChange([...lines, newLine]);
                                                    setSearchTerm('');
                                                    setShowHeaderResults(false);
                                                }}
                                                className="dropdown-item"
                                                style={{ padding: '10px 15px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                                            >
                                                <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)' }}>{p.display_name || p.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                                                    <span>SKU: {p.default_code || 'N/A'}</span>
                                                    <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{currency} {(p.list_price || 0).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                                            <AlertCircle size={20} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No products found</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Product For Filter */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', border: '1px solid var(--border-glass)', padding: '2px 10px' }}>
                            <Filter size={14} color="var(--primary)" />
                            <select
                                className="input-transparent"
                                value={productFor}
                                onChange={(e) => setProductFor(e.target.value)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '6px 0', fontSize: '0.8rem', outline: 'none', cursor: 'pointer', minWidth: '120px' }}
                            >
                                <option value="">Product For...</option>
                                <option value="Procurement">Procurement</option>
                                <option value="IT">IT</option>
                                <option value="ADMIN">ADMIN</option>
                                <option value="SAC">SAC</option>
                                <option value="CWD">CWD</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={addLine}
                            className="btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.75rem', fontWeight: 900, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            <Plus size={16} /> ADD ITEM
                        </button>
                    </div>
                )}
            </div>

            <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.2)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '950px' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                            <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>PRODUCT / SERVICE</th>
                            <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase' }}>DESCRIPTION</th>
                            <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', width: '90px' }}>QTY</th>
                            <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', width: '140px' }}>UNIT</th>
                            <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', width: '150px' }}>PRICE / UNIT</th>
                            <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', width: '150px' }}>TOTAL ({currency})</th>
                            {!readonly && <th style={{ padding: '14px 16px', textAlign: 'center', width: '60px' }}></th>}
                        </tr>
                    </thead>
                    <tbody style={{ fontSize: '0.85rem' }}>
                        {lines.length === 0 ? (
                            <tr>
                                <td colSpan={readonly ? 6 : 7} style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
                                        <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                                            <Package size={32} />
                                        </div>
                                        <span style={{ fontWeight: 600 }}>No items added to this requisition.</span>
                                        {!readonly && <button className="btn-secondary" onClick={addLine} style={{ fontSize: '0.75rem', marginTop: '10px' }}>Click "ADD ITEM" to start</button>}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            lines.map((line, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid var(--border-glass)', background: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }} className="table-row-hover">
                                    <td style={{ padding: '10px 16px', position: 'relative' }}>
                                        {readonly ? (
                                            <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{Array.isArray(line.product_id) ? line.product_id[1] : '--'}</span>
                                        ) : (
                                            <div style={{ position: 'relative' }} ref={showProdResults === index ? prodRef : null}>
                                                <input
                                                    type="text"
                                                    className="input-field"
                                                    placeholder="Search products..."
                                                    value={showProdResults === index ? rowSearchTerm : (Array.isArray(line.product_id) ? line.product_id[1] : '')}
                                                    onChange={(e) => {
                                                        setRowSearchTerm(e.target.value);
                                                        setShowProdResults(index);
                                                        setShowHeaderResults(false);
                                                    }}
                                                    onFocus={() => {
                                                        setRowSearchTerm(Array.isArray(line.product_id) ? line.product_id[1] : '');
                                                        setShowProdResults(index);
                                                        setShowHeaderResults(false);
                                                    }}
                                                    style={{ width: '100%', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 700 }}
                                                />
                                                {showProdResults === index && (rowSearchTerm || productFor) && (
                                                    <div className="non-glass-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, maxHeight: '200px', overflowY: 'auto', marginTop: '6px' }}>
                                                        {loading ? (
                                                            <div style={{ padding: '15px', textAlign: 'center' }}><div className="spinner-small" style={{ margin: '0 auto' }}></div></div>
                                                        ) : products.length > 0 ? (
                                                            products.map(p => (
                                                                <div key={p.id} onClick={() => { updateLine(index, 'product_id', [p.id, p.name]); setShowProdResults(null); setRowSearchTerm(''); }} className="dropdown-item" style={{ padding: '10px 12px' }}>
                                                                    <div style={{ fontWeight: 800, fontSize: '0.8rem' }}>{p.display_name || p.name}</div>
                                                                    <div style={{ fontSize: '0.65rem', opacity: 0.6, display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                                                                        <span>SKU: {p.default_code || 'N/A'}</span>
                                                                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{currency} {p.list_price || 0}</span>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div style={{ padding: '10px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>No matches</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px 16px' }}>
                                        {readonly ? (
                                            <span style={{ color: 'var(--text-muted)' }}>{line.x_studio_product_description || '--'}</span>
                                        ) : (
                                            <input
                                                type="text"
                                                className="input-field"
                                                value={line.x_studio_product_description || ''}
                                                onChange={(e) => updateLine(index, 'x_studio_product_description', e.target.value)}
                                                style={{ width: '100%', padding: '6px 12px' }}
                                                placeholder="Enter details..."
                                            />
                                        )}
                                    </td>
                                    <td style={{ padding: '10px 16px' }}>
                                        {readonly ? (
                                            <span style={{ textAlign: 'right', display: 'block', fontWeight: 700 }}>{line.quantity}</span>
                                        ) : (
                                            <input
                                                type="number"
                                                className="input-field"
                                                value={line.quantity || ''}
                                                onChange={(e) => updateLine(index, 'quantity', e.target.value)}
                                                style={{ width: '100%', padding: '6px 12px', textAlign: 'right', fontWeight: 700 }}
                                            />
                                        )}
                                    </td>
                                    <td style={{ padding: '10px 16px' }}>
                                        {readonly ? (
                                            <span>{Array.isArray(line.product_uom_id) ? line.product_uom_id[1] : '--'}</span>
                                        ) : (
                                            <select
                                                className="input-field"
                                                value={Array.isArray(line.product_uom_id) ? line.product_uom_id[0] : (line.product_uom_id || '')}
                                                onChange={(e) => {
                                                    const selectedId = parseInt(e.target.value);
                                                    const selectedUom = uoms.find(u => u.id === selectedId);
                                                    updateLine(index, 'product_uom_id', selectedUom ? [selectedUom.id, selectedUom.display_name || selectedUom.name] : selectedId);
                                                }}
                                                style={{ width: '100%', padding: '6px 12px', background: 'var(--bg-glass)' }}
                                            >
                                                {!line.product_uom_id && <option value="">Unit...</option>}
                                                {Array.isArray(line.product_uom_id) && !uoms.find(u => u.id === (line.product_uom_id as any)[0]) && (
                                                    <option value={(line.product_uom_id as any)[0]}>{(line.product_uom_id as any)[1]}</option>
                                                )}
                                                {uoms.map(u => <option key={u.id} value={u.id}>{u.display_name || u.name}</option>)}
                                            </select>
                                        )}
                                    </td>
                                    <td style={{ padding: '10px 16px' }}>
                                        {readonly ? (
                                            <span style={{ textAlign: 'right', display: 'block', fontWeight: 800, color: 'var(--text-main)' }}>
                                                {currency} {(line.x_studio_per_unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </span>
                                        ) : (
                                            <input
                                                type="number"
                                                className="input-field"
                                                value={line.x_studio_per_unit_price || ''}
                                                onChange={(e) => updateLine(index, 'x_studio_per_unit_price', e.target.value)}
                                                style={{ width: '100%', padding: '6px 12px', textAlign: 'right', fontWeight: 800, color: 'var(--primary)' }}
                                            />
                                        )}
                                    </td>
                                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                                        <span style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '0.95rem' }}>
                                            {currency} {(parseFloat(line.x_studio_estimated_price as any) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    {!readonly && (
                                        <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                                            <button type="button" onClick={() => removeLine(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', transition: 'all 0.2s', padding: '4px' }} className="btn-icon">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                        <tr style={{ background: 'rgba(var(--primary-rgb), 0.05)', fontWeight: 900 }}>
                            <td colSpan={5} style={{ padding: '16px 20px', textAlign: 'right', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                                Subtotal Estimated:
                            </td>
                            <td style={{ padding: '16px 20px', textAlign: 'right', fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 950 }}>
                                {currency} {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            {!readonly && <td style={{ padding: '16px' }}></td>}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RequisitionProductLines;
