import React, { useMemo, useState, useCallback } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import "./AddCategory.scss";

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
});

const suppliers = [
  { id: 1, name: "Supplier A" },
  { id: 2, name: "Supplier B" },
  { id: 3, name: "Supplier C" },
  // Add more suppliers as needed
];

const Category = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredCategories = categories.filter(
    (category) =>
      category.rawMaterialName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      category.size.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleEdit(row.original)}
              className="edit-btn"
            >
              Edit
            </Button>{" "}
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleDelete(row.original.id)}
              className="delete-btn"
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [handleDelete]
  );

  const data = useMemo(() => filteredCategories, [filteredCategories]);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className="category">
      <div className="container mt-4">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
          className="newcategory-btn"
        >
          New Category
        </Button>
        <div className="mt-3 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or size"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <table {...getTableProps()} className="table table-striped mt-3">
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
          <tbody {...getTableBodyProps()}>
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
                        <Field
                          name="thickness"
                          className="form-control"
                        />
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
                            <option
                              key={supplier.id}
                              value={supplier.name}
                            >
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
                      <div className="modal-footer">
                        <Button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Close
                        </Button>
                        <Button
                          type="submit"
                          className="btn btn-primary"
                        >
                          Save changes
                        </Button>
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
