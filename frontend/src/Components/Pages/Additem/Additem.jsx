import React, { useMemo, useState, useCallback } from "react";
import { useTable } from "react-table";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import "./AddItem.scss";

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
  },
  // Add more items if needed
];

const ItemSchema = Yup.object().shape({
  itemCode: Yup.string().required("Item Code is required"),
  itemName: Yup.string().required("Item Name is required"),
  category: Yup.string(), // Optional field
  color: Yup.string().required("Color is required"),
  qty: Yup.string(), // Optional field
  buyingPrice: Yup.number().required("Buying Price is required"),
  company: Yup.string(), // Optional field
  wholesale: Yup.string(), // Optional field
  retailPrice: Yup.number().required("Retail Price is required"),
  // Exclude addedDate and addedTime from validation
});

const Item = () => {
  const [items, setItems] = useState(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
        },
      ]);
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const filteredItems = items.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Item Code", accessor: "itemCode" },
      { Header: "Item Name", accessor: "itemName" },
      { Header: "Category", accessor: "category" },
      { Header: "Color", accessor: "color" },
      { Header: "Qty", accessor: "qty" },
      { Header: "Buying Price", accessor: "buyingPrice" },
      { Header: "Company", accessor: "company" },
      { Header: "Wholesale", accessor: "wholesale" },
      { Header: "Retail Price", accessor: "retailPrice" },
      { Header: "Added Date", accessor: "addedDate" }, // New column
      { Header: "Added Time", accessor: "addedTime" }, // New column
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => handleEdit(row.original)}
              className="edit-btn" // Apply edit button class
            >
              Edit
            </Button>{" "}
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => handleDelete(row.original.id)}
              className="delete-btn" // Apply delete button class
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [handleDelete]
  );

  const data = useMemo(() => filteredItems, [filteredItems]);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className="item">
      <div className="container mt-4">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
          className="newitem-btn"
        >
          New Item
        </Button>
        <div className="mt-3 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by item code or name"
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
                    // Exclude addedDate and addedTime from form initial values
                  }}
                  validationSchema={ItemSchema}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched }) => (
                    <Form>
                      <br />
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
                        <label>Category</label>
                        <Field name="category" className="form-control" />
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
                        <Button
                          variant="contained"
                          color="primary"
                          type="submit"
                          className="update-btn" // Apply update button class
                        >
                          {editingItem ? "Update" : "Add"}
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => setIsModalOpen(false)}
                          className="cancel-btn ms-2" // Apply cancel button class
                        >
                          Cancel
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

export default Item;
