import React, { useState } from "react";
import { COLORS } from "../constants/colors";
import { useDeleteCategory, useFetchCategories } from "../services/api";
import { Button, Modal, SelectBox } from "../vibes";
import CategoryForm from "./CategoryForm";
import { Category } from "../types";



const CategoryList = () => {

    const {
        data : categories,
        isLoading : categoriesIsLoading
    } = useFetchCategories()

    const [editingCategory, setEditingCategory] = useState<Category | null>()
    const [deletingCategory, setDeletingCategory] = useState<Category | null>()
    const [replacementCategory, setReplacementCategory] = useState<string | null>(null)
    const [emptyReplacentError, setEmptyReplacementError] = useState<boolean>(false)

    const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
    const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false)
    const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false)

    const {
        mutateAsync : deleteCategoryTrigger,
        isPending : isDeletingCategory
    } = useDeleteCategory({
        onSuccess : () => {
            setIsDeleteCategoryModalOpen(false)
            setDeletingCategory(null)
        }
    })

    const handleDeleteCategory = () => {
        if (!replacementCategory) {
            setEmptyReplacementError(true)
            return
        }
        deleteCategoryTrigger({ id : Number(deletingCategory?.id), replacement_id: Number(replacementCategory) })
    }

    const listStyle : React.CSSProperties = {
        display : "flex",
        flexDirection : "column",
        gap : "1rem",
    }

    const tableStyle: React.CSSProperties = {
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: COLORS.background.main,
        borderRadius: "0.5rem",
        overflow: "hidden",
        border: `1px solid ${COLORS.border}`,
    };

    const theadStyle: React.CSSProperties = {
        backgroundColor: COLORS.background.card,
    };

    const thStyle: React.CSSProperties = {
        padding: "0.75rem",
        textAlign: "left",
        fontWeight: 600,
        color: COLORS.text.primary,
        borderBottom: `2px solid ${COLORS.border}`,
    };

    const tdStyle: React.CSSProperties = {
        padding: "0.75rem",
        borderBottom: `1px solid ${COLORS.border}`,
        color: COLORS.text.primary,
    };

    const loadingStyle: React.CSSProperties = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "48px",
        fontSize: "18px",
        color: COLORS.secondary.s08,
    };

    return (
        <div style={listStyle} >
            {
                categoriesIsLoading ? (
                    <div style={loadingStyle} >Loading...</div>
                ) : (
                    <table style={tableStyle} >
                        <thead style={theadStyle} >
                            <tr>
                                <th style={thStyle}>Name</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories?.map((category) => (
                                <tr key={category.id}>
                                    <td style={tdStyle}>{category.emoji}{category.name}</td>
                                    <td style={tdStyle} >
                                        <div style={{display: "flex", gap: "1rem"}} >
                                            <Button
                                                variant="secondary"
                                                size="small"
                                                onClick={() => {
                                                    setEditingCategory(category)
                                                    setIsEditCategoryModalOpen(true)
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="danger"
                                                size="small"
                                                onClick={() => {
                                                    setIsDeleteCategoryModalOpen(true)
                                                    setDeletingCategory(category)
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )
            }
            <Button
                variant="primary"
                fullWidth
                onClick={() => setIsAddCategoryModalOpen(true)}
            >
                Add Category
            </Button>

            <Modal
                isOpen={isAddCategoryModalOpen}
                onClose={() => setIsAddCategoryModalOpen(false)}
                title="Add New Category"
            >
                <CategoryForm
                    onSuccess={() => setIsAddCategoryModalOpen(false)}
                    onCancel={() => setIsAddCategoryModalOpen(false)}
                />
            </Modal>

            <Modal
                isOpen={isEditCategoryModalOpen}
                onClose={() => {
                    setIsEditCategoryModalOpen(false)
                    setEditingCategory(null)
                }}
                title="Edit Category"
            >
                <CategoryForm
                    initialData={editingCategory || {}}
                    onSuccess={() => setIsEditCategoryModalOpen(false)}
                    onCancel={() => {
                        setIsEditCategoryModalOpen(false)
                        setEditingCategory(null)
                    }}
                    submitLabel="Update Category"
                    updatingId={editingCategory?.id}
                />
            </Modal>

            <Modal
                isOpen={isDeleteCategoryModalOpen}
                onClose={() => {
                    setIsDeleteCategoryModalOpen(false)
                    setDeletingCategory(null)
                }}
                title="Delete Category"
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection : "column",
                        gap : "1rem"
                    }}
                >
                    <p>Are you sure you want to delete "{deletingCategory?.emoji && `${deletingCategory.emoji} `}{deletingCategory?.name}" category?</p>
                    <div style={{display: "flex", flexDirection: "column"}} >
                        <SelectBox
                            label={"Replacement Category"}
                            options={(categories || []).filter(category => category.id !== deletingCategory?.id).map((category) => ({
                                value: category.id.toString(),
                                label: `${category.emoji && `${category.emoji} `}${category.name}`,
                            }))}
                            value={replacementCategory || ""}
                            onChange={(e) => {
                                setEmptyReplacementError(false)
                                setReplacementCategory(e.target.value)
                            }}
                            fullWidth
                            required
                            error={emptyReplacentError ? "Please select a replacement category" : undefined}
                            description={`Please choose a category to replace the "${deletingCategory?.emoji && `${deletingCategory.emoji} `}${deletingCategory?.name}" from existing expenses`}
                            disabled={isDeletingCategory}
                        />
                    </div>
                    <div style={{display: "flex", justifyContent: "end", gap: "0.5rem"}} >
                        <Button
                            variant="secondary"
                            disabled={isDeletingCategory}
                            onClick={() => {
                                setIsDeleteCategoryModalOpen(false)
                                setDeletingCategory(null)
                                setReplacementCategory(null)
                            }}
                        >Cancel</Button>
                        <Button
                            variant="danger"
                            onClick={handleDeleteCategory}
                            disabled={isDeletingCategory}
                        >
                            {
                                isDeletingCategory ? "Deleting..." : "Delete"
                            }
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )

}

export default CategoryList;