import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import { useGetProductBatchesQuery } from "../../../redux/slices/product/stockBatch";
import { useGetProductSalesQuery } from "../../../redux/slices/metrics/metricsApi";
import { useParams } from "react-router-dom";
import { Table } from "../../Table";

export const ProductSaleList = () => {
  const { id } = useParams();
  const columnHelper = createColumnHelper();
  const { data } = useGetProductSalesQuery(id, {
    skip: !id,
  });

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("sale.date", {
      header: "Date",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("buy_price", {
      header: "Buy Price",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("sell_price", {
      header: "Sell Price",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("quantity", {
      header: "Quantity",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("subtotal", {
      header: "Subtotal",
      cellClassName: "text-center",
    }),
  ];

  return (
    <div>
      <Table data={data} columns={columns} />
    </div>
  );
};
