import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseQuery";

export const MetricsApiSlice = createApi({
  reducerPath: "metricsApiSlice",
  baseQuery,
  endpoints: (build) => ({
    getProductMetrics: build.query({
      query: (id) => `/metrics/products/${id}`,
    }),
    getProductSales: build.query({
      query: (id) => `/metrics/products-sales/${id}`,
    }),
  }),
});

export const { useGetProductMetricsQuery, useGetProductSalesQuery } =
  MetricsApiSlice;
