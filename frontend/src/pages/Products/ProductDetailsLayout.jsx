import React from "react";
import { NavLink, Outlet, useParams } from "react-router-dom";

import { Table } from "../../components/Table";
import { useGetProductStockMovementQuery } from "../../redux/slices/StockMovementsSlice";
import { createColumnHelper } from "@tanstack/react-table";
import { useGetProductBatchesQuery } from "../../redux/slices/product/stockBatch";
import { KPI } from "../../components/Metric/KPI";
import { useTranslation } from "react-i18next";
import { useGetProductMetricsQuery } from "../../redux/slices/metrics/metricsApi";

export const ProductDetailsLayout = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const tabs = [
    { label: t("Məhsul Məlumatları"), value: "details", path: "details" },
    { label: t("Satışlar"), value: "sales", path: "sales" },
    { label: t("Alımlar"), value: "purchase", path: "purchase" },
  ];
  const { data } = useGetProductMetricsQuery(id, {
    skip: !id,
  });
 

  return (
    <div className="flex flex-col gap-2 w-full h-full min-h-0 rounded-lg ">
      <div className="flex   gap-4 p-2 ">
        <NavLink to={"/products"}>{t("products")} </NavLink>
        <span className="text-gray-500">/</span>
        <h1 className=""> {data?.name}</h1>
      </div>
      <KPI
        data={[
          {
            label: t("Toplam Satış"),
            value: data?.productRevenue,
          },
          {
            label: t("Toplam Qazanc"),
            value: data?.productProfit,
          },
          {
            label: t("Ortalama Aliş Qiymeti"),
            value: data?.avgBuyPrice,
          },
          {
            label: t("Stokda Olan Miqdar"),
            value: data?.totalStock,
          },
          {
            label: t("Ümumi Anbar Dəyəri"),
            value: data?.totalCost,
          },
        ]}
      />
      <div className="w-full bg-white h-full rounded-lg">
        <div className="flex gap-2 p-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.value}
              to={tab.path}
              className={({ isActive }) =>
                `px-4 text-sm py-2 rounded-lg ${isActive && "bg-[#0f172a] text-white"} `
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        <div className="p-2">
          <Outlet id={id} />
        </div>
      </div>
    </div>
  );
};
