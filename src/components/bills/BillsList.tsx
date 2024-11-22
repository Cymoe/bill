import { useQuery, useMutation } from "convex/react";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

// Define the query and mutation functions directly
const getUserBills = "bills:getUserBills";
const createBill = "bills:createBill";

export function BillsList() {
  const { user } = useAuth0();
  const bills = useQuery(getUserBills);
  const createBillMutation = useMutation(createBill);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBillMutation({
        amount: parseFloat(amount),
        description,
        dueDate,
      });
      // Reset form
      setAmount("");
      setDescription("");
      setDueDate("");
    } catch (error) {
      console.error("Failed to create bill:", error);
    }
  };

  if (!user) {
    return <div>Please sign in to view and create bills.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bills</h1>
      
      {/* Create Bill Form */}
      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Bill
        </button>
      </form>

      {/* Bills List */}
      <div className="space-y-4">
        {bills?.map((bill: any) => (
          <div
            key={bill._id}
            className="p-4 border rounded shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{bill.description}</h3>
                <p className="text-gray-600">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
              </div>
              <p className="text-lg font-bold">${bill.amount.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
