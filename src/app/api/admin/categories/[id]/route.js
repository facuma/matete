import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// PUT: Update category
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const { name, slug, showInNavbar, parentId } = await req.json();

        // Validation for Max Depth if parentId changes
        if (parentId) {
            // Prevent self-referencing
            if (parseInt(parentId) === parseInt(id)) {
                return NextResponse.json({ error: 'Category cannot be its own parent' }, { status: 400 });
            }

            const parent = await prisma.category.findUnique({
                where: { id: parseInt(parentId) }
            });

            if (!parent) {
                return NextResponse.json({ error: 'Parent category not found' }, { status: 404 });
            }

            if (parent.parentId) {
                return NextResponse.json({ error: 'Maximum category depth exceeded (Max levels: 2)' }, { status: 400 });
            }

            // Also check if this category has children. If it does, it cannot become a child (making it depth 3)
            // Actually, if it becomes a child, its children become depth 3.
            // We should check if this category has children.
            const hasChildren = await prisma.category.count({
                where: { parentId: parseInt(id) }
            });

            if (hasChildren > 0) {
                return NextResponse.json({ error: 'Cannot move a category with subcategories to be a child (Max depth exceeded)' }, { status: 400 });
            }
        }

        const category = await prisma.category.update({
            where: { id: parseInt(id) },
            data: {
                name,
                slug,
                showInNavbar,
                parentId: parentId ? parseInt(parentId) : null
            }
        });

        return NextResponse.json(category);
    } catch (error) {
        console.error('Error updating category:', error);
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Error updating category' }, { status: 500 });
    }
}

// DELETE: Delete category
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const { id } = resolvedParams;
        const categoryId = parseInt(id);

        // Check for children
        const childrenCount = await prisma.category.count({
            where: { parentId: categoryId }
        });

        if (childrenCount > 0) {
            return NextResponse.json({ error: 'Cannot delete category with subcategories. Delete them first.' }, { status: 400 });
        }

        // Check for associated products (Optional: Block if products exist, or just unlink)
        // For safety, let's just unlink (set categoryId to null) or let the user know. 
        // The schema says ON DELETE SET NULL, so Prisma/DB handles unlinking.
        // However, if we want to be safe, we can rely on that.

        await prisma.category.delete({
            where: { id: categoryId }
        });

        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Error deleting category' }, { status: 500 });
    }
}
