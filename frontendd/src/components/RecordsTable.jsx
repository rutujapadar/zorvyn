import { useEffect, useState } from "react";

export default function RecordsTable() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/records", {
      headers: {
        user: JSON.stringify({ role: "admin" })
      }
    })
      .then(res => res.json())
      .then(data => {
        console.log("API Response:", data);

        // Ensure records is always an array
        if (Array.isArray(data)) {
          setRecords(data);
        } else if (data.records && Array.isArray(data.records)) {
          setRecords(data.records);
        } else {
          setRecords([]);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching records:", err);
        setRecords([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="mt-5">
      <h2 className="text-xl font-bold mb-2">Records</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table-auto w-full border">
          <thead>
            <tr>
              <th className="border px-2">Amount</th>
              <th className="border px-2">Type</th>
              <th className="border px-2">Category</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center p-3">
                  No records found
                </td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r._id}>
                  <td className="border px-2">{r.amount}</td>
                  <td className="border px-2">{r.type}</td>
                  <td className="border px-2">{r.category}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}