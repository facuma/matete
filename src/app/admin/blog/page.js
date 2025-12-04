'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusCircle, Search, Edit, Trash2, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';

export default function AdminBlogPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Delete state
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState(null);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/posts');
            if (res.ok) {
                const data = await res.json();
                setPosts(data);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDeletePost = async () => {
        if (!postToDelete) return;

        try {
            const res = await fetch(`/api/admin/posts/${postToDelete.id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchPosts();
                setIsDeleteOpen(false);
                setPostToDelete(null);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const openDeleteModal = (post) => {
        setPostToDelete(post);
        setIsDeleteOpen(true);
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );


    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-stone-800">Blog</h1>
                <Link href="/admin/blog/new">
                    <Button variant="primary" className="flex items-center gap-2">
                        <PlusCircle size={20} />
                        Nuevo Post
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-200 focus:border-stone-800 focus:ring-1 focus:ring-stone-800 outline-none"
                    />
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-stone-50 border-b border-stone-200">
                        <tr>
                            <th className="p-4 font-semibold text-sm">Título</th>
                            <th className="p-4 font-semibold text-sm">Estado</th>
                            <th className="p-4 font-semibold text-sm">Fecha</th>
                            <th className="p-4 font-semibold text-sm">Autor</th>
                            <th className="p-4 font-semibold text-sm">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPosts.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-stone-400">
                                    No se encontraron posts
                                </td>
                            </tr>
                        ) : (
                            filteredPosts.map(post => (
                                <tr key={post.id} className="border-b border-stone-200 last:border-0 hover:bg-stone-50 transition-colors">
                                    <td className="p-4 font-medium text-stone-800">{post.title}</td>
                                    <td className="p-4">
                                        {post.published ? (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Publicado</span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Borrador</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-stone-600">
                                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '-'}
                                    </td>
                                    <td className="p-4 text-stone-600">{post.author?.name || 'Desconocido'}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <Link href={`/blog/${post.slug}`} target="_blank">
                                                <button className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors" title="Ver">
                                                    <Eye size={18} />
                                                </button>
                                            </Link>
                                            <Link href={`/admin/blog/${post.id}`}>
                                                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                                    <Edit size={18} />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => openDeleteModal(post)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => {
                    setIsDeleteOpen(false);
                    setPostToDelete(null);
                }}
                onConfirm={handleDeletePost}
                itemName={postToDelete?.title}
                itemType="post"
            />
        </div>
    );
}
