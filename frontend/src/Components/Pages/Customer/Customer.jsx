import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useTable } from "react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Modal } from "@mui/material";
import "./Customer.scss";
import axios from "axios";
import TableChecker from "../../Reusable/TableChecker/TableChecker.js";
import _ from "lodash";
import CustomerFormModal from "./CustomerFormModal"; // Adjust the import path
import socket from "../../../SocketConnection/SocketConnection.js";

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerData = await axios.get(
          "http://localhost:8080/customers/"
        );

        const formattedCustomers = customerData.data.map((customer) => {
          const utcDate = new Date(customer.addedDateAndTime);
          const sltDate = new Date(
            utcDate.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
          );

          return {
            id: customer.id,
            name: customer.name,
            surname: customer.surName,
            email: customer.email,
            phone: customer.contactNumber,
            totalSpent: "100", // Example data; replace with real data if needed
            houseNo: customer.houseNo,
            street: customer.street,
            city: customer.city,
            postalCode: customer.postalcode,
            customerType: customer.customerType,
            addedDate: sltDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }),
            addedTime: sltDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });

        setCustomers(formattedCustomers);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchData();

    // Listen for real-time customer updates
    socket.on("customerAdded", (newCustomer) => {
      const utcDate = new Date(newCustomer.addedDateAndTime);
      const sltDate = new Date(
        utcDate.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
      );

      const newCustomeradded = {
        ...newCustomer,
        surname: newCustomer.surName,
        phone: newCustomer.contactNumber,
        postalCode: newCustomer.postalcode,
        addedDate: sltDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        addedTime: sltDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        totalSpent: "500", // Example data; replace with real data if needed
      };
      setCustomers((prevCustomers) => [newCustomeradded, ...prevCustomers]);
    });

    socket.on("customerUpdated", (updatedCustomer) => {
      const utcDate = new Date(updatedCustomer.addedDateAndTime);
      const sltDate = new Date(
        utcDate.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
      );

      const newupdatedCustomer = {
        ...updatedCustomer,
        surname: updatedCustomer.surName,
        postalCode: updatedCustomer.postalcode,
        addedDate: sltDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        addedTime: sltDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        totalSpent: "600", // Example data; replace with real data if needed
      };
      setCustomers((prevCustomers) =>
        prevCustomers.map((customer) =>
          customer.id === updatedCustomer.id ? newupdatedCustomer : customer
        )
      );
    });

    socket.on("customerDeleted", ({ id }) => {
      setCustomers((prevCustomers) =>
        prevCustomers.filter((customer) => customer.id !== id)
      );
    });

    return () => {
      socket.off("customerAdded");
      socket.off("customerUpdated");
      socket.off("customerDeleted");
    };
  }, []);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(async (name, id) => {
    const confirmDelete = window.confirm(`Do you want to delete: ${name}?`);

    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `http://localhost:8080/customers/customer/${id}`
        );

        // setCustomers((prevCustomers) =>
        //   prevCustomers.filter((customer) => customer.id !== id)
        // );

        // Emit event for customer deletion
        socket.emit("customerDeleted", { id });

        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting details:", error);
        alert("Failed to delete the details. Please try again.");
      }
    }
  }, []);

  const handleSubmit = async (values) => {
    const currentDate = new Date();

    const data = {
      name: values.name,
      surName: values.surname,
      email: values.email,
      contactNumber: values.phone,
      houseNo: values.houseNo,
      street: values.street,
      city: values.city,
      postalcode: values.postalCode,
      customerType: values.customerType,
      addedDateAndTime: currentDate.toISOString(), // Automatically include the current date and time
    };

    if (editingCustomer) {
      try {
        const response = await axios.put(
          `http://localhost:8080/customers/customer/${editingCustomer.id}`,
          data
        );

        const updatedCustomer = {
          ...values,
          id: editingCustomer.id,
          addedDate: currentDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
          addedTime: currentDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          totalSpent: "200", // Example data; replace with real data if needed
        };

        // setCustomers((prevCustomers) =>
        //   prevCustomers.map((customer) =>
        //     customer.id === editingCustomer.id ? updatedCustomer : customer
        //   )
        // );

        // Emit event for customer update
        socket.emit("customerUpdated", updatedCustomer);

        alert(response.data.message);
      } catch (error) {
        console.error("Error updating customer:", error);
        alert("Failed to update the customer. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          "http://localhost:8080/customers/customer",
          data
        );

        const newCustomer = {
          ...values,
          id: response.data.id,
          addedDate: currentDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }),
          addedTime: currentDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          totalSpent: "100", // Example data; replace with real data if needed
        };

        // setCustomers((prevCustomers) => [newCustomer, ...prevCustomers]);

        // Emit event for new customer
        socket.emit("customerAdded", newCustomer);

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
          alert("Failed to add the customer. Please try again.");
        }
      }
    }

    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.surname?.toLowerCase() || "-").includes(
        searchQuery.toLowerCase()
      ) ||
      (customer.name?.toLowerCase() || "-").includes(
        searchQuery.toLowerCase()
      ) ||
      (customer.phone || "-").includes(searchQuery)
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
