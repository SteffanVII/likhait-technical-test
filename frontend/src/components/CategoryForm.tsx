import React from "react";
import { categoryFormSchema, useCategoryForm } from "../hooks/useCategoryForm";
import { Category, CategoryFormData } from "../types";
import { Button, TextField } from "../vibes";
import z from "zod";
import { useCreateCategory, useUpdateCategory } from "../services/api";

interface CategoryFormProps {
    initialData?: Partial<CategoryFormData>,
    onSuccess?: ( data : Category ) => void
    onCancel?: () => void,
    submitLabel?: string ,
    updatingId? : number
}

const CategoryForm : React.FC<CategoryFormProps> = ({
    initialData,
    onSuccess,
    onCancel,
    submitLabel = "Add Category",
    updatingId
}) => {

    const {
        mutateAsync : createCategoryTrigger,
        isPending : isCreatingCategory
    } = useCreateCategory({
        onSuccess : ( data ) => {
            onSuccess?.(data)
            form.reset()
        }
    })

    const {
        mutateAsync : updateCategoryTrigger,
        isPending : isUpdatingCategory
    } = useUpdateCategory({
        onSuccess : ( data ) => {
            onSuccess?.( data )
            form.reset()
        }
    })

    const form = useCategoryForm({
        initialData
    });

    const onSubmit = (data: z.infer<typeof categoryFormSchema>) => {
        if (!updatingId) {
            createCategoryTrigger(data)
        } else {
            updateCategoryTrigger({ id : updatingId, data : data })
        }
    }

    const formStyle : React.CSSProperties = {
        display : "flex",
        flexDirection : "column",
        gap : "1rem"
    }

    const buttonGroupStyle: React.CSSProperties = {
        display: "flex",
        gap: "0.5rem",
        marginTop: "0.5rem",
    };

    return (
        <form style={formStyle}  onSubmit={form.handleSubmit(onSubmit)} >
            <TextField
                label="Category Name"
                value={form.watch("name")}
                onChange={(e) => form.setValue("name", e.target.value)}
                error={form.formState.errors.name?.message}
                disabled={isCreatingCategory || isUpdatingCategory}
            />
            <TextField
                label="Emoji"
                value={form.watch("emoji")}
                onChange={(e) => form.setValue("emoji", e.target.value)}
                error={form.formState.errors.emoji?.message}
                disabled={isCreatingCategory || isUpdatingCategory}
            />

            <div style={buttonGroupStyle}>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isCreatingCategory || isUpdatingCategory}
                    fullWidth
                >
                    {isCreatingCategory ||isUpdatingCategory ? "Submitting..." : submitLabel}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isCreatingCategory || isUpdatingCategory}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    )

}

export default CategoryForm