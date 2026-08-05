import type { MetaFunction } from "react-router";
import { Outlet } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "Lifestyle - ToolHub" },
    { name: "description", content: "Pomodoro timer, random quotes and other everyday helpers." },
  ];
};

export default function LifestyleLayout() {
  return <Outlet />;
}
