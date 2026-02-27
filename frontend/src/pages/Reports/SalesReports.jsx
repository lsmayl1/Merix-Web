import React, { useEffect, useState } from "react";
import { KPI } from "../../components/Metric/KPI";
import { Filters } from "../../assets/Buttons/Filters";
import { FiltersModal } from "../../components/Filters/FiltersModal";
import { Table } from "../../components/Table";
import { createColumnHelper } from "@tanstack/react-table";
import { Details } from "../../assets/Buttons/Details";
import { useLazyPrintSaleReceiptQuery } from "../../redux/slices/ApiSlice";
import {
  useDeleteSaleMutation,
  useGetAllSalesMutation,
  useGetSaleMetricsMutation,
  usePostReturnSaleMutation,
} from "../../redux/slices/sale/saleApiSlice";
import { SaleDetailsModal } from "../../components/Reports/SaleDetailsModal";
import { useTranslation } from "react-i18next";
import TrashBin from "../../assets/Buttons/TrashBin";
import { Cash } from "../../assets/Buttons/Cash";
import { CreditCard } from "../../assets/Buttons/CreditCard";
import { PrintIcon } from "../../assets/Buttons/PrintIcon";
import { toast, ToastContainer } from "react-toastify";
import { useSelector } from "react-redux";
import { BaseModal } from "../../components/Modal";
import Return from "../../assets/Navigation/Return";

