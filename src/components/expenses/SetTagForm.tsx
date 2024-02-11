import { FormField } from "components/form/FormField";
import { Select } from "components/form/Select";
import { RowSelectionState } from "@tanstack/react-table";
import { Modal } from "components/modal/Modal";
import { Button } from "components/ui/Button";
import { ExpenseTag } from "@prisma/client";
import { trpc } from "utils/trpc";
import { Form } from "components/form/Form";
import { z } from "zod";
import { Loader } from "components/ui/Loader";
import { Expense, ProcessedExpense } from "src/pages/expenses";

interface Props {
  onSubmit(): void;
  selectedRows: RowSelectionState;
  data: (Expense | ProcessedExpense)[];
}

const SET_EXPENSES_TAG_INPUT = z.object({
  ids: z.array(z.string()),
  tag: z.nativeEnum(ExpenseTag),
});

export function SetExpensesTagForm(props: Props) {
  const utils = trpc.useUtils();
  const setExpensesTagMutation = trpc.expenses.setExpensesTag.useMutation({
    onSuccess: () => {
      utils.expenses.getInfinitelyScrollableExpenses.invalidate();
    },
  });

  const selectedExpenses = Object.keys(props.selectedRows)
    .map((idx) => props.data[Number(idx)]?.id)
    .filter(Boolean) as string[];

  async function handleSubmit(values: typeof defaultValues) {
    await setExpensesTagMutation.mutateAsync({
      ids: values.ids,
      tag: values.tag,
    });

    props.onSubmit();
  }

  const defaultValues = {
    ids: selectedExpenses,
    tag: ExpenseTag.Food,
  };

  return (
    <Form schema={SET_EXPENSES_TAG_INPUT} onSubmit={handleSubmit} defaultValues={defaultValues}>
      {({ register, errors }) => (
        <>
          <Modal.Title>Edit Tags</Modal.Title>
          <Modal.Description>This will set the tag for all the selected rows.</Modal.Description>

          <FormField errorMessage={errors.tag} optional label="Tag">
            <Select {...register("tag")}>
              {Object.values(ExpenseTag).map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </Select>
          </FormField>

          <footer className="mt-5 flex justify-end gap-3">
            <Modal.Close>
              <Button variant="dropdown" disabled={setExpensesTagMutation.isPending} type="reset">
                Cancel
              </Button>
            </Modal.Close>
            <Button
              className="flex items-center gap-2"
              disabled={setExpensesTagMutation.isPending}
              type="submit"
            >
              {setExpensesTagMutation.isPending ? <Loader size="sm" /> : null}
              Update selected rows
            </Button>
          </footer>
        </>
      )}
    </Form>
  );
}
