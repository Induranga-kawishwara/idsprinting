import React, { useMemo, useState, useCallback } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../All.scss";
import axios from "axios";
import TableChecker from "../../Reusable/TableChecker/TableChecker.js";
import _ from "lodash";
import { ConvertToSLT } from "../../Utility/ConvertToSLT.js";

const initialItems = [
  {
    id: 1,
    itemCode: "A001",
    itemName: "Item A",
    category: "",
    color: "Red",
    qty: "",
    buyingPrice: "10.00",
    company: "",
    wholesale: "",
    retailPrice: "15.00",
    addedDate: "2024-08-13",
    addedTime: "14:30",
    addedBy: "John Doe",
    size: "Medium",
  },
  // Add more items if needed
];

const ItemSchema = Yup.object().shape({
  itemCode: Yup.string().required("Item Code is required"),
  itemName: Yup.string().required("Item Name is required"),
  category: Yup.string(),
  color: Yup.string().required("Color is required"),
  qty: Yup.string(),
  buyingPrice: Yup.number().required("Buying Price is required"),
  wholesale: Yup.string(),
  retailPrice: Yup.number().required("Retail Price is required"),
});

const categoryOptions = [
  { id: 1, name: "category A" },
  { id: 2, name: "category B" },
  { id: 3, name: "category C" },
];

const sizeCategory = [
  { value: "Small", label: "Small" },
  { value: "Medium", label: "Medium" },
  { value: "Large", label: "Large" },
];

const ITEMS_PER_PAGE = 100;

const Item = () => {
  const [items, setItems] = useState(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sizeFilter, setSizeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(
    (id) => {
      setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    },
    [setItems]
  );

  const handleSubmit = (values) => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
    const formattedTime = currentDate.toTimeString().split(" ")[0]; // HH:MM:SS

    if (editingItem) {
      setItems(
        items.map((item) =>
          item.id === editingItem.id
            ? {
                ...values,
                id: editingItem.id,
                addedDate: item.addedDate,
                addedTime: item.addedTime,
                addedBy: item.addedBy,
              }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          ...values,
          id: items.length + 1,
          addedDate: formattedDate,
          addedTime: formattedTime,
          addedBy: "John Doe", // Replace with actual user info
        },
      ]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateRange({ start: null, end: null });
    setSizeFilter("");
  };

  const filteredItems = items.filter((item) => {
    const isNameMatch =
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.retailPrice.toLowerCase().includes(searchQuery.toLowerCase());

    const isSizeMatch = sizeFilter ? item.size === sizeFilter : true;

    const isDateMatch =
      (!dateRange.start ||
        new Date(item.addedDate) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(item.addedDate) <= new Date(dateRange.end));

    return isNameMatch && isSizeMatch && isDateMatch;
  });

  // Paginate filteredItems
  const paginatedItems = useMemo(() => {
    const startIndex = currentPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Item Code", accessor: "itemCode" },
      { Header: "Item Name", accessor: "itemName" },
      { Header: "Stock Category", accessor: "category" },
      { Header: "Size Category", accessor: "size" },
      { Header: "Color", accessor: "color" },
      { Header: "Buying Price", accessor: "buyingPrice" },
      { Header: "Wholesale", accessor: "wholesale" },
      { Header: "Retail Price", accessor: "retailPrice" },
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

  const tableInstance = useTable({ columns, data: paginatedItems });

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
          New Item
        </button>
        <div className="d-flex align-items-center mb-3">
          <input
            type="text"
            className="searchfunctions me-2"
            placeholder="Search by name, code, or price"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <DatePicker
            selected={dateRange.start}
            onChange={(date) =>
              setDateRange((prev) => ({ ...prev, start: date }))
            }
            selectsStart
            startDate={dateRange.start}
            endDate={dateRange.end}
            className="searchfunctionsdate me-2"
            placeholderText="S.Date"
          />
          <DatePicker
            selected={dateRange.end}
            onChange={(date) =>
              setDateRange((prev) => ({ ...prev, end: date }))
            }
            selectsEnd
            startDate={dateRange.start}
            endDate={dateRange.end}
            className="searchfunctionsdate me-2"
            placeholderText="E.Date"
            minDate={dateRange.start}
          />
          <select
            className="formdropdown me-2 "
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
          >
            <option value="">Size Category</option>
            {sizeCategory.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
          <button className="prevbutton" onClick={clearFilters}>
            Clear
          </button>
        </div>
        <div className="table-responsive">
          <table {...getTableProps()} className="table mt-3 custom-table">
            <thead>
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
                  {editingItem ? "Edit Item" : "New Item"}
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
                    itemCode: editingItem?.itemCode || "",
                    itemName: editingItem?.itemName || "",
                    category: editingItem?.category || "",
                    color: editingItem?.color || "",
                    qty: editingItem?.qty || "",
                    buyingPrice: editingItem?.buyingPrice || "",
                    company: editingItem?.company || "",
                    wholesale: editingItem?.wholesale || "",
                    retailPrice: editingItem?.retailPrice || "",
                    supplier: editingItem?.supplier || "",
                  }}
                  validationSchema={ItemSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched }) => (
                    <Form>
                      {/* Form Fields */}
                      <div className="mb-3">
                        <label>Item Code</label>
                        <Field name="itemCode" className="form-control" />
                        {errors.itemCode && touched.itemCode ? (
                          <div className="text-danger">{errors.itemCode}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Item Name</label>
                        <Field name="itemName" className="form-control" />
                        {errors.itemName && touched.itemName ? (
                          <div className="text-danger">{errors.itemName}</div>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <label>Stock Category</label>
                        <Field
                          as="select"
                          name="category"
                          className="form-control"
                        >
                          <option
                            className="form-control"
                            value=""
                            label="Select a type of stock"
                            disabled
                            hidden
                          />
                          {categoryOptions.map((category) => (
                            <option
                              className="form-control"
                              key={category.id}
                              value={category.name}
                            >
                              {category.name}
                            </option>
                          ))}
                        </Field>
                        {errors.category && touched.category ? (
                          <div className="text-danger">{errors.category}</div>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <label>Color</label>
                        <Field name="color" className="form-control" />
                        {errors.color && touched.color ? (
                          <div className="text-danger">{errors.color}</div>
                        ) : null}
                      </div>
                      <div className="mb-3">
                        <label>Qty</label>
                        <Field name="qty" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label>Buying Price</label>
                        <Field
                          name="buyingPrice"
                          type="number"
                          className="form-control"
                        />
                        {errors.buyingPrice && touched.buyingPrice ? (
                          <div className="text-danger">
                            {errors.buyingPrice}
                          </div>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <label>Company</label>
                        <Field name="company" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label>Wholesale</label>
                        <Field name="wholesale" className="form-control" />
                      </div>
                      <div className="mb-3">
                        <label>Retail Price</label>
                        <Field
                          name="retailPrice"
                          type="number"
                          className="form-control"
                        />
                        {errors.retailPrice && touched.retailPrice ? (
                          <div className="text-danger">
                            {errors.retailPrice}
                          </div>
                        ) : null}
                      </div>

                      <div className="d-flex justify-content-end">
                        <button
                          variant="contained"
                          color="primary"
                          type="submit"
                          className="savechangesbutton"
                        >
                          {editingItem ? "Update" : "Add"}
                        </button>
                        <button
                          variant="contained"
                          color="secondary"
                          onClick={() => setIsModalOpen(false)}
                          className="closebutton"
                        >
                          Cancel
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

export default Item;
