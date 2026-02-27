// services/baseQuery.ts
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const API = "http://localhost:5000/api";
export const baseQuery = fetchBaseQuery({
  baseUrl: API,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().authService.token; // store içinden alıyoruz

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return headers;
  },
});
