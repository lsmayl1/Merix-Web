import { configureStore } from "@reduxjs/toolkit";
import { ApiSlice } from "./slices/ApiSlice";
import { CashMovementSlice } from "./slices/CashMovementSlice";
import { StockMovementsSlice } from "./slices/StockMovementsSlice";
import { SupplierSlice } from "./slices/SupplierSlice";
import { CategorySlice } from "./slices/CategorySlice";
import supplierTransactionReducer from "./supplierTransactions/supplierTransaction.slice";
import { productsSlice } from "./products/products.slice";
import { ProductShortcutsApiSlice } from "./slices/productsShortcuts/ProductShortcutsSlice";
import { AuthApi } from "./slices/auth/AuthSlice";
import { authService } from "./slices/auth/authService";
import { dateRangeSlice } from "./dateRange/dateRangeSlice";
import { userApiSlice } from "./slices/user/userApiSlice";
import { SaleApiSlice } from "./slices/sale/saleApiSlice";
import { StockBatchApiSlice } from "./slices/product/stockBatch";
import { MetricsApiSlice } from "./slices/metrics/metricsApi";
export const store = configureStore({
  reducer: {
    [ApiSlice.reducerPath]: ApiSlice.reducer,
    [StockBatchApiSlice.reducerPath]: StockBatchApiSlice.reducer,
    [CashMovementSlice.reducerPath]: CashMovementSlice.reducer,
    [StockMovementsSlice.reducerPath]: StockMovementsSlice.reducer,
    [SupplierSlice.reducerPath]: SupplierSlice.reducer,
    [CategorySlice.reducerPath]: CategorySlice.reducer,
    [ProductShortcutsApiSlice.reducerPath]: ProductShortcutsApiSlice.reducer,
    [AuthApi.reducerPath]: AuthApi.reducer,
    [userApiSlice.reducerPath]: userApiSlice.reducer,
    [SaleApiSlice.reducerPath]: SaleApiSlice.reducer,
    [MetricsApiSlice.reducerPath]: MetricsApiSlice.reducer,
    dateRangeSlice: dateRangeSlice.reducer,
    supplierTransaction: supplierTransactionReducer,
    products: productsSlice.reducer,
    authService: authService.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      ApiSlice.middleware,
      StockBatchApiSlice.middleware,
      CashMovementSlice.middleware,
      StockMovementsSlice.middleware,
      SupplierSlice.middleware,
      CategorySlice.middleware,
      ProductShortcutsApiSlice.middleware,
      AuthApi.middleware,
      userApiSlice.middleware,
      SaleApiSlice.middleware,
      MetricsApiSlice.middleware,
    ),
});
