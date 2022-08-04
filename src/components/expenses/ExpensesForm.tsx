import { Month } from "@prisma/client";
import { Button } from "components/ui/Button";
import { Form } from "components/form/Form";
import { FormField } from "components/form/FormField";
import { Input } from "components/form/Input";
import { Textarea } from "components/form/Textarea";
import { Modal } from "components/modal/Modal";
import type { Expense } from "src/pages/expenses";
import { trpc } from "utils/trpc";
import z from "zod";
import { Loader } from "components/ui/Loader";

const schema = z.object({
  amount: z.number().min(1),
  date: z.date(),
  description: z.string().nullable().optional(),
});

interface Props {
  expense?: Expense | null;
  onSubmit?(): void;
}

export function ExpensesForm({ expense, onSubmit }: Props) {
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

  const isLoading = addExpenseMutation.isLoading || editExpense.isLoading;

  const defaultValues = {
    amount: expense?.amount ?? 0,
    date: expense ? `${expense.date.year}-${getIdxFromMonth(expense.date.month)}-01` : "",
    description: expense?.description ?? "",
  };

  async function handleSubmit(data: typeof defaultValues) {
    const date = new Date(data.date);

    if (expense) {
      await editExpense.mutateAsync({
        id: expense.id,
        amount: data.amount,
        month: getMonthFromIdx(date.getMonth()),
        year: date.getFullYear(),
        description: data.description,
      });

      onSubmit?.();
    } else {
      await addExpenseMutation.mutateAsync({
        amount: data.amount,
        month: getMonthFromIdx(date.getMonth()),
        year: date.getFullYear(),
        description: data.description,
      });

      onSubmit?.();
    }
  }

  return (
    <Form schema={schema} onSubmit={handleSubmit} defaultValues={defaultValues}>
      {({ register, errors }) => (
        <>
          <FormField errorMessage={errors.amount} label="Amount">
            <Input className="font-mono" {...register("amount", { valueAsNumber: true })} />
          </FormField>

          <FormField errorMessage={errors.date} label="Date">
            <Input type="date" {...register("date", { valueAsDate: true })} />
          </FormField>

          <FormField errorMessage={errors.description} label="Description">
            <Textarea {...register("description")} />
          </FormField>

          <footer className="mt-5 flex justify-end gap-2">
            <Modal.Close>
              <Button disabled={isLoading} type="reset">
                Cancel
              </Button>
            </Modal.Close>
            <Button className="flex items-center gap-2" disabled={isLoading} type="submit">
              {isLoading ? <Loader size="sm" /> : null}
              {expense ? "Save Changes" : "Add new expense"}
            </Button>
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
