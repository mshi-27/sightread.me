import SightReading from "./GameScreenComponents/SightReading.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ErrorBoundary from "./ErrorBoundary.js";

const queryClient = new QueryClient();
export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <>
          <SightReading />
        </>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
