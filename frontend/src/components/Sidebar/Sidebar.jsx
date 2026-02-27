import React, { useEffect, useState } from "react";
import Dashboard from "../../assets/Sidebar/Dashboard";
import Box from "../../assets/Sidebar/Box";
import Reports from "../../assets/Sidebar/Reports";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Kart } from "../../assets/Sidebar/Kart";
import { useTranslation } from "react-i18next";
import StockBox from "../../assets/Sidebar/StockBox.jsx";
import Suppliers from "../../assets/Sidebar/Suppliers";
import Logo from "../../assets/Logo/LogoMain.jsx";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/slices/auth/authService.js";
import { Logout } from "../../assets/Buttons/Logout.jsx";
import { Employee } from "../../assets/Sidebar/Employee.jsx";
import LogoName from "../../assets/Logo/LogoName.jsx";

export const Sidebar = ({ className, handleClose }) => {
  const { t } = useTranslation();
  const path = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [width, setWidth] = useState(window.innerWidth);

  const links = [
    {
      name: t("dashboard"),
      blank: false,
      path: "",
      icon: <Dashboard />,
      roles: ["admin"],
    },
    {
      name: t("products"),
      blank: false,
      path: "products",
      icon: <Box />,
      roles: ["admin"],
    },
    // {
    //   name: t("stockMovements"),
    //   blank: false,
    //   path: "stock-movements",
    //   icon: <StockBox />,
    //   roles: ["admin"],
    // },
    {
      name: t("reports"),
      blank: false,
      icon: <Reports />,
      path: "reports",
      roles: ["admin", "user"],
    },
    {
      name: t("supplier"),
      blank: true,
      path: "supplier/all",
      icon: <Suppliers />,
      roles: ["admin"],
    },
    // {
    //   name: t("employye"),
    //   path: "employee",
    //   icon: <Employee />,
    // },

    {
      name: t("pos"),
      blank: true,
      path: "pos",
      icon: <Kart />,
      roles: ["admin", "user"],
    },
  ];
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  useEffect(() => {
    if (path.pathname === "/pos" || width < 425) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [path, width]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  return (
    <div
      className={` bg-white border-r-gray-100 border-r z-50 gap-8 max-md:left-0 max-md:bg-white  flex  pt-8 h-screen   flex-col px-4 max-md:px-2 ${className}
      `}
    >
      <NavLink
        to={"/"}
        className={`flex items-center gap-2 ${collapsed ? "justify-center" : ""}`}
      >
        {!collapsed ? (
          <LogoName className="text-black  w-28 max-md:w-14" />
        ) : (
          <Logo className="size-10 max-md:size-8" />
        )}
      </NavLink>
      <ul className={`flex   flex-col gap-2`}>
        {links.map((link, index) => (
          <div className="flex flex-col gap-1  " key={index}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-4 border-mainBorder py-2 ${
                  isActive
                    ? "bg-[#0f172a] border border-mainBorder"
                    : "hover:bg-white"
                } px-2 rounded-lg transition-colors duration-200`
              }
            >
              {({ isActive }) => (
                <>
                  {link.icon &&
                    React.cloneElement(link.icon, {
                      className: ` size-7 max-md:size-6 ${
                        !isActive ? "text-black" : "text-white"
                      } `,
                    })}
                  {!collapsed && (
                    <span
                      className={`${
                        !isActive ? "text-black" : "text-white"
                      } text-md max-md:text-md font-medium text-nowrap`}
                    >
                      {link.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </div>
        ))}
      </ul>
      <div className="h-full flex items-end pb-4 ">
        <button
          onClick={handleLogout}
          className=" bg-red-500 text-white text-sm p-2 rounded-lg text-nowrap flex gap-2 items-center"
        >
          <Logout />
        </button>
      </div>
    </div>
  );
};
