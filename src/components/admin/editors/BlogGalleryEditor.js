import React, { useState, useEffect } from 'react';
import { Trash2, Plus, BookOpen, X, Search, Check } from 'lucide-react';
import Button from '@/components/ui/Button';
import ImagePicker from '@/components/admin/ImagePicker';

const Field = ({ label, children, className = "" }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="block text-xs font-bold text-stone-600 uppercase tracking-wide">{label}</label>
        {children}
    </div>
);

export default function BlogGalleryEditor({ data, onChange }) {
    const posts = data.posts || [];

    // Blog Selection State
    const [availablePosts, setAvailablePosts] = useState([]);
    const [showSelector, setShowSelector] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (showSelector && availablePosts.length === 0) {
            fetch('/api/admin/posts')
                .then(res => res.json())
                .then(setAvailablePosts)
                .catch(console.error);
        }
    }, [showSelector]);

    // Ensure data structure integrity
    const safeData = {
        title: data.title || '',
        subtitle: data.subtitle || '',
        posts: posts
    };

    const addPost = () => onChange({ ...safeData, posts: [...posts, { title: '', excerpt: '', link: '', image: '' }] });

    const addFromBlog = (blogPost) => {
        const newPost = {
            title: blogPost.title,
            excerpt: blogPost.excerpt || '',
            link: `/ blog / ${blogPost.slug} `,
            image: blogPost.coverImage || '',
        };
        onChange({ ...safeData, posts: [...posts, newPost] });
        setShowSelector(false);
    };

    const updatePost = (idx, field, val) => {
        const newPosts = [...posts];
        newPosts[idx][field] = val;
        onChange({ ...safeData, posts: newPosts });
    };

    const removePost = (idx) => onChange({ ...safeData, posts: posts.filter((_, i) => i !== idx) });

    const filteredBlogPosts = availablePosts.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 relative">
            <div className="grid md:grid-cols-2 gap-4">
                <Field label="Título de Sección">
                    <input
                        type="text"
                        value={safeData.title}
                        onChange={(e) => onChange({ ...safeData, title: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded-lg text-sm"
                    />
                </Field>
                <Field label="Subtítulo">
                    <input
                        type="text"
                        value={safeData.subtitle}
                        onChange={(e) => onChange({ ...safeData, subtitle: e.target.value })}
                        className="w-full p-2 border border-stone-300 rounded-lg text-sm"
                    />
                </Field>
            </div>

            <div className="space-y-4">
                <label className="block text-xs font-bold text-stone-600 uppercase tracking-wide">POSTS / NOTAS</label>
                {posts.map((post, idx) => (
                    <div key={idx} className="border border-stone-200 p-4 rounded-xl bg-stone-50/50 relative group">
                        <button onClick={() => removePost(idx)} className="absolute top-2 right-2 text-stone-400 hover:text-red-500 p-1 bg-white rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>

                        <div className="grid md:grid-cols-12 gap-6">
                            <div className="md:col-span-3">
                                <Field label="Portada">
                                    <ImagePicker currentImage={post.image} onSelect={(url) => updatePost(idx, 'image', url)} />
                                </Field>
                            </div>
                            <div className="md:col-span-9 space-y-3">
                                <Field label="Título del Post">
                                    <input type="text" placeholder="Ej: Beneficios del Mate" value={post.title} onChange={(e) => updatePost(idx, 'title', e.target.value)} className="w-full p-2 border border-stone-300 rounded-lg text-sm" />
                                </Field>
                                <Field label="Extracto / Resumen">
                                    <textarea rows="2" placeholder="Breve descripción..." value={post.excerpt} onChange={(e) => updatePost(idx, 'excerpt', e.target.value)} className="w-full p-2 border border-stone-300 rounded-lg text-sm resize-none" />
                                </Field>
                                <Field label="Enlace">
                                    <input type="text" placeholder="/blog/nota-1" value={post.link} onChange={(e) => updatePost(idx, 'link', e.target.value)} className="w-full p-2 border border-stone-300 rounded-lg text-sm" />
                                </Field>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button size="sm" variant="outline" onClick={addPost} className="w-full border-dashed border-2 border-stone-300 text-stone-500 hover:border-[#8B5A2B] hover:text-[#8B5A2B] hover:bg-stone-50"><Plus size={16} className="mr-2" /> Agregar Manual</Button>
                <Button size="sm" variant="outline" onClick={() => setShowSelector(true)} className="w-full border-dashed border-2 border-stone-300 text-stone-500 hover:border-[#8B5A2B] hover:text-[#8B5A2B] hover:bg-stone-50"><BookOpen size={16} className="mr-2" /> Seleccionar de Blog</Button>
            </div>

            {/* BLOG SELECTION MODAL */}
            {showSelector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
                            <h3 className="font-bold text-stone-800 flex items-center gap-2"><BookOpen size={18} /> Seleccionar Nota</h3>
                            <button onClick={() => setShowSelector(false)} className="text-stone-400 hover:text-stone-800 p-1 rounded-full hover:bg-stone-200"><X size={18} /></button>
                        </div>

                        <div className="p-4 border-b border-stone-100">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Buscar por título..."
                                    className="w-full pl-9 p-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#8B5A2B]/20 focus:border-[#8B5A2B] outline-none"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {filteredBlogPosts.length > 0 ? filteredBlogPosts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => addFromBlog(p)}
                                    className="w-full text-left p-3 rounded-lg hover:bg-stone-50 group border border-transparent hover:border-stone-200 transition-all flex gap-3 items-center"
                                >
                                    <div className="w-12 h-12 rounded bg-stone-100 flex-shrink-0 overflow-hidden">
                                        {p.coverImage ? (
                                            <img src={p.coverImage} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-300"><BookOpen size={16} /></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-stone-800 group-hover:text-[#8B5A2B]">{p.title}</div>
                                        <div className="text-xs text-stone-500 line-clamp-1">{p.excerpt || 'Sin extracto'}</div>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 text-[#8B5A2B]"><Plus size={18} /></div>
                                </button>
                            )) : (
                                <div className="p-8 text-center text-stone-400 text-sm">
                                    No se encontraron posts.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
