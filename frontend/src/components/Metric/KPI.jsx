import React from "react";

export const KPI = ({ data, children, className }) => {
  return (
    <div
      className={`grid max-md:flex max-md:flex-col max-md:grid-cols-2  gap-2 max-md:gap-1 w-full`}
      style={{
        gridTemplateColumns: `repeat(${children ? data?.length + 1 : data?.length || 1}, minmax(0, 1fr))`,
      }}
    >
      {data.map((item, index) => (
        <div
          key={index}
          className={`bg-white w-full max-md:text-xs  h-full justify-between px-4 py-4  rounded-lg flex flex-col gap-2 ${className} `}
        >
          <label className="text-mainText max-md:text-xs text-nowrap max-md:font-regular font-medium capitalize">
            {item.label}
          </label>
          <span className="text-2xl font-semibold max-md:text-xl  text-nowrap">
            {item.value || 0}
          </span>
        </div>
      ))}
      {children}
    </div>
  );
};
