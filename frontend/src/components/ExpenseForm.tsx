/**
 * Form component for adding/editing expenses
 */

import React, { useEffect } from "react";
import { ExpenseFormData } from "../types";
import { TextField, SelectBox, Button } from "../vibes";
import { expenseFormSchema, useExpenseForm } from "../hooks/useExpenseForm";
import { useCreateExpense, useFetchCategories, useUpdateExpense } from "../services/api";
import z from "zod";
import { formatDate } from "../utils/expenseUtils";

interface ExpenseFormProps {
    initialData?: Partial<ExpenseFormData>;
    onSuccess?: () => void;
    onCancel?: () => void;
    submitLabel?: string;
    updatingId?: number;
}

export function ExpenseForm({
    initialData,
    onSuccess,
    onCancel,
    submitLabel = "Add Expense",
    updatingId
}: ExpenseFormProps) {

    const {
        data: categories,
        isLoading: isCategoriesLoading
    } = useFetchCategories()

    const {
        mutateAsync: createExpenseTrigger,
        isPending: isCreatingExpense
    } = useCreateExpense({
        onSuccess: () => {
            onSuccess?.()
            form.reset()
        }
    })

    const {
        mutateAsync: updateExpenseTrigger,
        isPending: isUpdatingExpense
    } = useUpdateExpense({
        onSuccess: () => {
            onSuccess?.()
        }
    })

    const form = useExpenseForm({ initialData : {
        ...initialData,
        category : !!updatingId ? categories?.find((category) => category.name === initialData?.category)?.id.toString() : ""
    } });

    const onSubmit = async (data: z.infer<typeof expenseFormSchema>) => {
        if (!updatingId) {
            await createExpenseTrigger({
                ...data,
                date: data.date.toString(),
                amount: data.amount.toString(),
            })
        } else {
            await updateExpenseTrigger({
                id : updatingId,
                data : {
                    ...data,
                    date: data.date.toString(),
                    amount: data.amount.toString(),
                }
            })
        }
    }

    const formStyle: React.CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
    };

    const buttonGroupStyle: React.CSSProperties = {
        display: "flex",
        gap: "0.5rem",
        marginTop: "0.5rem",
    };

    useEffect(() => {
        if (!!updatingId) {
            form.setValue("category", categories?.find((category) => category.name === initialData?.category)?.id.toString() || "")
        }
    }, [updatingId, categories])

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} style={formStyle} noValidate>
            <TextField
                label="Amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.watch("amount")}
                onChange={(e) => form.setValue("amount", Number(e.target.value))}
                error={form.formState.errors.amount?.message}
                disabled={isCreatingExpense || isUpdatingExpense}
                fullWidth
                required
            />

            <TextField
                label="Description"
                type="text"
                placeholder="Enter description"
                value={form.watch("description")}
                onChange={(e) => form.setValue("description", e.target.value)}
                error={form.formState.errors.description?.message}
                disabled={isCreatingExpense || isUpdatingExpense}
                fullWidth
                required
            />

            <SelectBox
                label="Category"
                options={(categories || []).map((category) => ({
                    value: category.id.toString(),
                    label: `${category.emoji && `${category.emoji} `}${category.name}`,
                }))}
                value={form.watch("category")}
                onChange={(e) => form.setValue("category", e.target.value)}
                error={form.formState.errors.category?.message}
                fullWidth
                required
                disabled={isCategoriesLoading || isCreatingExpense || isUpdatingExpense}
            />

            <TextField
                label="Date"
                type="date"
                value={formatDate(form.watch("date"))}
                max={formatDate(new Date())}
                onChange={(e) => form.setValue("date", new Date(e.target.value))}
                error={form.formState.errors.date?.message}
                disabled={isCreatingExpense || isUpdatingExpense}
                fullWidth
                required
            />

            <TextField
                label="Payer Name"
                type="text"
                placeholder="Enter payer name"
                value={form.watch("payer_name")}
                onChange={(e) => form.setValue("payer_name", e.target.value)}
                error={form.formState.errors.payer_name?.message}
                disabled={isCreatingExpense || isUpdatingExpense}
                fullWidth
                required
            />

            <div style={buttonGroupStyle}>
                <Button
                    type="submit"
                    variant="primary"
                    disabled={isCreatingExpense || isUpdatingExpense}
                    fullWidth
                >
                    {isCreatingExpense || isUpdatingExpense ? "Submitting..." : submitLabel}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isCreatingExpense || isUpdatingExpense}
                    >
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
