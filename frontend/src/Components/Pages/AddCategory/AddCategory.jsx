import React, { useMemo, useState, useCallback } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../All.scss";

const initialCategories = [
  {
    id: 1,
    rawMaterialName: "Material A",
    size: "Medium",
    thickness: "0.5 mm",
    qty: "100",
    supplier: "Supplier A",
    buyingPrice: "20.00",
    addedDate: "2024-08-13",
    addedTime: "14:30",
    addedBy: "Admin",
  },
  // Add more categories if needed
];

const CategorySchema = Yup.object().shape({
  rawMaterialName: Yup.string().required("Raw Material Name is required"),
  size: Yup.string().required("Size is required"),
  thickness: Yup.string().required("Thickness is required"),
  qty: Yup.number().required("Quantity is required"),
  supplier: Yup.string().required("Supplier is required"),
  buyingPrice: Yup.number().required("Buying Price is required"),
  addedBy: Yup.string().required("Added By is required"),
});

const suppliers = [
  { id: 1, name: "Supplier A" },
  { id: 2, name: "Supplier B" },
  { id: 3, name: "Supplier C" },
  // Add more suppliers as needed
];

const ITEMS_PER_PAGE = 100;

const Category = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [currentPage, setCurrentPage] = useState(0);

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(
    (id) => {
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== id)
      );
    },
    [setCategories]
  );

  const handleSubmit = (values) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const formattedTime = currentDate.toTimeString().split(" ")[0]; // HH:MM:SS

    if (editingCategory) {
      setCategories(
        categories.map((category) =>
          category.id === editingCategory.id
            ? {
                ...values,
                id: editingCategory.id,
                addedDate: category.addedDate,
                addedTime: category.addedTime,
              }
            : category
        )
      );
    } else {
      setCategories([
        ...categories,
        {
          ...values,
          id: categories.length + 1,
          addedDate: formattedDate,
          addedTime: formattedTime,
        },
      ]);
    }
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // Clear search and date filters
  const clearFilters = () => {
    setSearchQuery("");
    setDateRange({ start: null, end: null });
  };

  // Combined search and date filter logic
  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.rawMaterialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.buyingPrice.toString().includes(searchQuery);

    const matchesDate =
      (!dateRange.start || new Date(category.addedDate) >= dateRange.start) &&
      (!dateRange.end || new Date(category.addedDate) <= dateRange.end);

    return matchesSearch && matchesDate;
  });

  const paginatedCategories = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage]);

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Raw Material Name", accessor: "rawMaterialName" },
      { Header: "Size", accessor: "size" },
      { Header: "Thickness (Gsm Or mm)", accessor: "thickness" },
      { Header: "QTY", accessor: "qty" },
      { Header: "Supplier", accessor: "supplier" },
      { Header: "Buying Price", accessor: "buyingPrice" },
      { Header: "Added Date", accessor: "addedDate" },
      { Header: "Added Time", accessor: "addedTime" },
      { Header: "Added By", accessor: "addedBy" },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div>
            <button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleEdit(row.original)}
              className="editbtn"
            >
              Edit
            </button>{" "}
            <button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleDelete(row.original.id)}
              className="deletebtn"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [handleDelete]
  );

  const data = useMemo(() => paginatedCategories, [paginatedCategories]);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className="bodyofpage">
      <div className="container">
        <button
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
          className="addnewbtntop"
        >
          New Category
        </button>
        <div className="d-flex align-items-center mb-3">
          <input
            type="text"
            className="searchfunctions me-2"
            placeholder="Search by name, size, or price"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <DatePicker
            selected={dateRange.start}
            onChange={(date) => setDateRange((prev) => ({ ...prev, start: date }))}
            selectsStart
            startDate={dateRange.start}
            endDate={dateRange.end}
            className="searchfunctionsdate"
            placeholderText="S.Date"
          />
          <DatePicker
            selected={dateRange.end}
            onChange={(date) => setDateRange((prev) => ({ ...prev, end: date }))}
            selectsEnd
            startDate={dateRange.start}
            endDate={dateRange.end}
            className="searchfunctionsdate"
            placeholderText="E.Date"
            minDate={dateRange.start}
          />
          <button
            className="prevbutton"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>
        <div className="table-responsive">
          <table {...getTableProps()} className="table mt-3 custom-table">
            <thead className="custom-table">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th {...column.getHeaderProps()}>
                      {column.render("Header")}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="custom-table">
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()}>
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <span>
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
        </div>

        {/* Form Modal */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="modal-dialog modal-dialog-centered custom-modal-dialog">
            <div className="modal-content custom-modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? "Edit Category" : "New Category"}
                </h5>
                <Button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => setIsModalOpen(false)}
                />
              </div>
              <div className="modal-body">
                <Formik
                  initialValues={{
                    rawMaterialName: editingCategory?.rawMaterialName || "",
                    size: editingCategory?.size || "",
                    thickness: editingCategory?.thickness || "",
                    qty: editingCategory?.qty || "",
                    supplier: editingCategory?.supplier || "",
                    buyingPrice: editingCategory?.buyingPrice || "",
                    addedBy: editingCategory?.addedBy || "",
                  }}
                  validationSchema={CategorySchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <br />
                      <div className="mb-3">
                        <label>Raw Material Name</label>
                        <Field
                          name="rawMaterialName"
                          className="form-control"
                        />
                        {errors.rawMaterialName && touched.rawMaterialName ? (
                          <div className="text-danger">
                            {errors.rawMaterialName}
                          </div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Size</label>
                        <Field name="size" className="form-control" />
                        {errors.size && touched.size ? (
                          <div className="text-danger">{errors.size}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Thickness (Gsm Or mm)</label>
                        <Field name="thickness" className="form-control" />
                        {errors.thickness && touched.thickness ? (
                          <div className="text-danger">{errors.thickness}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>QTY</label>
                        <Field name="qty" className="form-control" />
                        {errors.qty && touched.qty ? (
                          <div className="text-danger">{errors.qty}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Supplier</label>
                        <Field
                          as="select"
                          name="supplier"
                          className="form-control"
                        >
                          <option
                            value=""
                            label="Select a supplier"
                            disabled
                            hidden
                          />
                          {suppliers.map((supplier) => (
                            <option key={supplier.id} value={supplier.name}>
                              {supplier.name}
                            </option>
                          ))}
                        </Field>
                        {errors.supplier && touched.supplier ? (
                          <div className="text-danger">{errors.supplier}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Buying Price</label>
                        <Field name="buyingPrice" className="form-control" />
                        {errors.buyingPrice && touched.buyingPrice ? (
                          <div className="text-danger">
                            {errors.buyingPrice}
                          </div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Added By</label>
                        <Field name="addedBy" className="form-control" />
                        {errors.addedBy && touched.addedBy ? (
                          <div className="text-danger">{errors.addedBy}</div>
                        ) : null}
                      </div>
                      <div className="modal-footer">
                        
                        <button type="submit" className="savechangesbutton">
                        {editingCategory ? "Update" : "Add"}
                        </button><button
                          type="button"
                          className="closebutton"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Close
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Category;