export const SalesReports = () => {
  const { t } = useTranslation();
  const range = useSelector((state) => state.dateRangeSlice);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [getSales] = useGetAllSalesMutation();
  const [returnSale] = usePostReturnSaleMutation();
  const [getSaleMetrics] = useGetSaleMetricsMutation();
  const [deleteSale] = useDeleteSaleMutation();
  const [data, setData] = useState([]);
  const [metrics, setMetrics] = useState({});
  const columnHelper = createColumnHelper();

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const columns = [
    // columnHelper.accessor("sale_id", {
    //   header: "ID",
    //   headerClassName: "text-center rounded-s-lg bg-gray-100",
    //   cellClassName: "text-center",
    // }),
    columnHelper.accessor("date", {
      header: t("date"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("subtotalAmount", {
      header: t("Aralıq məbləğ"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
      cell: ({ getValue }) => <span>{getValue()} ₼</span>,
    }),
    columnHelper.accessor("discountedAmount", {
      header: t("Endirim Məbləği"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
      cell: ({ getValue }) => <span>{getValue()} ₼</span>,
    }),
    columnHelper.accessor("totalAmount", {
      header: t("Ümumi Məbləğ"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
      cell: ({ getValue }) => <span>{getValue()} ₼</span>,
    }),
    columnHelper.accessor("transactionType", {
      header: t("Əməliyyat Növü"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
      cell: ({ getValue }) => {
        if (getValue() === "sale") return t("sale");
        if (getValue() === "return") return t("return");
        return getValue();
      },
    }),
    columnHelper.accessor("profit", {
      header: t("profit"),
      headerClassName: "text-center bg-gray-100",
      cellClassName: "text-center",
      cell: ({ getValue }) => <span>{getValue().toFixed(2)} ₼</span>,
    }),
    columnHelper.accessor("return", {
      header: t("return"),
      headerClassName: "text-center bg-gray-100 ",
      cell: ({ row }) => (
        <div cname="flex gap-2 justify-center w-full items-center gap-4">
          {row?.original?.returned ? (
            <>
              <span className="text-red-500 text-sm">{t("Qaytarilib")}</span>
            </>
          ) : row.original.transactionType === "return" ? (
            "Qaytarilma"
          ) : (
            <button
              onClick={() => handleReturnSale(row?.original?.sale_id)}
              className="text-mainText hover:underline"
            >
              <Return className={"size-5 text-red-500"} />
            </button>
          )}
        </div>
      ),

      cellClassName: "text-center",
    }),
    columnHelper.accessor("details", {
      header: t("details"),
      headerClassName: "text-center bg-gray-100",
      cell: ({ row }) => (
        <button
          onClick={() => handleDetails(row?.original?.sale_id)}
          className="text-mainText hover:underline"
        >
          <Details />
        </button>
      ),
      cellClassName: "text-center",
    }),

    // columnHelper.accessor("delete", {
    //   header: t("Print / Delete"),
    //   headerClassName: "text-center bg-gray-100 rounded-e-lg",
    //   cell: ({ row }) => (
    //     <div cname="flex gap-2 justify-center w-full items-center gap-4">
    //       <button
    //         onClick={() => handlePrintReceipt(row?.original?.sale_id)}
    //         className="text-mainText hover:underline mr-4"
    //       >
    //         <PrintIcon className={"text-black size-6"} />
    //       </button>
    //       <button
    //         onClick={() => handleDeleteSale(row?.original?.sale_id)}
    //         className="text-mainText hover:underline"
    //       >
    //         <TrashBin className={"size-6"} />
    //       </button>
    //     </div>
    //   ),

    //   cellClassName: "text-center",
    // }),
  ];

  const [triggerPrintReceipt] = useLazyPrintSaleReceiptQuery();

  const handlePrintReceipt = async (id) => {
    try {
      await triggerPrintReceipt(id).unwrap();
      toast.success(
        t("receiptPrintedSuccessfully") || "Receipt printed successfully",
      );
    } catch (error) {
      console.error("Failed to print receipt:", error);
      toast.error(t("failedToPrintReceipt") || "Failed to print receipt");
    }
  };

  const handleReturnSale = async (id) => {
    try {
      await returnSale(id).unwrap();
      toast.success(
        t("saleReturnedSuccessfully") || "Sale returned successfully",
      );
      await getAllSales();
    } catch (error) {
      console.error("Failed to return sale:", error);
      toast.error(t("failedToReturnSale") || "Failed to return sale");
    }
  };

  const handleDetails = (id) => {
    if (!id) return;
    setSelectedSale(id);
    setShowDetailsModal(true);
  };

  const getAllSales = async () => {
    try {
      const res = await getSales(range).unwrap();
      if (res) {
        setData(res);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getMetrics = async () => {
    try {
      const res = await getSaleMetrics(range).unwrap();
      if (res) {
        setMetrics(res);
      }
    } catch (error) {
      console.log(error);
      setMetrics({});
    }
  };
  const handleDeleteSale = async (id) => {
    try {
      await deleteSale(id).unwrap();
      await getAllSales();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (range.to && range.from) {
      getAllSales();
      getMetrics();
    }
  }, [range]);

  return (
    <div className="flex flex-col gap-2  w-full h-full ">
      <ToastContainer />

      <KPI
        children={
          <div className="flex bg-white rounded-lg px-4   gap-8 justify-center items-center ">
            <div className="flex gap-2 items-center text-xl ">
              <Cash />
              {/* <span>Nagd</span> */}
              <span className="text-nowrap font-semibold text-xl">
                {data?.paymentTotals?.cash || "0.00 ₼" }
              </span>
            </div>
            <span className="text-semibold text-2xl">/</span>
            <div className="flex gap-2 items-center text-xl ">
              <CreditCard />
              {/* <span>Kart</span> */}
              <span className="text-nowrap font-semibold text-xl">
                {data?.paymentTotals?.card || "0.00 ₼"}
              </span>
            </div>
          </div>
        }
        data={[
          {
            label: t("revenue"),
            value: metrics.totalRevenue || 0,
          },
          {
            label: t("sale"),
            value: metrics.totalSales || 0,
          },
          {
            label: t("profit"),
            value: metrics.totalProfit || 0,
          },
        ]}
      />
      {showDetailsModal && (
        <SaleDetailsModal
          saleId={selectedSale}
          isOpen={showDetailsModal}
          handleClose={() => setShowDetailsModal(false)}
        />
      )}
      <div className="flex flex-col gap-2 w-full h-full min-h-0  bg-white rounded-lg  py-2">
        {/* <div className="flex gap-2 items-center justify-between w-full px-2">
          <div className="flex  relative ">
            <button
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className="border bg-white border-gray-200 rounded-xl text-nowrap px-4 cursor-pointer flex items-center gap-2 py-1"
            >
              <Filters />
              {t("filters")}
            </button>
            {showFiltersModal && (
              <FiltersModal handleClose={setShowFiltersModal} />
            )}
          </div>
        </div> */}

        <div className="min-h-0 w-full h-full px-2 ">
          <Table
            columns={columns}
            data={data?.sales}
            // isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
