/**
 * Calendar expense table component
 */

import React, { useState } from "react";
import { Expense } from "../types";
import { formatCurrency, formatDate } from "../utils/expenseUtils";
import { COLORS } from "../constants/colors";
import { Button, Modal, Pagination } from "../vibes";
import { ExpenseForm } from "./ExpenseForm.tsx";
import { useDeleteExpense } from "../services/api";

interface CalendarExpenseTableProps {
  expenses: Expense[];
}

const ITEMS_PER_PAGE = 10;

export function CalendarExpenseTable({
  expenses,
}: CalendarExpenseTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const totalPages = Math.ceil(expenses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExpenses = expenses.slice(startIndex, endIndex);

  const {
    mutateAsync : deleteExpenseTrigger,
    isPending : isDeletingExpense
  } = useDeleteExpense({
    onSuccess : () => {
      setIsDeleteModalOpen(false);
      setDeletingExpense(null);
    }
  })

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleDelete = (expense: Expense) => {
    setDeletingExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingExpense) return
    deleteExpenseTrigger(deletingExpense?.id)
  };

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

  const emptyStyle: React.CSSProperties = {
    padding: "2rem",
    textAlign: "center",
    color: COLORS.text.secondary,
  };

  const actionButtonsStyle: React.CSSProperties = {
    display: "flex",
    gap: "0.5rem",
  };

  if (expenses.length === 0) {
    return (
      <div style={tableStyle}>
        <div style={emptyStyle}>
          No expenses found. Add your first expense to get started!
        </div>
      </div>
    );
  }

  return (
    <>
      <table style={tableStyle}>
        <thead style={theadStyle}>
          <tr>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Description</th>
            <th style={thStyle}>Category</th>
            <th style={thStyle}>Payer</th>
            <th style={thStyle}>Amount</th>
            <th style={{ ...thStyle, textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentExpenses.map((expense) => (
            <tr key={expense.id}>
              <td style={tdStyle}>{formatDate(new Date(expense.date))}</td>
              <td style={tdStyle}>{expense.description}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>{expense.category.emoji}</span>
                  <span>{expense.category.name}</span>
                </span>
              </td>
              <td style={tdStyle}>{expense.payer_name}</td>
              <td style={{ ...tdStyle, textAlign: "left", fontWeight: 600 }}>
                {formatCurrency(expense.amount)}
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>
                <div style={actionButtonsStyle}>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => handleEdit(expense)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={() => handleDelete(expense)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingExpense(null);
        }}
        title="Edit Expense"
      >
        {editingExpense && (
          <ExpenseForm
            initialData={{
              amount: editingExpense.amount.toString(),
              description: editingExpense.description,
              category: editingExpense.category.name,
              date: formatDate(new Date(editingExpense.date)),
              payer_name: editingExpense.payer_name
            }}
            onSuccess={() => setIsEditModalOpen(false)}
            // onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingExpense(null);
            }}
            submitLabel="Update Expense"
            updatingId={editingExpense.id}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingExpense(null);
        }}
        title="Delete Expense"
      >
        <div style={{ padding: "1rem 0" }}>
          <p style={{ marginBottom: "1.5rem", color: COLORS.text.primary }}>
            Are you sure you want to delete this expense?
          </p>
          {deletingExpense && (
            <p style={{ marginBottom: "1.5rem", color: COLORS.text.secondary }}>
              <strong>{deletingExpense.description}</strong> -{" "}
              {formatCurrency(deletingExpense.amount)}
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeletingExpense(null);
              }}
              disabled={isDeletingExpense}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={isDeletingExpense}
            >
              {
                isDeletingExpense ? "Deleting..." : "Delete"
              }
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
