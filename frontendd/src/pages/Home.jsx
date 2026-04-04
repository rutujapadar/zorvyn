import Dashboard from "../../components/Dashboard";
import RecordsTable from "../../components/RecordsTable";
import AddRecord from "../../components/AddRecord";

export default function Home() {
  return (
    <div>
      <Dashboard />
      <AddRecord />
      <RecordsTable />
    </div>
  );
}