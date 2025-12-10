'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, Layout, Image as ImageIcon, Tag, Percent, Monitor, Type, Smartphone, Monitor as MonitorIcon, Eye, EyeOff } from 'lucide-react';
import ImagePicker from '@/components/admin/ImagePicker';
import { toast } from 'sonner';

// --- CONFIGURATION SCHEMAS ---
const SECTION_TYPES = [
    { id: 'hero_slider', label: 'Hero Slider', icon: Monitor },
    { id: 'features_grid', label: 'Beneficios (Grid)', icon: Tag },
    { id: 'flash_sale', label: 'Flash Sale (Oferta)', icon: Percent },
    { id: 'product_grid', label: 'Grilla Productos', icon: Layout },
    { id: 'banner', label: 'Banner Campaña', icon: ImageIcon },
    // { id: 'rich_text', label: 'Texto / About', icon: Type }
];

export default function AdminContentPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sections, setSections] = useState([]);
    const [products, setProducts] = useState([]);

    // Preview States
    const [previewMode, setPreviewMode] = useState('desktop'); // desktop | mobile
    const [showPreview, setShowPreview] = useState(true);

    useEffect(() => {
        fetchContent();
        fetchProducts();
    }, []);

    const fetchContent = async () => {
        try {
            const res = await fetch('/api/content/home');
            if (res.ok) {
                const data = await res.json();

                // If sections exist, use them. If not, try to migrate legacy data to sections structure on the fly
                if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
                    setSections(data.sections);
                } else {
                    // MIGRATION / DEFAULT STATE
                    const initialSections = [];
                    if (data.heroSlider?.length) initialSections.push({ id: 'hero-' + Date.now(), type: 'hero_slider', data: { slides: data.heroSlider } });
                    if (data.promoGrid?.length) initialSections.push({ id: 'feat-' + Date.now(), type: 'features_grid', data: { items: data.promoGrid } });
                    if (data.flashDeal?.enabled) initialSections.push({ id: 'flash-' + Date.now(), type: 'flash_sale', data: data.flashDeal });
                    // Default Product Grid
                    initialSections.push({ id: 'prod-' + Date.now(), type: 'product_grid', data: { title: 'Los Elegidos 🔥', subtitle: 'Favoritos de la comunidad', count: 8, filter: 'featured' } });
                    if (data.campaign?.bannerImage) initialSections.push({ id: 'camp-' + Date.now(), type: 'banner', data: { image: data.campaign.bannerImage, title: data.campaign.title, link: data.campaign.link, buttonText: 'Ver Campaña' } });

                    setSections(initialSections);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Error cargando contenido");
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/admin/products');
            if (res.ok) setProducts(await res.json());
        } catch (e) {
            console.error("Failed to load products");
        }
    };

    // --- ACTIONS ---

    const addSection = (type) => {
        const newSection = {
            id: Date.now().toString(),
            type: type,
            data: getDefaultDataForType(type)
        };
        setSections([...sections, newSection]);
        toast.success(`Sección agregada`);

        // Auto scroll to bottom
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    };

    const removeSection = (id) => {
        if (confirm('¿Estás seguro de eliminar esta sección?')) {
            setSections(sections.filter(s => s.id !== id));
        }
    };

    const moveSection = (index, direction) => {
        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newSections.length) {
            [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
            setSections(newSections);
        }
    };

    const updateSectionData = (sectionId, newData) => {
        setSections(sections.map(s => s.id === sectionId ? { ...s, data: { ...s.data, ...newData } } : s));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/content/home', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sections })
            });
            if (res.ok) toast.success('Home actualizado correctamente');
            else toast.error('Error al guardar');
        } catch (error) {
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando constructor...</div>;

    return (
        <div className="pb-10">
            {/* TOP BAR */}
            <div className="flex justify-between items-center mb-6  top-0 py-4 z-30 px-6">
                <div>
                    <h1 className="text-2xl font-bold text-stone-800">Editor de Home</h1>
                    <p className="text-xs text-stone-500 hidden md:block">Arrastra y configura las secciones de tu página.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex bg-stone-200 rounded-lg p-1">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={`p-2 rounded ${!showPreview ? 'bg-white shadow' : 'text-stone-500'}`}
                            title="Ocultar Vista Previa"
                        >
                            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {showPreview && (
                        <div className="hidden md:flex bg-stone-200 rounded-lg p-1">
                            <button
                                onClick={() => setPreviewMode('desktop')}
                                className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-white shadow text-[#8B5A2B]' : 'text-stone-500 hover:text-stone-700'}`}
                            >
                                <MonitorIcon size={18} />
                            </button>
                            <button
                                onClick={() => setPreviewMode('mobile')}
                                className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-white shadow text-[#8B5A2B]' : 'text-stone-500 hover:text-stone-700'}`}
                            >
                                <Smartphone size={18} />
                            </button>
                        </div>
                    )}
                    <Button onClick={handleSubmit} disabled={saving} className="flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                        <Save size={18} /> {saving ? 'Guardando...' : 'Publicar'}
                    </Button>
                </div>
            </div>

            <div className="px-6">
                <div className={`grid grid-cols-1 ${showPreview ? 'lg:grid-cols-12' : ''} gap-8`}>

                    {/* LEFT COLUMN: EDITOR */}
                    <div className={`${showPreview ? 'lg:col-span-5' : 'lg:col-span-8 lg:col-start-3'} space-y-6 transition-all duration-300`}>
                        {sections.map((section, index) => (
                            <SectionEditor
                                key={section.id}
                                section={section}
                                index={index}
                                total={sections.length}
                                onMove={moveSection}
                                onRemove={removeSection}
                                onChange={(data) => updateSectionData(section.id, data)}
                                products={products}
                            />
                        ))}

                        {sections.length === 0 && (
                            <div className="text-center py-16 border-2 border-dashed border-stone-300 rounded-xl text-stone-400 bg-stone-50">
                                <Monitor size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Tu página está vacía.</p>
                                <p className="text-sm">Agrega tu primera sección usando la barra inferior.</p>
                            </div>
                        )}

                        {/* ADD SECTION BAR (Inline for clearer UX flow) */}
                        <div className="pt-4 pb-20">
                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 text-center">Agregar Nueva Sección</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {SECTION_TYPES.map(type => (
                                    <button
                                        key={type.id}
                                        onClick={() => addSection(type.id)}
                                        className="flex flex-col items-center justify-center gap-2 p-4 bg-white hover:bg-stone-50 rounded-xl border border-stone-200 hover:border-[#8B5A2B] hover:text-[#8B5A2B] transition-all shadow-sm hover:shadow-md group"
                                    >
                                        <div className="p-2 bg-stone-100 rounded-full group-hover:bg-[#8B5A2B]/10 transition-colors">
                                            <type.icon size={20} />
                                        </div>
                                        <span className="text-xs font-bold">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PREVIEW */}
                    {showPreview && (
                        <div className="hidden lg:flex lg:col-span-7 sticky top-24 pl-4 items-center justify-center h-auto">
                            <div
                                className={`bg-stone-900 p-4 shadow-2xl border-4 border-stone-800 overflow-hidden relative flex flex-col items-center justify-center transition-all duration-500 ${previewMode === 'mobile'
                                    ? 'w-[360px] aspect-[9/19] rounded-[3rem]' // Mobile: width-based, vertical
                                    : 'w-full aspect-video rounded-[1.5rem]' // Desktop: width-based, 16:9
                                    }`}
                            >
                                {/* Camera Notch (Mobile Only) */}
                                {previewMode === 'mobile' && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-stone-800 rounded-b-xl z-20 flex items-center justify-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-stone-600"></div>
                                        <div className="w-12 h-1 rounded-full bg-stone-700"></div>
                                    </div>
                                )}

                                {/* Screen Content */}
                                <div className={`bg-white overflow-hidden h-full w-full relative ${previewMode === 'mobile' ? 'rounded-[2rem]' : 'rounded-lg'}`}>
                                    <div
                                        className={`origin-top-left transition-all duration-300 ${previewMode === 'desktop'
                                            ? 'scale-[0.65] w-[153.8%] h-[153.8%]'
                                            : 'w-full h-full'
                                            }`}
                                    >
                                        <PreviewFrame sections={sections} products={products} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENT: Preview Frame ---
function PreviewFrame({ sections, products }) {
    const iframeRef = React.useRef(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            if (e.data.type === 'PREVIEW_READY') setReady(true);
        };
        window.addEventListener('message', handler);
        return () => window.removeEventListener('message', handler);
    }, []);

    // Send data whenever it changes
    useEffect(() => {
        if (ready && iframeRef.current) {
            iframeRef.current.contentWindow.postMessage({
                type: 'UPDATE_PREVIEW',
                payload: { sections, products }
            }, '*');
        }
    }, [sections, products, ready]);

    // Also send immediately on load if ready (in case of re-renders)
    const handleLoad = () => {
        setReady(true);
    };

    return (
        <iframe
            ref={iframeRef}
            src="/admin/preview"
            className="w-full h-full border-0"
            title="Live Preview"
            onLoad={handleLoad}
        />
    );
}

// --- HELPER: Default Data ---
function getDefaultDataForType(type) {
    switch (type) {
        case 'hero_slider': return { slides: [{ id: Date.now(), title: 'NUEVA COLECCIÓN', subtitle: 'Descubrila ahora', image: '', ctaText: 'Ver Productos', link: '/shop' }] };
        case 'features_grid': return { items: [{ title: 'Envío Gratis', subtitle: 'En todo el país', icon: 'Truck' }, { title: 'Pago Seguro', subtitle: 'MercadoPago', icon: 'ShieldCheck' }] };
        case 'flash_sale': return { enabled: true, endTime: '', productIds: [] };
        case 'product_grid': return { title: 'Productos Destacados', subtitle: '', count: 4, filter: 'latest' };
        case 'banner': return { image: '', title: 'Campaña Especial', link: '/shop', buttonText: 'Ver Más' };
        case 'rich_text': return { content: '' };
        default: return {};
    }
}

// --- HELPER: Labeled Input ---
const Field = ({ label, children, className = "" }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="block text-xs font-bold text-stone-600 uppercase tracking-wide">{label}</label>
        {children}
    </div>
);

// --- SUB-COMPONENT: Section Editor ---
function SectionEditor({ section, index, total, onMove, onRemove, onChange, products }) {
    const typeInfo = SECTION_TYPES.find(t => t.id === section.type) || { label: section.type, icon: Layout };
    const [isOpen, setIsOpen] = useState(false); // Collapsible

    // Auto-open new sections might be nice, but keeping it simpler for now

    return (
        <div className={`bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${isOpen ? 'border-[#8B5A2B] ring-1 ring-[#8B5A2B]/20 shadow-md' : 'border-stone-200 hover:border-stone-300'}`}>
            {/* Header */}
            <div
                className={`p-4 flex justify-between items-center cursor-pointer select-none ${isOpen ? 'bg-stone-50 border-b border-stone-100' : 'bg-white'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-[#8B5A2B] text-white' : 'bg-stone-100 text-stone-500'}`}>
                        <typeInfo.icon size={20} />
                    </div>
                    <div>
                        <h3 className={`font-bold text-sm ${isOpen ? 'text-[#8B5A2B]' : 'text-stone-700'}`}>{typeInfo.label}</h3>
                        <p className="text-[10px] text-stone-400">Sección {index + 1}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onMove(index, 'up')} disabled={index === 0} className="p-1.5 text-stone-400 hover:text-stone-800 disabled:opacity-30 hover:bg-stone-100 rounded active:scale-95 transition-all"><ArrowUp size={16} /></button>
                    <button onClick={() => onMove(index, 'down')} disabled={index === total - 1} className="p-1.5 text-stone-400 hover:text-stone-800 disabled:opacity-30 hover:bg-stone-100 rounded active:scale-95 transition-all"><ArrowDown size={16} /></button>
                    <div className="w-px h-4 bg-stone-200 mx-1"></div>
                    <button onClick={() => onRemove(section.id)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded active:scale-95 transition-all"><Trash2 size={16} /></button>
                </div>
            </div>

            {/* Body */}
            {isOpen && (
                <div className="p-6 bg-white animate-in slide-in-from-top-2 duration-200">
                    {section.type === 'hero_slider' && <HeroEditor data={section.data} onChange={onChange} />}
                    {section.type === 'features_grid' && <FeaturesEditor data={section.data} onChange={onChange} />}
                    {section.type === 'flash_sale' && <FlashSaleEditor data={section.data} onChange={onChange} products={products} />}
                    {section.type === 'product_grid' && <ProductGridEditor data={section.data} onChange={onChange} />}
                    {section.type === 'banner' && <BannerEditor data={section.data} onChange={onChange} />}
                </div>
            )}
        </div>
    );
}

// --- REFACTORED INDIVIDUAL EDITORS W/ LABELS ---

function HeroEditor({ data, onChange }) {
    const slides = data.slides || [];
    const addSlide = () => onChange({ slides: [...slides, { id: Date.now(), title: '', subtitle: '', image: '', ctaText: '', link: '' }] });
    const updateSlide = (idx, field, val) => {
        const newSlides = [...slides];
        newSlides[idx][field] = val;
        onChange({ slides: newSlides });
    };
    const removeSlide = (idx) => onChange({ slides: slides.filter((_, i) => i !== idx) });

    return (
        <div className="space-y-6">
            {slides.map((slide, idx) => (
                <div key={idx} className="border border-stone-200 p-4 rounded-xl bg-stone-50/50 relative group">
                    <button onClick={() => removeSlide(idx)} className="absolute top-2 right-2 text-stone-400 hover:text-red-500 p-1 bg-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                    <div className="grid md:grid-cols-12 gap-6">
                        <div className="md:col-span-4">
                            <Field label="Imagen de Fondo">
                                <ImagePicker currentImage={slide.image} onSelect={(url) => updateSlide(idx, 'image', url)} />
                            </Field>
                        </div>
                        <div className="md:col-span-8 space-y-4">
                            <Field label="Título Principal">
                                <input type="text" placeholder="Ej: Nueva Colección" value={slide.title} onChange={(e) => updateSlide(idx, 'title', e.target.value)} className="w-full p-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] outline-none transition-all" />
                            </Field>
                            <Field label="Subtítulo">
                                <input type="text" placeholder="Ej: Descubrí lo nuevo de Mateté" value={slide.subtitle} onChange={(e) => updateSlide(idx, 'subtitle', e.target.value)} className="w-full p-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] outline-none transition-all" />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Texto Botón">
                                    <input type="text" placeholder="Ej: Ver más" value={slide.ctaText} onChange={(e) => updateSlide(idx, 'ctaText', e.target.value)} className="w-full p-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] outline-none transition-all" />
                                </Field>
                                <Field label="Enlace Destino">
                                    <input type="text" placeholder="Ej: /shop" value={slide.link} onChange={(e) => updateSlide(idx, 'link', e.target.value)} className="w-full p-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] outline-none transition-all" />
                                </Field>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            <Button size="sm" variant="outline" onClick={addSlide} className="w-full border-dashed border-2 hover:border-[#8B5A2B] hover:text-[#8B5A2B]"><Plus size={16} className="mr-2" /> Agregar Slide</Button>
        </div>
    );
}

function FeaturesEditor({ data, onChange }) {
    const items = data.items || [];
    const addItem = () => onChange({ items: [...items, { title: 'Nuevo', subtitle: '', icon: 'Star' }] });
    const updateItem = (idx, field, val) => {
        const newItems = [...items];
        newItems[idx][field] = val;
        onChange({ items: newItems });
    };

    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                {items.map((item, idx) => (
                    <div key={idx} className="border border-stone-200 p-4 rounded-xl bg-white relative hover:shadow-sm transition-shadow">
                        <button onClick={() => onChange({ items: items.filter((_, i) => i !== idx) })} className="absolute top-2 right-2 text-stone-300 hover:text-red-400"><Trash2 size={14} /></button>
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="w-1/3">
                                    <Field label="Icono">
                                        <select value={item.icon} onChange={(e) => updateItem(idx, 'icon', e.target.value)} className="w-full p-2 border border-stone-300 rounded-lg text-sm outline-none cursor-pointer bg-white">
                                            <option value="ShieldCheck">Escudo</option>
                                            <option value="Truck">Camión</option>
                                            <option value="CreditCard">Tarjeta</option>
                                            <option value="Star">Estrella</option>
                                            <option value="Gift">Regalo</option>
                                            <option value="Coffee">Mate</option>
                                        </select>
                                    </Field>
                                </div>
                                <div className="w-2/3">
                                    <Field label="Título">
                                        <input type="text" value={item.title} onChange={(e) => updateItem(idx, 'title', e.target.value)} className="w-full p-2 border border-stone-300 rounded-lg text-sm font-bold outline-none focus:border-[#8B5A2B]" />
                                    </Field>
                                </div>
                            </div>
                            <Field label="Descripción Corta">
                                <input type="text" value={item.subtitle} onChange={(e) => updateItem(idx, 'subtitle', e.target.value)} className="w-full p-2 border border-stone-300 rounded-lg text-sm outline-none focus:border-[#8B5A2B]" />
                            </Field>
                        </div>
                    </div>
                ))}
            </div>
            <Button size="sm" variant="outline" onClick={addItem} className="w-full border-dashed"><Plus size={16} className="mr-2" /> Agregar Beneficio</Button>
        </div>
    );
}

function FlashSaleEditor({ data, onChange, products }) {
    const toggleProduct = (id) => {
        const current = data.productIds || [];
        const newIds = current.includes(id) ? current.filter(x => x !== id) : [...current, id];
        onChange({ ...data, productIds: newIds });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                    <Field label="Fecha de Finalización">
                        <input type="datetime-local" value={data.endTime || ''} onChange={(e) => onChange({ ...data, endTime: e.target.value })} className="w-full p-2 border border-stone-300 rounded-lg text-sm" />
                    </Field>
                </div>
                <div className="flex items-center pt-6">
                    <label className="flex items-center gap-3 cursor-pointer p-2 border rounded-lg hover:bg-stone-50 w-full md:w-auto">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${data.enabled ? 'bg-[#8B5A2B] border-[#8B5A2B]' : 'bg-white border-stone-300'}`}>
                            {data.enabled && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                        </div>
                        <input type="checkbox" checked={data.enabled} onChange={(e) => onChange({ ...data, enabled: e.target.checked })} className="hidden" />
                        <span className="font-bold text-sm text-stone-700">Activar Oferta Flash</span>
                    </label>
                </div>
            </div>

            <Field label="Seleccionar Productos en Oferta">
                <div className="h-60 overflow-y-auto border border-stone-200 p-2 rounded-xl bg-stone-50 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {products.map(p => (
                        <div
                            key={p.id}
                            onClick={() => toggleProduct(p.id)}
                            className={`p-2 border rounded-lg cursor-pointer text-xs flex items-center gap-2 transition-all ${data.productIds?.includes(p.id) ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-sm' : 'bg-white text-stone-600 hover:border-[#8B5A2B]'}`}
                        >
                            <div className={`w-3 h-3 rounded-full border flex-shrink-0 ${data.productIds?.includes(p.id) ? 'bg-white border-white' : 'border-stone-400'}`}></div>
                            <span className="truncate">{p.name}</span>
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-stone-400 mt-1 text-right">Se mostrarán en orden de selección</p>
            </Field>
        </div>
    );
}

function ProductGridEditor({ data, onChange }) {
    return (
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <Field label="Título de la Sección">
                    <input type="text" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} className="w-full p-2 border border-stone-300 rounded-lg text-sm" />
                </Field>
                <Field label="Subtítulo (Opcional)">
                    <input type="text" value={data.subtitle} onChange={(e) => onChange({ ...data, subtitle: e.target.value })} className="w-full p-2 border border-stone-300 rounded-lg text-sm" />
                </Field>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
                <Field label="Cantidad de Productos">
                    <input type="number" min="1" max="12" value={data.count} onChange={(e) => onChange({ ...data, count: e.target.value })} className="w-full p-2 border border-stone-300 rounded-lg text-sm" />
                </Field>
                <Field label="Criterio de Filtrado">
                    <select value={data.filter} onChange={(e) => onChange({ ...data, filter: e.target.value })} className="w-full p-2 border border-stone-300 rounded-lg text-sm bg-white cursor-pointer">
                        <option value="featured">Destacados (Favoritos)</option>
                        <option value="latest">Más Recientes (Nuevos)</option>
                        <option value="all">Todos (Aleatorio)</option>
                    </select>
                </Field>
            </div>
        </div>
    );
}

function BannerEditor({ data, onChange }) {
    return (
        <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-4">
                <Field label="Imagen del Banner">
                    <ImagePicker currentImage={data.image} onSelect={(url) => onChange({ ...data, image: url })} />
                </Field>
            </div>
            <div className="md:col-span-8 space-y-4">
                <Field label="Título Principal">
                    <input type="text" placeholder="Ej: Nueva Temporada" value={data.title} onChange={(e) => onChange({ ...data, title: e.target.value })} className="w-full p-2 border border-stone-300 rounded-lg text-sm" />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Texto Botón">
                        <input type="text" placeholder="Ver Colección" value={data.buttonText} onChange={(e) => onChange({ ...data, buttonText: e.target.value })} className="w-full p-2 border border-stone-300 rounded-lg text-sm" />
                    </Field>
                    <Field label="Enlace">
                        <input type="text" placeholder="/shop" value={data.link} onChange={(e) => onChange({ ...data, link: e.target.value })} className="w-full p-2 border border-stone-300 rounded-lg text-sm" />
                    </Field>
                </div>
            </div>
        </div>
    );
}
