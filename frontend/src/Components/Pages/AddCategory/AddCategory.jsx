import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../All.scss";
import socket from "../../Utility/SocketConnection.js";
import axios from "axios";
import TableChecker from "../../Reusable/TableChecker/TableChecker.js";
import _ from "lodash";
import { ConvertToSLT } from "../../Utility/ConvertToSLT.js";
import Loading from "../../Reusable/Loadingcomp/Loading.jsx";

const CategorySchema = Yup.object().shape({
  rawMaterialName: Yup.string().required("Raw Material Name is required"),
  size: Yup.string().required("Size is required"),
  thickness: Yup.string().required("Thickness is required"),
  qty: Yup.number().required("Quantity is required"),
  company: Yup.string(),
  supplier: Yup.string().required("Supplier is required"),
  buyingPrice: Yup.number().required("Buying Price is required"),
  addedBy: Yup.string().required("Added By is required"),
});

const ITEMS_PER_PAGE = 100;

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [currentPage, setCurrentPage] = useState(0);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingpage, setLoadingpage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both Category and suppliers concurrently
        const [categoriesData, suppliersData] = await Promise.all([
          axios.get(
            "https://candied-chartreuse-concavenator.glitch.me/categories/"
          ),
          axios.get(
            "https://candied-chartreuse-concavenator.glitch.me/suppliers/"
          ),
        ]);

        // Format suppliers data (only extracting id and name)
        const needDetailsSuppliers = suppliersData.data.map((supplier) => ({
          id: supplier.id,
          name: supplier.name,
        }));

        // Format Category data with date and time conversion
        const formattedCategories = categoriesData.data.map((Category) => {
          const { date, time } = ConvertToSLT(Category.dateAndTime);

          return {
            ...Category,
            id: Category.id,
            addedDate: date,
            addedTime: time,
          };
        });

        // Update state
        setCategories(formattedCategories);
        setSuppliers(needDetailsSuppliers);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
        setLoading(false);
      }
    };

    // Call fetchData once
    fetchData();

    // Listen for real-time Category updates
    socket.on("CategoryAdded", (newCategory) => {
      const { date, time } = ConvertToSLT(newCategory.dateAndTime);

      const newcategory = {
        ...newCategory,
        addedDate: date,
        addedTime: time,
      };
      setCategories((prevCategory) => [newcategory, ...prevCategory]);
    });

    socket.on("CategoryUpdated", (updatedCategory) => {
      const { date, time } = ConvertToSLT(updatedCategory.dateAndTime);

      const newUpdatedCategory = {
        ...updatedCategory,
        addedDate: date,
        addedTime: time,
      };
      setCategories((prevCategory) =>
        prevCategory.map((Category) =>
          Category.id === updatedCategory.id ? newUpdatedCategory : Category
        )
      );
    });

    socket.on("CategoryDeleted", ({ id }) => {
      setCategories((prevCategory) =>
        prevCategory.filter((Category) => Category.id !== id)
      );
    });

    socket.on("supplierAdded", (newsupplier) => {
      setSuppliers((prevsuppliers) => [
        { id: newsupplier.id, name: newsupplier.name },
        ...prevsuppliers,
      ]);
    });

    socket.on("supplierUpdated", (updatedsupplier) => {
      setSuppliers((prevsuppliers) =>
        prevsuppliers.map((supplier) =>
          supplier.id === updatedsupplier.id
            ? { id: updatedsupplier.id, name: updatedsupplier.name }
            : supplier
        )
      );
    });

    socket.on("supplierDeleted", ({ id }) => {
      setSuppliers((prevsuppliers) =>
        prevsuppliers.filter((supplier) => supplier.id !== id)
      );
    });

    return () => {
      socket.off("CategoryAdded");
      socket.off("CategoryUpdated");
      socket.off("CategoryDeleted");

      //////

      socket.off("supplierAdded");
      socket.off("supplierUpdated");
      socket.off("supplierDeleted");
    };
  }, []);

  const handleEdit = (Category) => {
    setEditingCategory(Category);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(async (name, id) => {
    const confirmDelete = window.confirm(
      `Do you want to delete the Category: ${name}?`
    );

    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `https://candied-chartreuse-concavenator.glitch.me/categories/Category/${id}`
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting expense:", error);
        alert("Failed to delete the expense. Please try again.");
      }
    }
  }, []);

  const handleSubmit = async (values) => {
    setLoadingpage(true);
    const currentDate = new Date();

    const data = {
      ...values,
      dateAndTime: currentDate.toISOString(),
    };

    if (editingCategory) {
      try {
        const response = await axios.put(
          `https://candied-chartreuse-concavenator.glitch.me/categories/Category/${editingCategory.id}`,
          data
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error updating Category:", error);
        alert("Failed to update the Category. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          "https://candied-chartreuse-concavenator.glitch.me/categories/Category",
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
    setLoadingpage(false);
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // Clear search and date filters
  const clearFilters = () => {
    setSearchQuery("");
    setDateRange({ start: null, end: null });
  };

  // Combined search and date filter logic
  const filteredCategories = categories.filter((Category) => {
    const matchesSearch =
      Category.rawMaterialName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      Category.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
      Category.buyingPrice.toString().includes(searchQuery);

    const matchesDate =
      (!dateRange.start || new Date(Category.addedDate) >= dateRange.start) &&
      (!dateRange.end || new Date(Category.addedDate) <= dateRange.end);

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
      {
        Header: "No",
        accessor: "id",
        Cell: ({ row }) => row.index + 1,
      },
      { Header: "Raw Material Name", accessor: "rawMaterialName" },
      { Header: "Size", accessor: "size" },
      { Header: "Thickness (Gsm Or mm)", accessor: "thickness" },
      { Header: "QTY", accessor: "qty" },
      { Header: "Supplier", accessor: "supplier" },
      { Header: "Company", accessor: "company" },
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
              onClick={() =>
                handleDelete(row.original.rawMaterialName, row.original.id)
              }
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
                setEditingCategory(null);
              }}
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
                onChange={(date) =>
                  setDateRange((prev) => ({ ...prev, start: date }))
                }
                selectsStart
                startDate={dateRange.start}
                endDate={dateRange.end}
                className="searchfunctionsdate"
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
                className="searchfunctionsdate"
                placeholderText="E.Date"
                minDate={dateRange.start}
              />
              <button className="prevbutton" onClick={clearFilters}>
                Clear
              </button>
            </div>
            <div className="table-responsive">
              {loading || error || _.isEmpty(data) ? (
                <TableChecker
                  loading={loading}
                  error={error}
                  hasData={data.length > 0}
                />
              ) : (
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
                        company: editingCategory?.company || "",
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
                            {errors.rawMaterialName &&
                            touched.rawMaterialName ? (
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
                              <div className="text-danger">
                                {errors.thickness}
                              </div>
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
                              <div className="text-danger">
                                {errors.supplier}
                              </div>
                            ) : null}
                          </div>

                          <div className="mb-3">
                            <label>Company</label>
                            <Field name="company" className="form-control" />
                            {errors.company && touched.company ? (
                              <div className="text-danger">
                                {errors.company}
                              </div>
                            ) : null}
                          </div>

                          <div className="mb-3">
                            <label>Buying Price</label>
                            <Field
                              name="buyingPrice"
                              className="form-control"
                            />
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
                              <div className="text-danger">
                                {errors.addedBy}
                              </div>
                            ) : null}
                          </div>
                          <div className="modal-footer">
                            <button type="submit" className="savechangesbutton">
                              {editingCategory ? "Update" : "Add"}
                            </button>
                            <button
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
      )}
    </div>
  );
};

export default Category;
