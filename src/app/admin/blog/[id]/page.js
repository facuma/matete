'use client';

import React, { useState, useEffect } from 'react';
import BlogEditor from '@/components/admin/BlogEditor';

export default function EditPostPage({ params }) {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Unwrap params
        const unwrapParams = async () => {
            const resolvedParams = await params;
            fetchPost(resolvedParams.id);
        };
        unwrapParams();
    }, [params]);

    const fetchPost = async (id) => {
        try {
            const res = await fetch(`/api/admin/posts/${id}`);
            if (res.ok) {
                const data = await res.json();
                setPost(data);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-800"></div>
            </div>
        );
    }

    if (!post) {
        return <div>Post no encontrado</div>;
    }

    return <BlogEditor post={post} />;
}
