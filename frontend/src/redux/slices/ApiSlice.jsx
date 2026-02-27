import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../baseQuery";

export const ApiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  endpoints: (build) => ({
    // Product
    getProducts: build.query({
      query: ({ page = 1, sort = "asc", limit }) =>
        `/products?page=${page}&sort=${sort}&limit=${limit}`,
      keepUnusedDataFor: 0,
    }),
    getProductById: build.query({
      query: (id) => ({
        url: `/products/${id}`,
      }),
      keepUnusedDataFor: 0,
    }),
    postProduct: build.mutation({
      query: (newProduct) => ({
        url: "products",
        method: "POST",
        body: newProduct,
      }),
    }),
    putProductById: build.mutation({
      query: (updatedProduct) => ({
        url: `/products/${updatedProduct.product_id}`,
        method: "PUT",
        body: updatedProduct,
      }),
    }),
    getBarcode: build.mutation({
      query: (unit) => ({
        url: "/products/generate-barcode",
        method: "POST",
        body: unit,
      }),
    }),
    printProductLabel: build.mutation({
      query: (product) => ({
        url: "printer/label-print",
        method: "POST",
        body: product,
      }),
    }),
    getProductsByQuery: build.query({
      query: (query) => ({
        url: `/products/search/?query=${query}`,
      }),
    }),
    deleteProductById: build.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
    }),
    getBulkProduct: build.mutation({
      query: (id) => ({
        url: "products/bulk",
        method: "POST",
        body: id,
      }),
    }),

    getProductsReport: build.mutation({
      query: (data) => ({
        url: "reports/sold-products",
        method: "POST",
        body: data,
      }),
    }),

    getProductSoldMetrics: build.mutation({
      query: (data) => ({
        url: "metrics/products-sold",
        method: "POST",
        body: data,
      }),
    }),
    getProductsMetrics: build.query({
      query: () => "metrics/products",
    }),
    getDashboardMetrics: build.mutation({
      query: (data) => ({
        url: "metrics/dashboard",
        method: "POST",
        body: data,
      }),
    }),

    getDailyRevenue: build.query({
      query: (query) => `metrics/revenue?type=${query}`,
    }),
    getDailyProfit: build.query({
      query: (query) => `metrics/profit?type=${query}`,
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
  useGetProductsQuery,
  usePostProductMutation,
  useGetBarcodeMutation,
  useGetProductsByQueryQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
  usePutProductByIdMutation,
  useDeleteProductByIdMutation,
  useGetBulkProductMutation,
  useGetProductsReportMutation,
  useGetProductSoldMetricsMutation,
  useGetProductsMetricsQuery,
  useGetDashboardMetricsMutation,
  useGetBestSellersQuery,

  useGetDailyRevenueQuery,
  useGetDailyProfitQuery,
  useGetHourlyRevenueQuery,
  usePrintProductLabelMutation,

  useLazyPrintSaleReceiptQuery,
} = ApiSlice;
