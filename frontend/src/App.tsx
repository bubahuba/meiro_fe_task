import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import { useAppRoutes } from "./routes";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline, createTheme, useMediaQuery } from "@mui/material";
import { useMemo } from "react";

const queryClient = new QueryClient();

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? "dark" : "light",
        },
      }),
    [prefersDarkMode]
  );
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {useAppRoutes()}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
