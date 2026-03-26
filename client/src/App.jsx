import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./components/common/ToastProvider";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="app-shell flex min-h-screen flex-col">
          <Navbar />
          <main className="page-frame flex-1 py-6 md:py-8">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
