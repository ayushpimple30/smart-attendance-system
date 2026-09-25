import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./components/AppLayout";
import Home from "./pages/Home";
import RegisterStudent from "./pages/RegisterStudent";
import LiveAttendance from "./pages/LiveAttendance";
import AttendanceHistory from "./pages/AttendanceHistory";
import About from "./pages/About";

function Router() {
  return (
    <Switch>
      <Route path="/register">
        {() => (
          <AppLayout>
            <RegisterStudent />
          </AppLayout>
        )}
      </Route>
      <Route path="/attendance">
        {() => (
          <AppLayout>
            <LiveAttendance />
          </AppLayout>
        )}
      </Route>
      <Route path="/history">
        {() => (
          <AppLayout>
            <AttendanceHistory />
          </AppLayout>
        )}
      </Route>
      <Route path="/about">
        {() => (
          <AppLayout>
            <About />
          </AppLayout>
        )}
      </Route>
      <Route path="/" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
