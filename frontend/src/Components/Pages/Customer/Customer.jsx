import React, { useEffect, useCallback, useMemo, useState } from "react";
import { useTable } from "react-table";
import { Button, Modal } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../../Redux/customerSlice.js";
import socket from "../../../socket.js";
import TableChecker from "../../Reusable/TableChecker/TableChecker";
import CustomerFormModal from "./CustomerFormModal";
import "./Customer.scss";
import axios from "axios";
import _ from "lodash";

const Customer = () => {
  const dispatch = useDispatch();
  const { customers, loading, error } = useSelector((state) => state.customers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(fetchCustomers());

    socket.on("customerAdded", (customer) => {
      dispatch(addCustomer(customer));
    });

    socket.on("customerUpdated", (customer) => {
      dispatch(updateCustomer(customer));
    });

    socket.on("customerDeleted", (id) => {
      dispatch(deleteCustomer(id));
    });

    return () => {
      socket.off("customerAdded");
      socket.off("customerUpdated");
      socket.off("customerDeleted");
    };
  }, [dispatch]);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(
    async (name, id) => {
      const confirmDelete = window.confirm(`Do you want to delete: ${name}?`);
      if (confirmDelete) {
        try {
          await axios.delete(
            `https://idsprinting.vercel.app/customers/customer/${id}`
          );
          dispatch(deleteCustomer(id));
        } catch (error) {
          console.error("Error deleting customer:", error);
          alert("Failed to delete the customer. Please try again.");
        }
      }
    },
    [dispatch]
  );

  const handleSubmit = async (values) => {
    const currentDate = new Date();
    const data = {
      ...values,
      addedDateAndTime: currentDate.toISOString(),
    };

    if (editingCustomer) {
      try {
        await axios.put(
          `https://idsprinting.vercel.app/customers/customer/${editingCustomer.id}`,
          data
        );
        dispatch(
          updateCustomer({
            ...values,
            id: editingCustomer.id,
            addedDate: currentDate.toLocaleDateString(),
            addedTime: currentDate.toLocaleTimeString(),
          })
        );
      } catch (error) {
        console.error("Error updating customer:", error);
        alert("Failed to update the customer. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          "https://idsprinting.vercel.app/customers/customer",
          data
        );
        dispatch(
          addCustomer({
            ...values,
            id: response.data.id,
            addedDate: currentDate.toLocaleDateString(),
            addedTime: currentDate.toLocaleTimeString(),
          })
        );
      } catch (error) {
        console.error("Error adding customer:", error);
        alert("Failed to add the customer. Please try again.");
      }
    }

    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)
  );

  const columns = useMemo(
    () => [
      {
        Header: "No",
        accessor: "id",
        Cell: ({ row }) => row.index + 1,
      },
      { Header: "Name", accessor: "name" },
      { Header: "Surname", accessor: "surname" },
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ value }) => value || "-",
      },
      { Header: "Phone", accessor: "phone" },
      {
        Header: "House No",
        accessor: "houseNo",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Street",
        accessor: "street",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "City",
        accessor: "city",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Postal Code",
        accessor: "postalCode",
        Cell: ({ value }) => value || "-",
      },
      {
        Header: "Total Spent",
        accessor: "totalSpent",
        Cell: ({ value }) => value || "-",
      },
      { Header: "Customer Type", accessor: "customerType" },
      { Header: "Added Date", accessor: "addedDate" },
      { Header: "Added Time", accessor: "addedTime" },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div>
            <Button
              variant="contained"
              size="small"
              onClick={() => handleEdit(row.original)}
              className="edit-btn"
            >
              Edit
            </Button>{" "}
            <Button
              variant="contained"
              size="small"
              onClick={() =>
                handleDelete(
                  `${row.original.name} ${row.original.surname}`,
                  row.original.id
                )
              }
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

  const data = useMemo(() => filteredCustomers, [filteredCustomers]);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <div className="customer">
      <div className="container mt-4">
        <Button
          variant="contained"
          onClick={() => {
            setIsModalOpen(true);
            setEditingCustomer(null);
          }}
          className="newitem-btn"
        >
          New Client
        </Button>

        <div className="mt-3 mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, surname, or phone"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="table-responsive">
          {loading || error || _.isEmpty(data) ? (
            <TableChecker loading={loading} error={error} data={data} />
          ) : (
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
          )}
        </div>

        <CustomerFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          initialValues={
            editingCustomer || {
              name: "",
              surname: "",
              email: "",
              phone: "",
              houseNo: "",
              street: "",
              city: "",
              postalCode: "",
              customerType: "",
            }
          }
        />
      </div>
    </div>
  );
};

export default Customer;
