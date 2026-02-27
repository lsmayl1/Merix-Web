import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQuery } from "../../baseQuery";

export const StockBatchApiSlice = createApi({
  reducerPath: "stockBatchApi",
  baseQuery,
  endpoints: (build) => ({
    getProductBatches: build.query({
      query: (productId) => ({
        url: `/stock-batches/${productId}`,
      }),
    }),
  }),
});

export const { useGetProductBatchesQuery } = StockBatchApiSlice;
