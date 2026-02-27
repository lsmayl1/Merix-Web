import React, { useState } from "react";
import { Table } from "../../components/Table";
import { createColumnHelper } from "@tanstack/react-table";
import {
  useGetAllSupplierTransactionsQuery,
  useGetSupplierInvoiceMutation,
} from "../../redux/slices/SupplierSlice";
import { useTranslation } from "react-i18next";
import { InvoiceView } from "../../components/Supplier/InvoiceView";

export const LastTransactions = () => {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper();
  const { data } = useGetAllSupplierTransactionsQuery();
  const [getSupplierInvociceData] = useGetSupplierInvoiceMutation();
  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const handleOpenDetails = async (id) => {
    try {
      const transaction = await getSupplierInvociceData({
        transaction_id: id,
      }).unwrap();
      setSelectedInvoice(transaction);
      setDetailsModal(true);
    } catch (error) {
      console.error("Failed to fetch invoice details:", error);
    }
  };
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("supplier.name", {
      header: "Təchizatçı",
      headerClassName: "text-start",
    }),
    columnHelper.accessor("date", {
      header: "Tarix",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("amount", {
      header: "Ümumi məbləğ",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("payment_method", {
      header: "Ödəmə metodu",
      cellClassName: "text-center",
      cell: (info) => <span>{t(info.getValue())}</span>,
    }),
    columnHelper.accessor("type", {
      header: "Növ",
      cellClassName: "text-center",
      cell: (info) => <span>{t(info.getValue())}</span>,
    }),
    columnHelper.accessor("details", {
      header: "Ətraflı",
      cellClassName: "text-center",
      cell: ({ row }) => (
        <button
          onClick={() => handleOpenDetails(row.original.id)}
          className="px-4 py-1 bg-blue-500 text-white rounded-lg"
        >
          {t("Bax")}
        </button>
      ),
      enableSorting: false,
      enableColumnFilter: false,
    }),
  ];
  return (
    <div className="flex bg-white w-full h-full rounded-lg p-2">
      {detailsModal && (
        <InvoiceView
          isOpen={detailsModal}
          data={selectedInvoice}
          handleClose={() => setDetailsModal(false)}
        />
      )}
      <Table columns={columns} data={data} />
    </div>
  );
};
