import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/category";
import AddTransactionForm from "../_components/transactionForm";
import { getTransaction } from "@/actions/transaction";

const AdTransactionPage = async ({ searchParams }) => {
  const accounts = await getUserAccounts();
  const params = await searchParams;
  const editId = params?.edit;

  let initialData = null;
  if (editId) {
    initialData = await getTransaction(editId);
  }

  return (
    <div>
      <h1 className="text-5xl gradient-title mb-8 text-center">
        {editId ? "Edit Transaction" : "Add Transaction"}
      </h1>

      <AddTransactionForm
        account={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
};

export default AdTransactionPage;
