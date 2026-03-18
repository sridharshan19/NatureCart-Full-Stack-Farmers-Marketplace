import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ToastProvider } from "./components/common/ToastProvider";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <div className="container mx-auto flex-1 px-4 py-6">
            <AppRoutes />
          </div>
          <Footer />
        </div>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
