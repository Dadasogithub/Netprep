import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Practice from "./pages/Practice";
import MockTest from "./pages/MockTest";
import Analytics from "./pages/Analytics";
import Bookmarks from "./pages/Bookmarks";
import CustomMocks from "./pages/CustomMocks";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/mock" element={<MockTest />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/custom-mocks" element={<CustomMocks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ThemeProvider>
  );
}
