import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../All.scss";
import axios from "axios";
import socket from "../../Utility/SocketConnection.js";
import TableChecker from "../../Reusable/TableChecker/TableChecker.js";
import _ from "lodash";
import { ConvertToSLT } from "../../Utility/ConvertToSLT.js";

const ItemSchema = Yup.object().shape({
  itemCode: Yup.string().required("Item Code is required"),
  itemName: Yup.string().required("Item Name is required"),
  category: Yup.string(),
  color: Yup.string().required("Color is required"),
  qty: Yup.string(),
  buyingPrice: Yup.number(),
  wholesale: Yup.string(),
  company: Yup.string(),
  retailPrice: Yup.number().required("Retail Price is required"),
});

const sizeCategory = [
  { value: "Small", label: "Small" },
  { value: "Medium", label: "Medium" },
  { value: "Large", label: "Large" },
];

const ITEMS_PER_PAGE = 100;

const Item = () => {
  const [items, setItems] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sizeFilter, setSizeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ItemData = await axios.get("http://localhost:8080/categories/");

        const categoryDetails = ItemData.data.map((category) => ({
          id: category.id,
          name: category.rawMaterialName,
          buyingPrice: category.buyingPrice,
          size: category.size,
          qty: category.qty,
          company: category.company,
        }));

        // Process each object in the dataset
        const newData = ItemData.data.flatMap((category) => {
          return category.items.map((item) => {
            const { date, time } = ConvertToSLT(item.addedDateTime);
            return {
              categoryid: category.id,
              Itemid: item.itemId,
              itemCode: item.itemCode,
              itemName: item.itemName,
              category: category.rawMaterialName, // Using rawMaterialName as category
              color: item.color,
              qty: category.qty,
              buyingPrice: category.buyingPrice,
              company: category.company,
              wholesale: item.wholesale,
              retailPrice: item.retailPrice, // Add retailPrice value here if available
              addedDate: date,
              addedTime: time,
              addedBy: category.addedBy,
              size: category.size,
            };
          });
        });
        setCategoryOptions(categoryDetails);
        setItems(newData);
        console.log(newData);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();

    // Listen for real-time Item updates
    socket.on("ItemAdded", (newItem) => {
      const { date, time } = ConvertToSLT(newItem.item.addedDateTime);
      const newItemadded = {
        categoryid: newItem.category.id,
        Itemid: newItem.item.itemId,
        itemCode: newItem.item.itemCode,
        itemName: newItem.item.itemName,
        category: newItem.category.rawMaterialName, // Using rawMaterialName as category
        color: newItem.item.color,
        qty: newItem.category.qty,
        buyingPrice: newItem.category.buyingPrice,
        company: newItem.category.company,
        wholesale: newItem.item.wholesale,
        retailPrice: newItem.item.retailPrice, // Add retailPrice value here if available
        addedDate: date,
        addedTime: time,
        addedBy: newItem.category.addedBy,
        size: newItem.category.size,
      };
      setItems((prevItems) => [newItemadded, ...prevItems]);
    });

    socket.on("ItemUpdated", (updatedItem) => {
      console.log(updatedItem);
      const { date, time } = ConvertToSLT(updatedItem.item.addedDateTime);
      const updatedItemadded = {
        categoryid: updatedItem.category.id,
        Itemid: updatedItem.item.itemId,
        itemCode: updatedItem.item.itemCode,
        itemName: updatedItem.item.itemName,
        category: updatedItem.category.rawMaterialName,
        color: updatedItem.item.color,
        qty: updatedItem.category.qty,
        buyingPrice: updatedItem.category.buyingPrice,
        company: updatedItem.category.company,
        wholesale: updatedItem.item.wholesale,
        retailPrice: updatedItem.item.retailPrice,
        addedDate: date,
        addedTime: time,
        addedBy: updatedItem.category.addedBy,
        size: updatedItem.category.size,
      };
      setItems((prevItems) =>
        prevItems.map((Item) =>
          Item.Itemid === updatedItem.item.itemId ? updatedItemadded : Item
        )
      );
    });

    socket.on("ItemDeleted", ({ id }) => {
      setItems((prevItems) => prevItems.filter((Item) => Item.ItemId !== id));
    });

    return () => {
      socket.off("ItemAdded");
      socket.off("ItemUpdated");
      socket.off("ItemDeleted");
    };
  }, []);

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(async (categoryId, itemId, name) => {
    const confirmDelete = window.confirm(`Do you want to delete: ${name}?`);

    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `http://localhost:8080/items/item/${categoryId}/${itemId}`
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting details:", error);
        alert("Failed to delete the details. Please try again.");
      }
    }
  });

  const handleSubmit = async (values) => {
    console.log(values);
    const currentDate = new Date();

    const data = {
      ...values,
      addedDateTime: currentDate.toISOString(),
    };

    if (editingItem) {
      try {
        const response = await axios.put(
          `http://localhost:8080/items/item/${editingItem.categoryid}/${editingItem.Itemid}`,
          data
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error updating Item:", error);
        alert("Failed to update the Item. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          `http://localhost:8080/items/item/${selectedCategory.id}`,
          data
        );
        alert(response.data.message);
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          alert(`Error: ${error.response.data.message}`);
        } else {
          // Show a generic error message
          alert("Failed to add the Category. Please try again.");
        }
      }
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
      {
        Header: "No",
        accessor: "Itemid",
        Cell: ({ row }) => row.index + 1,
      },
      { Header: "Item Code", accessor: "itemCode" },
      { Header: "Item Name", accessor: "itemName" },
      { Header: "Stock Category", accessor: "category" },
      { Header: "Size Category", accessor: "size" },
      { Header: "Color", accessor: "color" },
      { Header: "company", accessor: "company" },
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
              onClick={() =>
                handleDelete(
                  row.original.categoryid,
                  row.original.Itemid,
                  row.original.itemName
                )
              }
              className="deletebtn"
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const handleCategoryChange = (event) => {
    const selectedId = event.target.value;
    const category = categoryOptions.find((cat) => cat.id === selectedId);

    setSelectedCategory(category);
  };

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
                    category:
                      editingItem?.category || selectedCategory?.name || "",
                    color: editingItem?.color || "",
                    qty: editingItem?.qty || selectedCategory?.qty || "",
                    buyingPrice:
                      editingItem?.buyingPrice ||
                      selectedCategory?.buyingPrice ||
                      "",
                    size: editingItem?.size || selectedCategory?.size || "",
                    company:
                      editingItem?.company || selectedCategory?.company || "",
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
                        <label>Color</label>
                        <Field name="color" className="form-control" />
                        {errors.color && touched.color ? (
                          <div className="text-danger">{errors.color}</div>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <label>Stock Category</label>
                        <Field
                          as="select"
                          name="category"
                          className="form-control"
                          value=""
                          onChange={handleCategoryChange}
                        >
                          <option
                            className="form-control"
                            value={selectedCategory.name}
                            label="Select a type of stock"
                            disabled
                            hidden
                          />
                          {categoryOptions.map((category, index) => (
                            <option
                              className="form-control"
                              key={index}
                              value={category.id}
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
                        <label>Qty</label>
                        <Field
                          name="qty"
                          className="form-control"
                          value={selectedCategory.qty}
                          disabled
                        />
                      </div>
                      <div className="mb-3">
                        <label>Size</label>
                        <Field
                          name="size"
                          className="form-control"
                          value={selectedCategory.size}
                          disabled
                        />
                      </div>

                      <div className="mb-3">
                        <label>Company</label>
                        <Field
                          name="company"
                          className="form-control"
                          value={selectedCategory.company}
                          disabled
                        />
                      </div>

                      <div className="mb-3">
                        <label>Buying Price</label>
                        <Field
                          name="buyingPrice"
                          type="number"
                          className="form-control"
                          value={selectedCategory.buyingPrice}
                          disabled
                        />
                        {errors.buyingPrice && touched.buyingPrice ? (
                          <div className="text-danger">
                            {errors.buyingPrice}
                          </div>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <label>Wholesale</label>
                        <Field
                          name="wholesale"
                          type="number"
                          className="form-control"
                        />
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
