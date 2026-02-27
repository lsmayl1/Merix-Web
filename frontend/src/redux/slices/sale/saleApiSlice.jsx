import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseQuery";

export const SaleApiSlice = createApi({
  reducerPath: "saleApi",
  baseQuery,
  
  endpoints: (build) => ({
    getAllSales: build.mutation({
      query: (data) => ({
        url: "sales",
        method: "POST",
        body: data,
      }),
    }),
    getSaleById: build.query({
      query: (id) => `sales/${id}`,
    }),
    postSalePreview: build.mutation({
      query: (data) => ({
        url: "sales/preview",
        method: "POST",
        body: data,
      }),
    }),
    postSale: build.mutation({
      query: (sale) => ({
        url: "sales/create",
        method: "POST",
        body: sale,
      }),
    }),
    postReturnSale: build.mutation({
      query: (saleId) => ({
        url: `sales/return/${saleId}`,
        method: "POST",
      }),
    }),
    deleteSale: build.mutation({
      query: (id) => ({
        url: `sales/delete/${id}`,
        method: "DELETE",
      }),
    }),
    getSaleMetrics: build.mutation({
      query: (data) => ({
        url: "metrics/sale",
        method: "POST",
        body: data,
      }),
    }),
    getBestSellers: build.query({
      query: () => `metrics/bestSellers`,
    }),
    printSaleReceipt: build.query({
      query: (id) => ({
        url: `/printer/sale-receipt/${id}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetAllSalesMutation,
  useGetSaleByIdQuery,
  usePostSalePreviewMutation,
  usePostSaleMutation,
  usePostReturnSaleMutation,
  useDeleteSaleMutation,
  useGetSaleMetricsMutation,
  useGetDailyRevenueQuery,
  useGetDailyProfitQuery,
  useGetHourlyRevenueQuery,
} = SaleApiSlice;
