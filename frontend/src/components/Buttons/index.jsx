import React from "react";
import { useTranslation } from "react-i18next";

export const MainButton = ({ handleClick, title, type = "create" }) => {
  const { t } = useTranslation();
  return (
    <div className=" text-nowrap ">
      <button
        className={`${type === "create" ? "bg-blue-600" : "bg-red-500"} text-white p-1.5 px-4 rounded-lg`}
        onClick={handleClick}
      >
        {t(title)}
      </button>
    </div>
  );
};
