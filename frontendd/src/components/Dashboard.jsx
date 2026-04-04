import { useEffect, useState } from "react";
import { getSummary } from "../../frontend/src/api";

export default function Dashboard() {
  const [data, setData] = useState({});

  const user = { role: "admin" }; // mock login

  useEffect(() => {
    getSummary(user).then(setData);
  }, []);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Finance Dashboard 💸</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-200 p-4 rounded">
          Income: ₹{data.income}
        </div>
        <div className="bg-red-200 p-4 rounded">
          Expense: ₹{data.expense}
        </div>
        <div className="bg-blue-200 p-4 rounded">
          Balance: ₹{data.balance}
        </div>
      </div>
    </div>
  );
}