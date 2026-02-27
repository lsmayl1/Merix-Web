import React, { useState } from "react";
import { CreditCard } from "../../assets/Buttons/CreditCard";
import { Cash } from "../../assets/Buttons/Cash";
import CloseSquare from "../../assets/Navigation/CloseSquare";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { BaseModal } from "../Modal";

export const TransactionModal = ({ handleClose, onSubmit, isOpen }) => {
  const { t } = useTranslation();
  const [transactionType, setTransactionType] = useState("in");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "0",
      description: "",
    },
  });
  const handleTransactionTypeChange = (method) => {
    setTransactionType(method);
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const validateSubmit = (data) => {
    onSubmit({
      ...data,
      transactionType,
      paymentMethod,
    });
  };
  return (
    <BaseModal
      onClose={handleClose}
      isOpen={isOpen}
      children={
        <div className="flex flex-col gap-4">
          <div className="flex  gap-2   rounded-lg">
            <button
              onClick={() => handleTransactionTypeChange("in")}
              className={`${
                transactionType === "in"
                  ? "bg-green-500 text-white"
                  : "border border-mainBorder"
              }  py-2 px-4 rounded-lg w-full`}
            >
              {t("income")}
            </button>
            <button
              onClick={() => handleTransactionTypeChange("out")}
              className={` ${
                transactionType === "out"
                  ? "bg-red-500 text-white"
                  : "border border-mainBorder"
              }
                border border-mainBorder py-2 px-4 w-full rounded-lg`}
            >
              {t("expense")}
            </button>
          </div>
          <form
            className=" flex flex-col gap-6 "
            onSubmit={handleSubmit(validateSubmit)}
          >
            <div className="flex flex-col ">
              <label className="text-md text-mainText">{t("amount")}</label>
              <input
                step={0.001}
                type="number"
                {...register("amount", {
                  required: "Amount is required",
                  min: {
                    value: 0.01,
                    message: "Amount must be greater than 0",
                  },
                })}
                className="border p-2 border-mainBorder rounded-lg"
              />
              {errors?.amount?.message && (
                <p className="text-red-500">{errors.amount.message}</p>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-md text-mainText">{t("description")}</label>
              <input
                type="text"
                {...register("description", {
                  required: "Description is required",
                  maxLength: {
                    value: 255,
                    message: "Description cannot exceed 255 characters",
                  },
                })}
                className="border p-2 border-mainBorder rounded-lg"
              />
              {errors?.description?.message && (
                <p className="text-red-500">{errors.description.message}</p>
              )}
            </div>
            <div className="flex  justify-end w-full gap-2  rounded-lg   font-medium ">
                    <div
                      onClick={() => setPaymentMethod("cash")}
                      className={`flex w-full gap-8 justify-between items-center border cursor-pointer ${
                        paymentMethod === "cash"
                          ? "bg-[#0f172a] text-white"
                          : "border-gray-200"
                      } w-fit p-4 rounded-lg `}
                    >
                      <div className="flex gap-2 items-center">
                        <Cash className="size-6" />
                        <h1>{t("cash")}</h1>{" "}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-md">
                         
                        </span>
                      </div>
                    </div>
            
                    <div
                      onClick={() => setPaymentMethod("card")}
                      className={`flex gap-8 items-center border justify-between cursor-pointer w-full ${
                        paymentMethod === "card"
                          ? "bg-[#0f172a] text-white"
                          : "border-gray-200"
                      } w-fit p-4 rounded-lg `}
                    >
                      <div className="flex gap-2 items-center">
                        <CreditCard className="size-6 mr-2" />
                        <h1>{t("card")}</h1>{" "}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-md">
                        </span>
                      </div>
                    </div>
                  </div>
            <div className="flex justify-end items-center gap-4  ">
          

              <button
                type="submit"
                className="rounded-xl cursor-pointer  max-lg:text-md border border-blue-700 px-4 py-1 font-semibold text-blue-700"
              >
                {t("create")}
              </button>
            </div>
          </form>
        </div>
      }
    ></BaseModal>
  );
};
