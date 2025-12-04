'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function BlogEditor({ post = null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: '',
        published: false,
        metaTitle: '',
        metaDescription: '',
        keywords: ''
    });

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'indent',
        'link', 'image'
    ];

    useEffect(() => {
        if (post) {
            setFormData({
                title: post.title || '',
                slug: post.slug || '',
                excerpt: post.excerpt || '',
                content: typeof post.content === 'string' ? post.content : JSON.stringify(post.content),
                coverImage: post.coverImage || '',
                published: post.published || false,
                metaTitle: post.seo?.metaTitle || '',
                metaDescription: post.seo?.metaDescription || '',
                keywords: post.seo?.keywords || ''
            });
        }
    }, [post]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const generateSlug = () => {
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setFormData(prev => ({ ...prev, slug }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = post ? `/api/admin/posts/${post.id}` : '/api/admin/posts';
            const method = post ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/admin/blog');
                router.refresh();
            } else {
                alert('Error al guardar el post');
            }
        } catch (error) {
            console.error('Error saving post:', error);
            alert('Error al guardar el post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="p-2"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <h1 className="text-3xl font-bold text-stone-800">
                        {post ? 'Editar Post' : 'Nuevo Post'}
                    </h1>
                </div>
                <div className="flex gap-3">
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex items-center gap-2"
                        disabled={loading}
                    >
                        <Save size={20} />
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-stone-700 mb-1">Título</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                onBlur={!post ? generateSlug : undefined}
                                className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-stone-700 mb-1">Slug (URL)</label>
                            <input
                                type="text"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none bg-stone-50"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-stone-700 mb-1">Contenido</label>
                            <div className="h-96 mb-12">
                                <ReactQuill
                                    theme="snow"
                                    value={formData.content}
                                    onChange={handleEditorChange}
                                    modules={modules}
                                    formats={formats}
                                    className="h-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
                        <h3 className="text-lg font-bold mb-4">SEO Metadata</h3>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Meta Título</label>
                                <input
                                    type="text"
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-800 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Meta Descripción</label>
                                <textarea
                                    name="metaDescription"
                                    value={formData.metaDescription}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-800 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Keywords</label>
                                <input
                                    type="text"
                                    name="keywords"
                                    value={formData.keywords}
                                    onChange={handleChange}
                                    placeholder="mate, yerba, argentina"
                                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-800 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
                        <h3 className="text-lg font-bold mb-4">Publicación</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <input
                                type="checkbox"
                                id="published"
                                name="published"
                                checked={formData.published}
                                onChange={handleChange}
                                className="w-5 h-5 text-stone-800 rounded focus:ring-stone-800 border-gray-300"
                            />
                            <label htmlFor="published" className="font-medium text-stone-700 cursor-pointer">
                                Publicado
                            </label>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
                        <h3 className="text-lg font-bold mb-4">Imagen Principal</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-stone-700 mb-1">URL de la imagen</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="coverImage"
                                    value={formData.coverImage}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-800 outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        {formData.coverImage && (
                            <div className="aspect-video rounded-lg overflow-hidden bg-stone-100 relative border border-stone-200">
                                <img
                                    src={formData.coverImage}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-200">
                        <h3 className="text-lg font-bold mb-4">Extracto</h3>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg border border-stone-300 focus:ring-2 focus:ring-stone-800 outline-none text-sm"
                            placeholder="Breve descripción para listados..."
                        />
                    </div>
                </div>
            </div>
        </form>
    );
}
