import { createBrowserRouter } from "react-router";
import { LoginPage } from "./pages/LoginPage";
import { DashboardLayout } from "./components/DashboardLayout";
import { OverviewPage } from "./pages/OverviewPage";
import { DeliveriesPage } from "./pages/DeliveriesPage";
import { VendorsPage } from "./pages/VendorsPage";
import { VendorMenuPage } from "./pages/VendorMenuPage";
import { VendorOrdersPage } from "./pages/VendorOrdersPage";
import { EnvironmentalPage } from "./pages/EnvironmentalPage";
import { SettingsPage } from "./pages/SettingsPage";
import { DronesPage } from "./pages/DronesPage";
import { FlightControlPage } from "./pages/FlightControlPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: OverviewPage },
      { path: "deliveries", Component: DeliveriesPage },
      { path: "drones", Component: DronesPage },
      { path: "vendors", Component: VendorsPage },
      { path: "flight-control", Component: FlightControlPage },
      { path: "vendors/:vendorId/menu", Component: VendorMenuPage },
      { path: "vendors/:vendorId/orders", Component: VendorOrdersPage },
      { path: "environmental", Component: EnvironmentalPage },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
