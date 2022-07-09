import { Month } from "@prisma/client";
import { Button } from "components/Button";
import { Form } from "components/form/Form";
import { FormField } from "components/form/FormField";
import { Input } from "components/form/Input";
import { Textarea } from "components/form/Textarea";
import { Modal } from "components/modal/Modal";
import type { Expense } from "src/pages/expenses";
import { trpc } from "utils/trpc";
import z from "zod";

const schema = z.object({
  amount: z.number().min(1),
  date: z.date(),
  description: z.string().nullable().optional(),
});

interface Props {
  expense?: Expense | null;
}

export function ExpensesForm({ expense }: Props) {
  const context = trpc.useContext();
  const addExpenseMutation = trpc.useMutation("expenses.add-expense", {
    onSuccess: () => {
      context.invalidateQueries(["expenses.all-infinite"]);
    },
  });

  const editExpense = trpc.useMutation("expenses.edit-expense", {
    onSuccess: () => {
      context.invalidateQueries(["expenses.all-infinite"]);
    },
  });

  const defaultValues = {
    amount: expense?.amount ?? 0,
    date: expense ? `${expense.date.year}-${getIdxFromMonth(expense.date.month)}-01` : "",
    description: expense?.description ?? "",
  };

  function handleSubmit(data: typeof defaultValues) {
    const date = new Date(data.date);

    if (expense) {
      editExpense.mutate({
        id: expense.id,
        amount: data.amount,
        month: getMonthFromIdx(date.getMonth()),
        year: date.getFullYear(),
        description: data.description,
      });
    } else {
      addExpenseMutation.mutate({
        amount: data.amount,
        month: getMonthFromIdx(date.getMonth()),
        year: date.getFullYear(),
        description: data.description,
      });
    }
  }

  return (
    <Form schema={schema} onSubmit={handleSubmit} defaultValues={defaultValues}>
      {({ register, errors }) => (
        <>
          <FormField errorMessage={errors.amount} label="Amount">
            <Input type="number" {...register("amount", { valueAsNumber: true })} />
          </FormField>

          <FormField errorMessage={errors.date} label="Date">
            <Input type="date" {...register("date", { valueAsDate: true })} />
          </FormField>

          <FormField errorMessage={errors.description} label="Description">
            <Textarea {...register("description")} />
          </FormField>

          <footer className="mt-3 flex justify-end gap-2">
            <Modal.Close>
              <Button type="reset">Cancel</Button>
            </Modal.Close>
            <Button type="submit">{expense ? "Save Changes" : "Add new expense"}</Button>
          </footer>
        </>
      )}
    </Form>
  );
}

function getMonthFromIdx(idx: number): Month {
  const monthsArr = Object.values(Month);
  const month = monthsArr[idx]!;
  return Month[month];
}

function getIdxFromMonth(month: Month) {
  const monthsArr = Object.values(Month);
  const idx = monthsArr.indexOf(month) + 1;

  if (idx < 10) {
    return `0${idx}`;
  }

  return idx.toString();
}
