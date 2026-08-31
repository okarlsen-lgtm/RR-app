import { NavLink, Route, Routes } from "react-router-dom";
import { HistoryPage } from "./pages/History";
import { NewSetupPage } from "./pages/NewSetup";
import { ProfilesPage } from "./pages/Profiles";

function App() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-orange-600 text-white"
        : "text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
    }`;

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">🏁 RR-app</h1>
          <p className="text-sm text-neutral-500">Setup-hjelp for roadracing — dempere, dekktrykk og vær, samlet på ett sted.</p>
        </div>
        <nav className="flex gap-2">
          <NavLink to="/" end className={navClass}>
            Nytt oppsett
          </NavLink>
          <NavLink to="/historikk" className={navClass}>
            Historikk
          </NavLink>
          <NavLink to="/profiler" className={navClass}>
            Profiler
          </NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<NewSetupPage />} />
          <Route path="/historikk" element={<HistoryPage />} />
          <Route path="/profiler" element={<ProfilesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
