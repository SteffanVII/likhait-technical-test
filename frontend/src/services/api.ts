/**
 * API service for communicating with the backend
 */

import { keepPreviousData, useMutation, UseMutationOptions, useQuery, useQueryClient, UseQueryOptions } from "@tanstack/react-query";
import { Category, CategoryFormData, Expense, ExpenseFormData } from "../types";

const API_BASE_URL = "http://localhost:3000/api";

/**
 * Fetch all expenses
 */
export async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch(`${API_BASE_URL}/expenses`);
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

/**
 * Fetch expenses for a specific year and month
 */
export async function getExpenses(
  year: number,
  month: number,
): Promise<Expense[]> {
  const response = await fetch(
    `${API_BASE_URL}/expenses?year=${year}&month=${month}`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch expenses");
  }
  return response.json();
}

interface UseFetchExpensesQueryOptions extends UseQueryOptions<Expense[], Error> { }

export const useFetchExpenses = (
  year: number,
  month: number,
  options?: UseFetchExpensesQueryOptions
) => {

  return useQuery<Expense[], Error>({
    ...options,
    queryKey: ["expenses", year, month],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/expenses?year=${year}&month=${month}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      return response.json();
    }
  })

}

/**
 * Fetch all categories
 */
export async function fetchCategories(): Promise<
  Array<Category>
> {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

interface UseFetchCategoriesOptions extends UseQueryOptions<Category[], Error> { }

export const useFetchCategories = (options?: UseFetchCategoriesOptions) => {
  return useQuery({
    ...options,
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      return response.json();
    },
    placeholderData: keepPreviousData
  })
}

/**
 * Create a new expense
 */
export async function createExpense(data: ExpenseFormData): Promise<Expense> {
  // Convert category name to category_id
  // const categories = await fetchCategories();
  // const category = categories.find((c) => c.name === data.category);

  const expenseData = {
    description: data.description,
    amount: data.amount,
    category_id: Number(data.category),
    date: data.date,
    payer_name: data.payer_name
  };

  const response = await fetch(`${API_BASE_URL}/expenses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expense: expenseData }),
  });

  if (!response.ok) {
    throw new Error("Failed to create expense");
  }

  return response.json();
}

interface UseCreateExpenseMutationOptions extends UseMutationOptions<Expense[], Error, ExpenseFormData> { }

export const useCreateExpense = (options?: UseCreateExpenseMutationOptions) => {
  const queryClient = useQueryClient()
  return useMutation<Expense[], Error, ExpenseFormData>({
    ...options,
    mutationFn: async (variables) => {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expense: {
          ...variables,
          category_id: Number(variables.category)
        } })
      });

      if (!response.ok) {
        throw new Error("Failed to create expense");
      }

      return response.json();
    },
    onSuccess(data, variables, onMutateResult, context) {
      options?.onSuccess?.(data, variables, onMutateResult, context)
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    }
  })
}

/**
 * Update an existing expense
 */
export async function updateExpense(
  id: number,
  data: Partial<ExpenseFormData>,
): Promise<Expense> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ expense: data }),
  });

  if (!response.ok) {
    throw new Error("Failed to update expense");
  }

  return response.json();
}

interface UseUpdateExpenseMutationOptions extends UseMutationOptions<Expense, Error, {id : number, data : Partial<ExpenseFormData>}> {}

export const useUpdateExpense = (options?: UseUpdateExpenseMutationOptions) => {
  const queryClient = useQueryClient()
  return useMutation<Expense, Error, {id : number, data : Partial<ExpenseFormData>}>({
    ...options,
    mutationFn: async ({id, data}) => {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expense: {
          ...data,
          category_id : data.category
        } }),
      });

      if (!response.ok) {
        throw new Error("Failed to update expense");
      }

      return response.json();
    },
    onSuccess(data, variables, onMutateResult, context) {
      options?.onSuccess?.(data, variables, onMutateResult, context)
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    }
  })
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete expense");
  }
}

interface UseDeleteExpenseMutationOptions extends UseMutationOptions<void, Error, number> {}

export const useDeleteExpense = ( options?: Partial<UseDeleteExpenseMutationOptions> ) => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, number>({
    ...options,
    mutationFn : async ( variable ) => {
      const response = await fetch(`${API_BASE_URL}/expenses/${variable}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }
    },
    onSuccess(data, variables, onMutateResult, context) {
      options?.onSuccess?.(data, variables, onMutateResult, context)
      queryClient.invalidateQueries({ queryKey : ["expenses"] })
    }
  })
}

/**
 * Create a new category
 */
interface UseCreateCategoryOptions extends UseMutationOptions<Category, Error, CategoryFormData> { }

export const useCreateCategory = (options?: Partial<UseCreateCategoryOptions>) => {
  const queryClient = useQueryClient()
  return useMutation<Category, Error, CategoryFormData>({
    ...options,
    mutationFn: async (variables) => {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ category: variables })
      })

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      return response.json();
    },
    onSuccess(data, variables, onMutateResult, context) {
      options?.onSuccess?.(data, variables, onMutateResult, context)
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    }
  })
}

/**
 * Update an existing category
 */
interface UseUpdateCategoryOptions extends UseMutationOptions<Category, Error, {id : number, data : Partial<CategoryFormData>}> { }

export const useUpdateCategory = (options?: Partial<UseUpdateCategoryOptions>) => {
  const queryClient = useQueryClient()
  return useMutation<Category, Error, {id : number, data : Partial<CategoryFormData>}>({
    mutationFn : async ({id, data}) => {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ category: data })
      })

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      return response.json();
    },
    onSuccess(data, variables, onMutateResult, context) {
      options?.onSuccess?.(data, variables, onMutateResult, context)
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    }
  })
}

/**
 * Delete an existing category
 */
interface UseDeleteCategoryOptions extends UseMutationOptions<void, Error, {id : number, replacement_id : number}> { }

export const useDeleteCategory = (options?: Partial<UseDeleteCategoryOptions>) => {
  const queryClient = useQueryClient()
  return useMutation<void, Error, {id : number, replacement_id : number}>({
    mutationFn : async ({id, replacement_id}) => {
      const response = await fetch(`${API_BASE_URL}/categories/${id}?replacement_id=${replacement_id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete category");
      }
    },
    onSuccess(data, variables, onMutateResult, context) {
      options?.onSuccess?.(data, variables, onMutateResult, context)
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
    }
  })
}