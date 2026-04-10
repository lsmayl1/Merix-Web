import React, { useEffect } from "react";
import "./style/index.css";
import { Navigate, Route, Router, Routes, useNavigate } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { Layout } from "./components/layout/Layout";
import { SalesReports } from "./pages/Reports/SalesReports";
import { Products } from "./pages/Products/Products";
import { ProductReports } from "./pages/Reports/ProductReports";
import { ReportsLayout } from "./components/layout/ReportsLayout";
import { CashMovements } from "./pages/Reports/CashMovements";
import { StockMovements } from "./pages/Stock/StockMovements";
import { ProductDetailsLayout } from "./pages/Products/ProductDetailsLayout";
import { Suppliers } from "./pages/Suppliers";
import { SupplierDetails } from "./pages/Suppliers/SupplierDetails";
import { Category } from "./pages/Category/Category";
import { CategoryDetails } from "./pages/Category/CategoryDetails";
import { Login } from "./pages/auth/login";
import { Pos } from "./pages/Pos";
import { Register } from "./pages/auth/register";
import { PrivateRoute } from "./routes/privateRoute";
import { CashierLogin } from "./pages/auth/Cashier";
import { Employee } from "./pages/Employee";
import { ShiftReport } from "./pages/Reports/shiftReport";
import { SupplierLayout } from "./components/layout/SupplierLayout";
import { Invoice } from "./assets/Navigation/Invoice";
import { Invoices } from "./pages/Suppliers/Invoices";
import { ProductDetails } from "./components/Products/productDetails";
import { ProductSaleList } from "./components/Products/productDetails/productSaleList";
import { useDispatch, useSelector } from "react-redux";
import { useGetSessionDataQuery } from "./redux/slices/user/userApiSlice";
import { setUserData } from "./redux/slices/auth/authService";
import HomePage from "./pages/home";
export const App = () => {
  // const { token } = useSelector((state) => state.authService);
  // const dispatch = useDispatch();
  // const { data, isSuccess, isLoading, error, isError } = useGetSessionDataQuery(
  //   undefined,
  //   {
  //     skip: !token,
  //   },
  // );
  // const navigate = useNavigate();
  // useEffect(() => {
  //   if (isSuccess && data && isLoading === false) {
  //     dispatch(setUserData(data));
  //   } else if (isError && error.data.message === "Invalid token") {
  //     navigate("/login");
  //   }
  // }, [data, isSuccess, error, isError]);

  // if (isLoading) {
  //   return (
  //     <div className="flex h-screen w-full items-center justify-center">
  //       <h1 className="font-poppins text-24">Loading...</h1>
  //     </div>
  //   );
  // }

  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/c" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />

          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetailsLayout />}>
            <Route index element={<Navigate to="details" replace />} />
            <Route path="details" element={<ProductDetails />} />
            <Route path="sales" element={<ProductSaleList />} />
            <Route path="purchase" element={<div>Batches</div>} />
          </Route>

          <Route path="category" element={<Category />} />
          <Route path="category/:id" element={<CategoryDetails />} />

          <Route path="stock-movements" element={<StockMovements />} />

          <Route path="shift-report" element={<ShiftReport />} />

          <Route path="reports" element={<ReportsLayout />}>
            <Route index element={<Navigate to="sale" replace />} />
            <Route index path="sale" element={<SalesReports />} />
            <Route path="products" element={<ProductReports />} />
            <Route path="cash-movements" element={<CashMovements />} />
            <Route path="shifts" element={<ShiftReport />} />
          </Route>
          <Route path="supplier" element={<SupplierLayout />}>
            <Route index element={<Navigate to="suppliers" replace />} />
            <Route path="all" element={<Suppliers />} />
            <Route path="invoices" element={<Invoices />} />
          </Route>
          <Route path="suppliers/:id" element={<SupplierDetails />} />
          <Route path="employee" element={<Employee />} />
          <Route path="pos" element={<Pos />} />
        </Route>
      </Route>

      <Route path="login" element={<Login />} />
      <Route path="cashier-login" element={<CashierLogin />} />

      <Route path="register" element={<Register />} />
    </Routes>
  );
};
