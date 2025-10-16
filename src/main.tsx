import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./ErrorBoundary.js";
import HomePage from "./pages/HomePage.js";
import SightReading from "./GameScreenComponents/SightReading.js";
import NotFoundPage from "./pages/NotFoundPage.js";
import MainScreen from "./pages/MainScreen.js";
import CustomSettingsPage from "./pages/CustomSettingsPage.js";
import JoinCodePage from "./pages/JoinCodePage.js";
import { Toaster } from "sonner";

const queryClient = new QueryClient();
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainScreen />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "custom", element: <JoinCodePage /> },
      { path: "custom/create", element: <CustomSettingsPage /> },
    ],
    errorElement: <NotFoundPage />,
  },
  {
    path: "/challenge",
    element: <SightReading />,
  },
]);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster
      richColors
      position="bottom-center"
      toastOptions={{
        style: {
          fontSize: "14px",
          borderRadius: "10px",
          padding: "10px 14px",
        },
      }}
    />
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);
