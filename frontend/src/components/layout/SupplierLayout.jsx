import React from "react";
import { useTranslation } from "react-i18next";
import { Navigate, NavLink, Outlet } from "react-router-dom";
import { DateRange } from "../Date/DateRange";

export const SupplierLayout = () => {
  const { t } = useTranslation();
  const taskbar = [
    {
      name: "Təchizatçılar",
      path: "all",
    },
    {
      name: "Son alınan məhsullar",
      path: "invoices",
    },
    {
      name: "Son ödənişlər",
      path: "/reports/products",
    },
  ];
  return (
    <div className="w-full h-full flex flex-col relative ">
      <div className="bg-white rounded-lg p-4 flex gap-4 items-center">
        <ul className="flex gap-4">
          {taskbar.map((tb, index) => (
            <NavLink
              to={tb.path}
              key={index}
              className={({ isActive }) =>
                `${isActive ? "bg-[#0f172a] text-white" : ""} text-nowrap py-2 px-4 rounded-lg`
              }
            >
              <span></span> {tb.name}
            </NavLink>
          ))}
        </ul>
        <DateRange />
      </div>
      <Outlet />
    </div>
  );
};
