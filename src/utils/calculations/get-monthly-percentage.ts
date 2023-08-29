import { Expense } from "src/pages/expenses";
import { Income } from "src/pages/income";
import { DEFINED_MONTHS } from "utils/constants";
import { getTotal } from "./get-total";

interface GetMonthlyPercentageOptions {
  income: Income[];
  expenses: Expense[];
}

export function getMonthlyPercentage(options: GetMonthlyPercentageOptions) {
  const currentMonthIndx = new Date().getMonth();
  const currentMonth = DEFINED_MONTHS[currentMonthIndx]!;

  const currentMonthIncome = options.income.filter((item) => item.date.month === currentMonth);
  const currentMonthExpenses = options.expenses.filter((item) => item.date.month === currentMonth);

  const totalMonthIncome = getTotal({ data: currentMonthIncome });
  const totalMonthExpense = getTotal({ data: currentMonthExpenses });

  const incomingPercentage = totalMonthIncome / (totalMonthIncome + totalMonthExpense);
  const outgoingPercentage = totalMonthExpense / (totalMonthIncome + totalMonthExpense);

  const isOutgoingHigherThanIncoming = outgoingPercentage > incomingPercentage;

  return { outgoingPercentage, incomingPercentage, isOutgoingHigherThanIncoming };
}
