import { create } from "zustand";
import { Expense } from "~/_pages/expenses";

interface ExpensesState {
  selectedExpense: Expense | null;
  setSelectedExpense(expense: Expense | null): void;
}

export const useExpensesStore = create<ExpensesState>()((set) => ({
  selectedExpense: null,
  setSelectedExpense: (selectedExpense) => set({ selectedExpense }),
}));
