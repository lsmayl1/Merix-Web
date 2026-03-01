import React, { useState } from "react";
import { Setting } from "../../assets/Buttons/Setting";
import { Bell } from "../../assets/Buttons/Bell";
import Profile from "../../assets/Navigation/Profile";
import { useTranslation } from "react-i18next";
import { UsaFlag } from "../../assets/Languages/en";
import { AzerbaijanFlag } from "../../assets/Languages/az";
import { DateRange } from "../Date/DateRange";
import { useDispatch, useSelector } from "react-redux";
import { Logout } from "../../assets/Buttons/Logout";
import { logout } from "../../redux/slices/auth/authService";
import { useNavigate } from "react-router-dom";
export const Header = () => {
  const { t, i18n } = useTranslation();
  const [showLanguageDropDown, setShowLanguageDropDown] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { username, email } = useSelector((state) => state.authService);
  const [profileDropDown, setProfileDropDown] = useState(false);
  const languages = [
    { name: "English", key: "en", icon: <UsaFlag /> },
    { name: "Azerbaycan", key: "az", icon: <AzerbaijanFlag /> },
  ];

  const language = languages.find((x) => x.key == i18n.language);
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
    setShowLanguageDropDown(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  return (
    <div className="w-full  p-2 rounded-lg  bg-white flex justify-between  items-center">
      <DateRange />
      <div className="flex items-center justify-between px-4 gap-4">
        <div className=" w-full  relative">
          <button
            onClick={() => setShowLanguageDropDown(!showLanguageDropDown)}
            className="border-mainBorder text-black border p-2 rounded-lg flex gap-4 items-center"
          >
            {language.icon}
          </button>
          {showLanguageDropDown && (
            <ul className="flex w-[250%] z-50 text-black top-11 border border-mainBorder rounded-lg  flex-col  bg-white absolute ">
              {languages.map((lg) => (
                <button
                  key={lg.key}
                  onClick={() => changeLanguage(lg.key)}
                  className="px-2  text-sm text-start py-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  {lg.name}
                </button>
              ))}
            </ul>
          )}
        </div>
        <div className="flex  gap-4 items-center">
          <Setting className={"text-black stroke-black size-6 "} />
          <Bell className={" size-6"} />
        </div>

        <div className="flex gap-2 items-center relative">
          <div onClick={() => setProfileDropDown(!profileDropDown)} className="flex gap-2 cursor-pointer">
            <span>
              <Profile className={"size-7"} />
            </span>
            <div className="flex flex-col ">
              <h1 className=" font-medium text-xs">{username}</h1>
              <p className="text-gray-400 text-xs">{email}</p>
            </div>
          </div>
          {profileDropDown && (
            <div className="bg-white border rounded-lg border-mainBorder w-full absolute p-2 top-9 z-50">
              <div
                className="flex gap-2 text-red-500 hover:cursor-pointer items-center"
                onClick={handleLogout}
              >
                <Logout className={"size-4"} /> <span className="text-sm">Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
