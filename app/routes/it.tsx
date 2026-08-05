import type { MetaFunction } from "react-router";
import { Outlet } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "IT Tools - ToolHub" },
    { name: "description", content: "Developer tools: JSON, text diff, markdown, images, API testing and more." },
  ];
};

export default function ITLayout() {
  return <Outlet />;
}
