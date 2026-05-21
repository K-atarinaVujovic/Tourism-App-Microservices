import { Outlet } from "react-router";
import Navbar from "./Navbar";

export default function RootLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
