"use client";

import * as React from "react";
import { ExpensesForm } from "~/components/expenses/ExpensesForm";
import { Modal } from "~/components/modal/Modal";
import { Button } from "~/components/ui/Button";
import { PageHeader } from "~/components/ui/PageHeader";
import { useExpensesStore } from "../utils/state";

export function ExpensesHeader() {
  const [isOpen, setIsOpen] = React.useState(false);
  const expensesStore = useExpensesStore();

  async function addNewExpense() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
    expensesStore.setSelectedExpense(null);
  }

  return (
    <>
      <PageHeader
        title="Expenses"
        description="A list of all expenses from any year starting in 2018."
      >
        <Button onClick={addNewExpense}>Add new expense</Button>
      </PageHeader>

      <Modal isOpen={isOpen} onOpenChange={handleClose}>
        <Modal.Title>
          {expensesStore.selectedExpense ? "Edit Expense" : "Add new expense"}
        </Modal.Title>
        {expensesStore.selectedExpense ? null : (
          <Modal.Description>
            Add a new expense. This expense will be visible on the chart once added.
          </Modal.Description>
        )}

        <div>
          <ExpensesForm onSubmit={handleClose} expense={expensesStore.selectedExpense} />
        </div>
      </Modal>
    </>
  );
}
