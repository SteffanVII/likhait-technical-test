import { CategoryFormData } from "../types";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export const categoryFormSchema = z.object({
    name : z.string().min(1, "Name is required"),
    emoji : z.emoji().optional()
})

interface UseCategoryFormProps {
    initialData?: Partial<CategoryFormData>,
}

export function useCategoryForm({
    initialData,
} : UseCategoryFormProps) {

    const form = useForm<z.infer<typeof categoryFormSchema>>({
        resolver : zodResolver(categoryFormSchema),
        defaultValues : {
            name : initialData?.name || "",
            emoji : initialData?.emoji
        }
    })

    return form
}