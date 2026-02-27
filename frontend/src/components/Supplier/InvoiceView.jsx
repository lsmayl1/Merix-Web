import { createColumnHelper } from "@tanstack/react-table";
import React from "react";
import { Table } from "../Table";
import { CloseIcon } from "../../assets/Buttons/Close";
import { useTranslation } from "react-i18next";
import { BaseModal } from "../Modal";

export const InvoiceView = ({ handleClose, data, isOpen }) => {
  const { t } = useTranslation();
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("name", {
      header: t("name"),
      headerClassName: "text-start",
    }),
    columnHelper.accessor("unit", {
      header: t("unit"),
      cellClassName: "text-center",
      cell: (info) => <span>{t(info.getValue())}</span>,
    }),
    columnHelper.accessor("quantity", {
      header: t("quantity"),
      cellClassName: "text-center",
    }),
    columnHelper.accessor("price", {
      header: t("price"),
      cellClassName: "text-center",
    }),
    columnHelper.accessor("total", {
      header: t("total"),
      cellClassName: "text-center",
    }),
  ];
  if (!data || !data.transaction || !data.details) {
    return;
  }
  return (
    <BaseModal
      onClose={handleClose}
      isOpen={isOpen}
      children={
        <div className="">
          <h1 className="w-full text-center text-lg font-medium ">
            {data?.transaction?.type === "purchase"
              ? t("Alım Qaiməsi ")
              : t("Qaytarılma Qaiməsi ")}
          </h1>
          <div className="flex flex-col  w-full h-full">
            <div className="flex justify-between pb-2">
              <div className="flex flex-col ">
                <h1 className="text-md  text-mainText">
                  {t("Qaimə ID")}
                </h1>
                <span className="text-md  ">#{data?.transaction?.id}</span>
              </div>
              <div className="flex flex-col ">
                <h1 className="text-md text-end text-mainText">
                  {t("date")}
                </h1>
                <span className="text-md">{data?.transaction?.date}</span>
              </div>
            </div>
            <div className="min-h-0 h-full max-h-[500px]  overflow-auto ">
              <Table
                columns={columns}
                data={data?.details}
                pagination={false}
              />
            </div>
            <div className="flex justify-end gap-4 items-center mt-4">
              <span className="text-lg ">
                {t("Yekun ")}
              </span>
              <span className="text-lg ">
                {data?.transaction?.amount || 0.0}
              </span>
            </div>
          </div>
        </div>
      }
    ></BaseModal>
  );
};
