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
import Loading from "../../Reusable/Loadingcomp/Loading.jsx";

const ItemSchema = Yup.object().shape({
  itemCode: Yup.string().required("Item Code is required"),
  itemName: Yup.string().required("Item Name is required"),
  color: Yup.string().required("Color is required"),
  qty: Yup.string(),
  buyingPrice: Yup.number(),
  wholesale: Yup.number(),
  company: Yup.string(),
  discount: Yup.number()
    .notRequired()
    .test(
      "is-less-than-retail",
      "Discount must be less than Retail Price",
      function (value) {
        const { retailPrice } = this.parent;
        return value < retailPrice;
      }
    ),
  retailPrice: Yup.number().required("Retail Price is required"),
});

const ITEMS_PER_PAGE = 100;

const Item = () => {
  const [items, setItems] = useState([]);
  const [sizeCategory, setSizeCategory] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [sizeFilter, setSizeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingpage, setLoadingpage] = useState(false);

  const mapCategoryData = (category) => ({
    id: category.id,
    name: category.rawMaterialName,
    buyingPrice: category.buyingPrice,
    size: category.size,
    qty: category.qty,
    company: category.company,
  });

  const mapSizeCategoryData = (category) => ({
    id: category.id,
    value: category.size,
    label: category.size,
  });

  const mapItemData = (category, item) => {
    const { date, time } = ConvertToSLT(item.addedDateTime);
    return {
      categoryid: category.id,
      Itemid: item.itemId,
      itemCode: item.itemCode,
      itemName: item.itemName,
      category: category.rawMaterialName,
      color: item.color,
      qty: category.qty,
      buyingPrice: category.buyingPrice,
      company: category.company,
      wholesale: item.wholesale,
      retailPrice: item.retailPrice,
      addedDate: date,
      addedTime: time,
      addedBy: category.addedBy,
      size: category.size,
      discount: item.discount || 0,
      sellingPrice: calculateSellingPrice(item.retailPrice, item.discount || 0),
      addedDateTime: item.addedDateTime,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ItemData = await axios.get(
          "https://candied-chartreuse-concavenator.glitch.me/categories/"
        );

        console.log(ItemData.data);

        const categoryDetails = ItemData.data.map((category) =>
          mapCategoryData(category)
        );

        const sizecategory = ItemData.data.map((category) =>
          mapSizeCategoryData(category)
        );

        // Process each object in the dataset
        const newData = ItemData.data.flatMap((category) => {
          return category.items.map((item) => mapItemData(category, item));
        });

        setSizeCategory(sizecategory);
        setCategoryOptions(categoryDetails);
        setItems(
          newData.sort(
            (a, b) => new Date(b.addedDateTime) - new Date(a.addedDateTime)
          )
        );
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Listen for real-time Item updates
    socket.on("ItemAdded", (newItem) => {
      setItems((prevItems) => [
        mapItemData(newItem.category, newItem.newItem),
        ...prevItems,
      ]);
    });

    socket.on("ItemUpdated", (updatedItem) => {
      setItems((prevItems) =>
        prevItems.map((Item) =>
          Item.Itemid === updatedItem.item.itemId
            ? mapItemData(updatedItem.category, updatedItem.item)
            : Item
        )
      );
    });

    socket.on("ItemDeleted", ({ itemId }) => {
      console.log(itemId);
      setItems((prevItems) =>
        prevItems.filter((Item) => Item.Itemid !== itemId)
      );
    });

    // Listen for real-time Category updates
    socket.on("CategoryAdded", (newCategory) => {
      setCategoryOptions((prevCategory) => [
        mapCategoryData(newCategory),
        ...prevCategory,
      ]);
      setSizeCategory((prevCategory) => [
        mapSizeCategoryData(newCategory),
        ...prevCategory,
      ]);
    });

    socket.on("CategoryUpdated", (updatedCategory) => {
      setCategoryOptions((prevCategory) =>
        prevCategory.map((Category) =>
          Category.id === updatedCategory.id
            ? mapCategoryData(updatedCategory)
            : Category
        )
      );

      setSizeCategory((prevCategory) =>
        prevCategory.map((Category) =>
          Category.id === updatedCategory.id
            ? mapSizeCategoryData(updatedCategory)
            : Category
        )
      );
    });

    socket.on("CategoryDeleted", ({ id }) => {
      setItems((prevItems) =>
        prevItems.filter((Item) => Item.categoryid !== id)
      );

      setCategoryOptions((prevCategory) =>
        prevCategory.filter((Category) => Category.id !== id)
      );

      setSizeCategory((prevCategory) =>
        prevCategory.filter((Category) => Category.id !== id)
      );
    });

    return () => {
      socket.off("ItemAdded");
      socket.off("ItemUpdated");
      socket.off("ItemDeleted");

      socket.off("CategoryAdded");
      socket.off("CategoryUpdated");
      socket.off("CategoryDeleted");
    };
  }, [categoryOptions, items]);

  const calculateSellingPrice = (originalPrice, discount) => {
    // let discount = discountPercentage / 100; // Convert percentage to decimal
    // let sellingPrice = originalPrice * (1 - discount); // Apply discount

    let sellingPrice = originalPrice - discount; // Apply discount

    return sellingPrice;
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(async (categoryId, itemId, name) => {
    const confirmDelete = window.confirm(`Do you want to delete: ${name}?`);
    console.log(categoryId);

    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `https://candied-chartreuse-concavenator.glitch.me/items/${categoryId}/${itemId}`
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting details:", error);
        alert("Failed to delete the details. Please try again.");
      }
    }
  });

  const handleSubmit = async (values) => {
    setLoadingpage(true);
    const currentDate = new Date();
    const data = {
      ...values,
      addedDateTime: currentDate.toISOString(),
    };

    try {
      let response;
      if (editingItem) {
        // Construct URL based on whether category changed
        const url =
          editingItem.categoryid === selectedCategory.id || !selectedCategory.id
            ? `https://candied-chartreuse-concavenator.glitch.me/items/${editingItem.categoryid}/${editingItem.Itemid}`
            : `https://candied-chartreuse-concavenator.glitch.me/items/${editingItem.categoryid}/${selectedCategory.id}/${editingItem.Itemid}`;

        response = await axios.put(url, data);
      } else {
        response = await axios.post(
          `https://candied-chartreuse-concavenator.glitch.me/items/${selectedCategory.id}`,
          data
        );
      }

      alert(response.data.message);
    } catch (error) {
      console.error("Error processing item:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Failed to process the request. Please try again.";
      alert(`Error: ${errorMessage}`);
    }

    // Close modal and reset editing state
    setLoadingpage(false);
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
      item.retailPrice.toString().includes(searchQuery);

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
      { Header: "Discount", accessor: "discount" },
      { Header: "Selling Price", accessor: "sellingPrice" },
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
    <div>
      {loadingpage ? (
        <div>
          <Loading />
        </div>
      ) : (
        <div className="bodyofpage">
          <div className="container">
            <button
              variant="contained"
              color="primary"
              onClick={() => {
                setIsModalOpen(true);
                setEditingItem(null);
                setSelectedCategory(null);
              }}
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
              {loading || error || _.isEmpty(paginatedItems) ? (
                <TableChecker
                  loading={loading}
                  error={error}
                  hasData={paginatedItems.length > 0}
                />
              ) : (
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
                            <td {...cell.getCellProps()}>
                              {cell.render("Cell")}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
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
                          editingItem?.company ||
                          selectedCategory?.company ||
                          "",
                        wholesale: editingItem?.wholesale || "",
                        discount: editingItem?.discount || "",
                        retailPrice: editingItem?.retailPrice || "",
                        supplier: editingItem?.supplier || "",
                        selling: editingItem
                          ? calculateSellingPrice(
                              editingItem.retailPrice,
                              editingItem.discount
                            )
                          : 0,
                      }}
                      validationSchema={Yup.object().shape({
                        ...ItemSchema.fields,
                        category: Yup.string()
                          .required("Category is required")
                          .default(
                            editingItem?.category || selectedCategory?.name
                          ),
                      })}
                      onSubmit={handleSubmit}
                    >
                      {({
                        values,
                        errors,
                        touched,
                        setFieldValue,
                        handleChange,
                      }) => {
                        const handlePriceChange = (e) => {
                          const { name, value } = e.target;

                          handleChange(e);

                          const updatedValues = {
                            ...values,
                            [name]: value,
                          };

                          const sellingPrice = calculateSellingPrice(
                            updatedValues.retailPrice || 0,
                            updatedValues.discount || 0
                          );

                          // Update the selling price in Formik state
                          setFieldValue("selling", sellingPrice.toFixed(2));
                        };

                        return (
                          <Form>
                            {/* Form Fields */}
                            <div className="mb-3">
                              <label>Item Code</label>
                              <Field name="itemCode" className="form-control" />
                              {errors.itemCode && touched.itemCode && (
                                <div className="text-danger">
                                  {errors.itemCode}
                                </div>
                              )}
                            </div>

                            <div className="mb-3">
                              <label>Item Name</label>
                              <Field name="itemName" className="form-control" />
                              {errors.itemName && touched.itemName && (
                                <div className="text-danger">
                                  {errors.itemName}
                                </div>
                              )}
                            </div>

                            <div className="mb-3">
                              <label>Color</label>
                              <Field name="color" className="form-control" />
                              {errors.color && touched.color && (
                                <div className="text-danger">
                                  {errors.color}
                                </div>
                              )}
                            </div>

                            <div className="mb-3">
                              <label>Stock Category</label>
                              <Field
                                as="select"
                                name="category"
                                className="form-control"
                                onChange={handleCategoryChange}
                              >
                                <option
                                  className="form-control"
                                  label={
                                    selectedCategory?.name ||
                                    editingItem?.category ||
                                    "Select a type of stock"
                                  }
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
                              {errors.category && touched.category && (
                                <div className="text-danger">
                                  {errors.category}
                                </div>
                              )}
                            </div>

                            <div className="mb-3">
                              <label>Qty</label>
                              <Field
                                name="qty"
                                className="form-control"
                                value={
                                  selectedCategory?.qty || editingItem?.qty
                                }
                                disabled
                              />
                            </div>

                            <div className="mb-3">
                              <label>Size</label>
                              <Field
                                name="size"
                                className="form-control"
                                value={
                                  selectedCategory?.size || editingItem?.size
                                }
                                disabled
                              />
                            </div>

                            <div className="mb-3">
                              <label>Company</label>
                              <Field
                                name="company"
                                className="form-control"
                                value={
                                  selectedCategory?.company ||
                                  editingItem?.company
                                }
                                disabled
                              />
                            </div>

                            <div className="mb-3">
                              <label>Buying Price</label>
                              <Field
                                name="buyingPrice"
                                type="number"
                                className="form-control"
                                value={
                                  selectedCategory?.buyingPrice ||
                                  editingItem?.buyingPrice
                                }
                                disabled
                              />
                              {errors.buyingPrice && touched.buyingPrice && (
                                <div className="text-danger">
                                  {errors.buyingPrice}
                                </div>
                              )}
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
                                onChange={handlePriceChange} // Call custom handler
                              />
                              {errors.retailPrice && touched.retailPrice && (
                                <div className="text-danger">
                                  {errors.retailPrice}
                                </div>
                              )}
                            </div>
                            <div className="mb-3">
                              <label>Discount</label>
                              <Field
                                name="discount"
                                type="number"
                                className="form-control"
                                onChange={handlePriceChange} // Call custom handler
                              />
                              {errors.discount && touched.discount && (
                                <div className="text-danger">
                                  {errors.discount}
                                </div>
                              )}
                            </div>
                            <div className="mb-3">
                              <label>Selling Price</label>
                              <Field
                                name="selling"
                                type="number"
                                className="form-control"
                                disabled
                              />
                            </div>

                            <div className="d-flex justify-content-end">
                              <button
                                type="submit"
                                className="savechangesbutton"
                              >
                                {editingItem ? "Update" : "Add"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="closebutton"
                              >
                                Cancel
                              </button>
                            </div>
                          </Form>
                        );
                      }}
                    </Formik>
                  </div>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      )}
    </div>
  );
};

export default Item;
