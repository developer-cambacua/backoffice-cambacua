import { useCallback, useEffect, useState } from "react";
import Pagination from "@/components/pagination/Pagination";

export const Table = ({
  data,
  colSpan,
  headerData,
  renderRow,
  keyboardNavEnabled = true,
}: {
  data: any[];
  colSpan: number;
  headerData: any[];
  renderRow: (row: any) => JSX.Element;
  keyboardNavEnabled?: boolean;
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const filteredData = data;

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = useCallback(() => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  }, [setCurrentPage, totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  }, [setCurrentPage]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  useEffect(() => {
    if (!keyboardNavEnabled) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        prevPage();
      } else if (event.key === "ArrowRight") {
        nextPage();
      }
    };

    document.body.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentPage, prevPage, nextPage, keyboardNavEnabled]);

  return (
    <>
      <div className={`font-openSans overflow-x-auto`}>
        <div
          className={`inline-block min-w-full ${
            data.length > 0 ? "min-h-[320px]" : "min-h-auto"
          } mt-4 mb-6`}>
          <div className="overflow-hidden bg-white border rounded-lg">
            <table className="min-w-full font-light text-left table-auto">
              <thead className="font-semibold">
                <tr className="bg-terciary-100">
                  {headerData.map((header) => {
                    return (
                      <th
                        key={header.key}
                        scope="col"
                        className="px-6 py-4 whitespace-nowrap text-sm">
                        <p>{header.label}</p>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map(renderRow)
                ) : (
                  <tr>
                    <td
                      className="font-medium text-2xl text-center py-6"
                      colSpan={colSpan}>
                      No hay datos disponibles para visualizar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={goToPage}
        prevPage={prevPage}
        nextPage={nextPage}
      />
    </>
  );
};
