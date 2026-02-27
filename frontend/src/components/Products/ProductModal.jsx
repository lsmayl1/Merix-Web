import React, { useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useMediaQuery } from "react-responsive";
import { useForm } from "react-hook-form";
import { useGetBarcodeMutation } from "../../redux/slices/ApiSlice";
import Generate from "../../assets/Buttons/Generate";
import { useTranslation } from "react-i18next";
import { BaseModal } from "../Modal";
import { MainButton } from "../Buttons";
export const ProductModal = ({
  handleClose,
  isEditMode,
  editForm,
  handleDelete,
  handleUpdateProduct,
  handleAddProduct,
  isOpen,
}) => {
  const { t } = useTranslation();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [newStock, setNewStock] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(
    editForm?.category ? editForm?.category : null,
  );
  const [getBarcode, { isLoading: barcodeLoading, isError: barcodeError }] =
    useGetBarcodeMutation();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      product_id: editForm?.product_id,
      name: editForm?.name || "",
      unit: editForm?.unit || "piece",
      barcode: editForm?.barcode || null,
      buyPrice: editForm?.buyPrice || 0.0,
      sellPrice: editForm?.sellPrice || 0.0,
      stock: editForm?.stock || 0,
    },
  });
  const nameInputRef = useRef(null);
  const handleProductCrud = async (data) => {
    if (isEditMode) {
      handleUpdateProduct({
        ...data,
        newStock,
        category_id: selectedCategory?.category_id
          ? selectedCategory?.category_id
          : null,
      });
    } else {
      handleAddProduct({
        ...data,
        newStock,
        category_id: selectedCategory?.category_id
          ? selectedCategory?.category_id
          : null,
      });
    }
  };
  const handleBarcode = async () => {
    try {
      const res = await getBarcode({ unit: watch("unit") }).unwrap();
      setValue("barcode", res.barcode);
    } catch (error) {
      console.error("Barcode generation failed:", error);
    }
  };
  useEffect(() => {
    if (editForm) {
      setValue("product_id", editForm.product_id);
      setValue("name", editForm.name);
      setValue("unit", editForm.unit);
      setValue("barcode", editForm.barcode);
      setValue("buyPrice", editForm.buyPrice);
      setValue("sellPrice", editForm.sellPrice);
      setSelectedCategory(editForm.category);
      setValue("stock", editForm.stock);
    }
  }, [editForm]);

  useEffect(() => {
    if (editForm) {
      reset(editForm);
    }
  }, [editForm, reset]);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => {
        reset();
        handleClose();
      }}
      children={
        <div className={`flex w-full  justify-center max-md:p-0 px-8 `}>
          <ToastContainer />

          {/* Form Fields */}
          <form
            onSubmit={handleSubmit(handleProductCrud)}
            className={`flex flex-col w-full  max-md:gap-8 ${
              isMobile ? "gap-16" : "gap-10"
            }`}
          >
            {/* Product Name */}
            <div className="flex justify-between items-end ">
              <div className="flex flex-col w-full ">
                <label htmlFor="name" className="text-md max-lg:text-md">
                  {t("name")}
                </label>
                <input
                  ref={nameInputRef}
                  id="name"
                  placeholder={t("name")}
                  {...register("name", { required: "Name Required" })}
                  className="rounded-lg focus:outline-blue-500  border py-1 border-mainBorder px-2"
                />
                <p className="text-red-500 text-sm">{errors?.name?.message}</p>
              </div>
            </div>
            <div className="flex max-md:flex-col  gap-4">
              {/* Unit Selection */}
              <div className="flex flex-col">
                <label className="text-md max-lg:text-md">{t("unit")}</label>
                <div className="flex bg-white rounded-lg border w-fit border-mainBorder ">
                  <button
                    type="button"
                    onClick={() => setValue("unit", "piece")}
                    className={`px-2 py-1 cursor-pointer   ${
                      watch("unit") === "piece"
                        ? "bg-blue-500 text-white rounded-lg"
                        : ""
                    }`}
                  >
                    {t("piece")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("unit", "kg")}
                    className={` px-4 py-1 cursor-pointer ${
                      watch("unit") === "kg"
                        ? "bg-blue-500 text-white rounded-lg"
                        : ""
                    }`}
                  >
                    Kg
                  </button>
                </div>
              </div>

              {/* Barcode */}
              <div className="flex  w-full flex-col max-lg:w-full">
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
                      placeholder="Enter Barcode or Generate"
                      {...register("barcode", {
                        required: "Barcode Required",
                        pattern: {
                          value: /^[0-9]+$/,
                          message: "Barcode must be numeric",
                        },
                      })}
                      className=" rounded-lg border w-full border-mainBorder py-1 px-2 focus:outline-blue-500"
                    />
                    {errors?.barcode && (
                      <p className="text-red-500 text-sm">
                        {errors?.barcode?.message}
                      </p>
                    )}
                  </div>
                  <button
                    type={"button"}
                    onClick={handleBarcode}
                    className="cursor-pointer h-full py-1 px-2 rounded-lg bg-blue-500  text-white"
                  >
                    <Generate className={"size-6"} />
                  </button>
                </div>
              </div>
            </div>
            {/* Prices */}
            <div className="flex  gap-2 max-md:flex-col">
              <div className="flex    rounded-lg flex-col">
                <label className="text-md">{t("buyPrice")}</label>
                <div className="flex w-fit gap-2 relative ">
                  <input
                    type="number"
                    step={0.0001}
                    {...register("buyPrice", {
                      required: "Buy Price Required",
                      validate: (value) =>
                        parseFloat(value) > 0 ||
                        "Buy Price must be greater than 0",
                    })}
                    className=" border  border-mainBorder rounded-lg px-2 py-1 focus:outline-blue-500"
                  />
                  <span className="px-2 text-xl absolute right-0">₼</span>
                </div>
                <p className="text-red-500 text-xs">
                  {errors?.buyPrice?.message}
                </p>
              </div>
              <div className="flex    rounded-lg flex-col">
                <label className="text-md">{t("sellPrice")}</label>
                <div className="flex w-fit gap-2 relative ">
                  <input
                    type="number"
                    step={0.0001}
                    {...register("sellPrice", {
                      required: "Sell Price Required",
                      validate: (value) =>
                        parseFloat(value) > 0 ||
                        "Sell Price must be greater than 0",
                    })}
                    className=" border  border-mainBorder rounded-lg px-2 py-1 focus:outline-blue-500"
                  />
                  <span className="px-2 text-xl absolute right-0">₼</span>
                </div>
                <p className="text-red-500 text-xs">
                  {errors?.sellPrice?.message}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 justify-end w-full">
                <MainButton type="create" title={"add"} />
              </div>
            </div>
          </form>
        </div>
      }
    ></BaseModal>
  );
};
