import { createColumnHelper } from "@tanstack/react-table";
import { Table } from "../Table";
import { useGetBestSellersQuery } from "../../redux/slices/ApiSlice";

export const StockOverview = () => {
  const columnHelper = createColumnHelper();
  const { data } = useGetBestSellersQuery();
  const columns = [
    columnHelper.accessor("name", {
      header: "Mehsul",
      headerClassName: "text-start",
      cellClassName: "text-start text-flg",
    }),
    columnHelper.accessor("sold", {
      header: "Satilan",
      headerClassName: "text-center",
      cellClassName: "text-center text-flg",
    }),
    columnHelper.accessor("stock", {
      header: "Qaliq",
      headerClassName: "text-center",
      cellClassName: "text-center text-flg",
      // cell: (info) => <span>{Number(info.getValue()).toFixed(2)}</span>,
    }),
  ];
  return (
    <div className="overflow-auto min-h-0 h-full w-full overflow-x-hidden">
      <Table columns={columns} data={data} />
    </div>
  );
};
