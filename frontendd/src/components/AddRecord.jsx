import { useState } from "react";

export default function AddRecord() {
  const [form, setForm] = useState({
    amount: "",
    type: "income",
    category: ""
  });

  const handleSubmit = async () => {
    await fetch("http://localhost:5000/api/records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        user: JSON.stringify({ role: "admin" })
      },
      body: JSON.stringify(form)
    });

    alert("Added!");
  };

  return (
    <div className="mt-5">
      <input
        placeholder="Amount"
        onChange={e => setForm({ ...form, amount: e.target.value })}
      />
      <button onClick={handleSubmit}>Add</button>
    </div>
  );
}