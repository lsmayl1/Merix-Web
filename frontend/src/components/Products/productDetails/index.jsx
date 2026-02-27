import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ToastContainer } from "react-toastify";
import Generate from "../../../assets/Buttons/Generate";
import { KPI } from "../../Metric/KPI";
import { MainButton } from "../../Buttons";
import {
  useGetProductByIdQuery,
  usePutProductByIdMutation,
} from "../../../redux/slices/ApiSlice";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

export const ProductDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data, refetch } = useGetProductByIdQuery(id, {
    skip: !id,
  });
  const [updateProduct] = usePutProductByIdMutation();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      buyPrice: 0.0,
      sellPrice: 0.0,
      unit: "piece",
      barcode: null,
    },
  });

  useEffect(() => {
    if (data) {
      setValue("name", data.name);
      setValue("buyPrice", data.buyPrice);
      setValue("sellPrice", data.sellPrice);
      setValue("unit", data.unit);
      setValue("barcode", data.barcode);
    }
  }, [data]);

  const handleUpdateProduct = async (data) => {
    try {
      await updateProduct({
        ...data,
        product_id: id,
      }).unwrap();

      await refetch();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className={`flex items-center   justify-center max-md:p-0 w-full flex-col`}
    >
      <ToastContainer />

      {/* Form Fields */}
      <form
        onSubmit={handleSubmit(handleUpdateProduct)}
        className={`flex flex-col w-9/12 justify-center items-center max-md:gap-8 gap-10 p-8 `}
      >
        <div className="flex w-full gap-8">
          <div className="flex justify-between items-end w-full ">
            <div className="flex flex-col w-full gap-1 ">
              <label htmlFor="name" className="text-md max-lg:text-md">
                {t("name")}
              </label>
              <input
                // ref={nameInputRef}
                id="name"
                {...register("name", { required: "Name Required" })}
                className="rounded-lg focus:outline-blue-500  border py-1 border-mainBorder px-2"
              />
              <p className="text-red-500 text-sm">{errors?.name?.message}</p>
            </div>
          </div>
          {/* Prices */}
          <div className="flex  gap-2 max-md:flex-col w-full items-start justify-start">
            <div className="flex w-full gap-1   rounded-lg flex-col">
              <label className="text-md">{t("buyPrice")}</label>
              <div className="flex w-full gap-2 relative ">
                <input
                  type="number"
                  step={0.0001}
                  {...register("buyPrice", {
                    required: "Buy Price Required",
                    validate: (value) =>
                      parseFloat(value) > 0 ||
                      "Buy Price must be greater than 0",
                  })}
                  className=" border  w-full border-mainBorder rounded-lg px-2 py-1 focus:outline-blue-500"
                />
                <span className="px-2 text-xl absolute right-0">₼</span>
              </div>
              <p className="text-red-500 text-xs">
                {errors?.buyPrice?.message}
              </p>
            </div>
            <div className="flex gap-1  w-full rounded-lg flex-col">
              <label className="text-md">{t("sellPrice")}</label>
              <div className="flex w-full gap-2 relative ">
                <input
                  type="number"
                  step={0.0001}
                  {...register("sellPrice", {
                    required: "Sell Price Required",
                    validate: (value) =>
                      parseFloat(value) > 0 ||
                      "Sell Price must be greater than 0",
                  })}
                  className=" border  w-full  border-mainBorder rounded-lg px-2 py-1 focus:outline-blue-500"
                />
                <span className="px-2 text-xl absolute right-0">₼</span>
              </div>
              <p className="text-red-500 text-xs">
                {errors?.sellPrice?.message}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col  gap-10 w-full">
          {/* Unit Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-md max-lg:text-md">{t("unit")}</label>
            <div className="flex bg-gray-400 text-gray-700 p-1  rounded-lg border w-fit border-mainBorder ">
              <button
                type="button"
                onClick={() => setValue("unit", "piece")}
                className={`px-4 py-1 cursor-pointer font-semibold  ${
                  watch("unit") === "piece"
                    ? "bg-white text-black rounded-lg"
                    : ""
                }`}
              >
                {t("piece")}
              </button>
              <button
                type="button"
                onClick={() => setValue("unit", "kg")}
                className={` px-8 py-1 cursor-pointer font-semibold ${
                  watch("unit") === "kg" ? "bg-white text-black rounded-lg" : ""
                }`}
              >
                KG
              </button>
            </div>
          </div>

          {/* Barcode */}
          <div className="flex  w-1/2 flex-col max-lg:w-full gap-1 ">
            <label className="text-md max-lg:text-md">{t("barcode")}</label>
            <div className="flex items-center gap-1 max-lg:justify-between w-full">
              <div className="flex  flex-col gap-2 w-full">
                <input
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  type="text"
                  {...register("barcode", {
                    required: "Barcode Required",
                    pattern: {
                      value: /^[0-9]+$/,
                      message: "Barcode must be numeric",
                    },
                  })}
                  className=" rounded-lg border w-full border-mainBorder py-1 px-2 focus:outline-blue-500 bg-[#f8fafc]"
                />
                {errors?.barcode && (
                  <p className="text-red-500 text-sm">
                    {errors?.barcode?.message}
                  </p>
                )}
              </div>
              <button
                type={"button"}
                // onClick={handleBarcode}
                className="cursor-pointer h-full py-1 px-2 rounded-lg bg-blue-500  text-white"
              >
                <Generate className={"size-6"} />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex justify-end">
          <MainButton type="submit" title={"update"} />
        </div>
      </form>
    </div>
  );
};
