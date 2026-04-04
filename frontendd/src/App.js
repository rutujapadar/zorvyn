import { useEffect, useState } from "react";
import './index.css';

function App() {
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState({ role: "admin" });
  const [editId, setEditId] = useState(null);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const [form, setForm] = useState({ amount: "", type: "income", category: "", date: "", note: "" });
  const [filters, setFilters] = useState({ type: "", category: "", startDate: "", endDate: "" });

  const getHeaders = () => ({ "Content-Type": "application/json", user: JSON.stringify(user) });

  const fetchData = async () => {
    let query = new URLSearchParams(filters).toString();
    try {
      const recordsRes = await fetch(`http://localhost:5000/api/records?${query}`, { headers: getHeaders() });
      const recordsData = await recordsRes.json();
      setRecords(Array.isArray(recordsData) ? recordsData : []);
    } catch (err) { console.error("Fetch error:", err); }
  };

  useEffect(() => { fetchData(); }, [user, filters]);

  // --- CALCULATION LOGIC ---
  const totals = records.reduce((acc, r) => {
    const val = Number(r.amount) || 0;
    if (r.type === 'income') acc.income += val;
    if (r.type === 'expense') acc.expense += val;
    return acc;
  }, { income: 0, expense: 0 });

  const categoryTotals = records.reduce((acc, r) => {
    if (r.type === 'expense') acc[r.category] = (acc[r.category] || 0) + Number(r.amount);
    return acc;
  }, {});

  const monthlyTrends = records.reduce((acc, r) => {
    const month = r.date ? new Date(r.date).toLocaleString('default', { month: 'short' }) : 'Apr';
    if (!acc[month]) acc[month] = { income: 0, expense: 0 };
    acc[month][r.type] += Number(r.amount);
    return acc;
  }, {});

  const maxVal = Math.max(totals.income, totals.expense, 1000);

  // --- ACTIONS ---
  const addRecord = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `http://localhost:5000/api/records/${editId}` : "http://localhost:5000/api/records";
    await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) });
    setEditId(null);
    setForm({ amount: "", type: "income", category: "", date: "", note: "" });
    fetchData();
  };

  const deleteRecord = async (id) => {
    await fetch(`http://localhost:5000/api/records/${id}`, { method: "DELETE", headers: getHeaders() });
    fetchData();
  };

  const editRecord = (r) => {
    setForm({ amount: r.amount, type: r.type, category: r.category, date: r.date?.substring(0, 10), note: r.note });
    setEditId(r._id);
    setActiveTab("Dashboard");
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl flex-shrink-0">
        <div className="p-6 border-b border-slate-800 text-center">
          <h2 className="text-2xl font-bold italic tracking-tighter">💰 FinanceTrack</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab("Dashboard")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${activeTab === "Dashboard" ? "bg-blue-600 shadow-lg" : "text-slate-400 hover:bg-slate-800"}`}>
            📊 Dashboard
          </button>
          {user.role !== "viewer" && (
            <button onClick={() => setActiveTab("Records")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${activeTab === "Records" ? "bg-blue-600 shadow-lg" : "text-slate-400 hover:bg-slate-800"}`}>
              📜 Records
            </button>
          )}
        </nav>
        <div className="p-4 bg-slate-800 m-4 rounded-lg">
          <p className="text-[10px] text-slate-400 uppercase font-black mb-1">Active Role</p>
          <p className="font-bold text-sm text-blue-400 uppercase">{user.role}</p>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-slate-800">{activeTab}</h1>
          <select className="bg-slate-100 border-none text-xs font-black rounded-lg px-4 py-2 outline-none cursor-pointer" value={user.role} onChange={(e) => { setUser({ role: e.target.value }); if (e.target.value === "viewer") setActiveTab("Dashboard"); }}>
            <option value="admin">ADMIN</option>
            <option value="analyst">ANALYST</option>
            <option value="viewer">VIEWER</option>
          </select>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#f8fafc]">
          
          {/* DASHBOARD TAB CONTENT */}
          {activeTab === "Dashboard" && (
            <>
              {/* STAT CARDS - Only visible here */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-emerald-500">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Income</p>
                  <h2 className="text-3xl font-black text-emerald-600">₹{totals.income}</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-rose-500">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Expense</p>
                  <h2 className="text-3xl font-black text-rose-500">₹{totals.expense}</h2>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Net Balance</p>
                  <h2 className="text-3xl font-black text-blue-600">₹{totals.income - totals.expense}</h2>
                </div>
              </div>

              {/* CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold mb-4 text-slate-700">📂 Expense Categories</h3>
                  <div className="space-y-4">
                    {Object.entries(categoryTotals).map(([cat, total]) => (
                      <div key={cat}>
                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-1"><span>{cat}</span><span>₹{total}</span></div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden"><div className="bg-blue-500 h-full transition-all" style={{ width: `${Math.min((total / (totals.expense || 1)) * 100, 100)}%` }}></div></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <h3 className="text-lg font-bold mb-4 text-slate-700">📅 Trends</h3>
                  <div className="flex items-end justify-around h-40 border-b border-slate-100">
                    {Object.entries(monthlyTrends).map(([month, val]) => (
                      <div key={month} className="flex flex-col items-center flex-1">
                        <div className="w-full flex gap-1 items-end justify-center h-32">
                          <div className="bg-emerald-400 w-3 rounded-t-sm" style={{ height: `${(val.income / maxVal) * 100}%` }}></div>
                          <div className="bg-rose-400 w-3 rounded-t-sm" style={{ height: `${(val.expense / maxVal) * 100}%` }}></div>
                        </div>
                        <span className="text-[10px] mt-2 font-bold text-slate-400">{month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FORM (ADMIN ONLY) */}
              {user.role === "admin" && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100">
                  <h3 className="text-lg font-bold mb-4 text-blue-700">{editId ? "✏️ Edit" : "➕ New"} Transaction</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input className="border border-slate-200 rounded-xl p-3 text-sm" placeholder="Amount" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
                    <select className="border border-slate-200 rounded-xl p-3 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="income">Income</option><option value="expense">Expense</option></select>
                    <input className="border border-slate-200 rounded-xl p-3 text-sm" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                    <input type="date" className="border border-slate-200 rounded-xl p-3 text-sm" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                  </div>
                  <button className="w-full mt-4 bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 transition-all" onClick={addRecord}>{editId ? "UPDATE" : "SAVE"}</button>
                </div>
              )}
            </>
          )}

          {/* RECORDS TAB CONTENT */}
          {activeTab === "Records" && user.role !== "viewer" && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold mb-4 flex items-center gap-2">🔍 Search Filters</h3>
                <div className="flex gap-4">
                  <select className="border rounded-xl p-2.5 text-sm" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}><option value="">All Types</option><option value="income">Income</option><option value="expense">Expense</option></select>
                  <input className="border rounded-xl p-2.5 text-sm flex-1" placeholder="Search category..." value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
                </div>
              </div>
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <tr><th className="px-6 py-4">Status</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Date</th><th className="px-6 py-4">Amount</th>{user.role === "admin" && <th className="px-6 py-4 text-center">Actions</th>}</tr>
                  </thead>
                  <tbody className="divide-y">
                    {records.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 italic text-xs">{r.type}</td>
                        <td className="px-6 py-4 text-sm font-medium">{r.category}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                        <td className="px-6 py-4 font-black">₹{r.amount}</td>
                        {user.role === "admin" && (<td className="px-6 py-4 text-center space-x-4"><button className="text-blue-500 font-bold text-xs" onClick={() => editRecord(r)}>Edit</button><button className="text-rose-400 font-bold text-xs" onClick={() => deleteRecord(r._id)}>Delete</button></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;