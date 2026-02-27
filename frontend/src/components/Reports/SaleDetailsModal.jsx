import React from "react";
import { Table } from "../Table";
import { createColumnHelper } from "@tanstack/react-table";
import { useGetSaleByIdQuery } from "../../redux/slices/sale/saleApiSlice";
import { useTranslation } from "react-i18next";
import { CloseIcon } from "../../assets/Buttons/Close";
import { BaseModal } from "../Modal";

export const SaleDetailsModal = ({ saleId, handleClose, isOpen }) => {
  const { t } = useTranslation();
  const { data } = useGetSaleByIdQuery(saleId, {
    skip: !saleId,
  });
  const columnHelper = createColumnHelper();
  const column = [
    columnHelper.accessor("name", {
      header: t("product"),
      headerClassName: "text-start",
      cellClassName: "text-start",
    }),
    columnHelper.accessor("sellPrice", {
      header: t("price"),
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("quantity", {
      header: t("quantity"),
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
    columnHelper.accessor("subtotal", {
      header: t("subtotal"),
      headerClassName: "text-center",
      cellClassName: "text-center",
    }),
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      children={
        <div className="flex  min-h-0 top-0  flex-col px-6 ">
          <h1 className="w-full text-center font-semibold text-xl">
            {t("Satış Qaiməsi")}
          </h1>
          <div className="gap-12 flex flex-col" >
            <div className="flex flex-col gap-2">
              <div className="flex justify-between pb-4 border-b border-mainBorder ">
                <div className="flex flex-col ">
                  <h1 className="text-md font-semibold text-mainText">
                    {t("Satış ID")}
                  </h1>
                  <span className="text-md  ">
                    #{data?.saleId.slice(0, 15)}
                  </span>
                </div>
                <div className="flex flex-col ">
                  <h1 className="text-md font-semibold text-end text-mainText">
                    {t("date")}
                  </h1>
                  <span className="text-md">{data?.date}</span>
                </div>
              </div>
              <div className="min-h-0 max-h-[200px] overflow-auto ">
                <Table
                  columns={column}
                  data={data?.details}
                  pagination={false}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 ">
              <div className="flex justify-between text-md font-semibold">
                <span className="text-mainText">Aralıq məbləğ</span>
                <span>{data?.subtotalAmount}</span>
              </div>
              <div className="flex justify-between text-md font-semibold border-b border-mainBorder pb-2">
                <span className="text-mainText">{t("Endirim")}</span>
                <span>{data?.discountedAmount}</span>
              </div>
              <div className="flex justify-between items-center  ">
                <span className="text-md text-mainText font-semibold">
                  Yekun məbləğ
                </span>
                <span className="text-md font-semibold">
                  {data?.totalAmount}
                </span>
              </div>
              <div className="flex flex-col text-md font-semibold pt-4">
                <span className="">Ödəniş üsulu</span>
                {data?.payments.map((payment, i) => (
                  <div className="flex justify-between " key={i}>
                    <span className="text-mainText">
                      {" "}
                      {payment?.payment_type === "cash" ? t("cash") : t("card")}
                    </span>

                    <span>{payment.amount + ""}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      }
    />
  );
};
