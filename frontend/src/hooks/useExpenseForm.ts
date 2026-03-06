/**
 * Custom hook for managing expense form state and validation
 */

import { ExpenseFormData } from "../types";
import { formatDate } from "../utils/expenseUtils";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface UseExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
}

export const expenseFormSchema = z.object({
  amount : z.number().min(1, "Amount must be greater than 0").max(1000000, "Amount must be less than 1,000,000"),
  description : z.string().min(1, "Description is required"),
  category : z.string().min(1, "Category is required"),
  date : z.string().min(1, "Date is required"),
  payer_name : z.string().min(1, "Payer name is required"),
})

export function useExpenseForm({ initialData }: UseExpenseFormProps) {

  const form = useForm<z.infer<typeof expenseFormSchema>>({
    resolver : zodResolver(expenseFormSchema),
    defaultValues : {
      amount : Number(initialData?.amount) || 0,
      description : initialData?.description || "",
      category : initialData?.category || "",
      date : initialData?.date || formatDate(new Date()),
      payer_name : initialData?.payer_name || "",
    }
  })

  return form;
}
