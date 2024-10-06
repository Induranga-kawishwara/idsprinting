import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useTable } from "react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import TableChecker from "../../Reusable/TableChecker/TableChecker.js";
import _ from "lodash";
import CustomerFormModal from "./CustomerFormModal"; // Adjust the import path
import socket from "../../Utility/SocketConnection.js";
import { ConvertToSLT } from "../../Utility/ConvertToSLT.js";
import Loading from "../../Reusable/Loadingcomp/Loading.jsx";

const Customer = () => {
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingpage, setLoadingpage] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customerData = await axios.get(
          "https://candied-chartreuse-concavenator.glitch.me/customers/"
        );

        const formattedCustomers = customerData.data.map((customer) => {
          const { date, time } = ConvertToSLT(customer.addedDateAndTime);
          console.log(customer);
          return {
            ...customer,
            id: customer.id,
            surname: customer.surName,
            phone: customer.contactNumber,
            totalSpent: (customer.payments || []).reduce(
              (sum, payment) => sum + (payment.transaction?.total || 0),
              0
            ),
            addedDate: date,
            addedTime: time,
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
  }, []);

  useEffect(() => {
    // Listen for real-time customer updates
    socket.on("customerAdded", (newCustomer) => {
      const { date, time } = ConvertToSLT(newCustomer.addedDateAndTime);
      const newCustomeradded = {
        ...newCustomer,
        surname: newCustomer.surName,
        phone: newCustomer.contactNumber,
        postalCode: newCustomer.postalcode,
        addedDate: date,
        addedTime: time,
        totalSpent: (newCustomer.payments || []).reduce(
          (sum, payment) => sum + (payment.transaction?.total || 0),
          0
        ),
      };
      setCustomers((prevCustomers) => [newCustomeradded, ...prevCustomers]);
    });

    socket.on("customerUpdated", (updatedCustomer) => {
      const { date, time } = ConvertToSLT(updatedCustomer.addedDateAndTime);

      const newupdatedCustomer = {
        ...updatedCustomer,
        surname: updatedCustomer.surName,
        postalCode: updatedCustomer.postalcode,
        addedDate: date,
        addedTime: time,
        totalSpent: (updatedCustomer.payments || []).reduce(
          (sum, payment) => sum + (payment.transaction?.total || 0),
          0
        ),
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
  }, [customers]);

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = useCallback(async (name, id) => {
    const confirmDelete = window.confirm(`Do you want to delete: ${name}?`);

    if (confirmDelete) {
      try {
        const response = await axios.delete(
          `https://candied-chartreuse-concavenator.glitch.me/customers/${id}`
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error deleting details:", error);
        alert("Failed to delete the details. Please try again.");
      }
    }
  }, []);

  const handleSubmit = async (values) => {
    setLoadingpage(true);

    const currentDate = new Date();

    const data = {
      ...values,
      surName: values.surname,
      contactNumber: values.phone,
      addedDateAndTime: currentDate.toISOString(), // Automatically include the current date and time
    };

    if (editingCustomer) {
      try {
        const response = await axios.put(
          `https://candied-chartreuse-concavenator.glitch.me/customers/${editingCustomer.id}`,
          data
        );

        alert(response.data.message);
      } catch (error) {
        console.error("Error updating customer:", error);
        alert("Failed to update the customer. Please try again.");
      }
    } else {
      try {
        const response = await axios.post(
          "https://candied-chartreuse-concavenator.glitch.me/customers/",
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
          alert("Failed to add the customer. Please try again.");
        }
      }
    }
    setLoadingpage(false);
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
            <button
              variant="contained"
              size="small"
              onClick={() => handleEdit(row.original)}
              className="editbtn"
            >
              Edit
            </button>{" "}
            <button
              variant="contained"
              size="small"
              onClick={() =>
                handleDelete(
                  `${row.original.name} ${row.original.surname}`,
                  row.original.id
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
    [handleDelete]
  );

  const data = useMemo(() => filteredCustomers, [filteredCustomers]);

  const tableInstance = useTable({ columns, data });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const clearFilters = () => {
    setSearchQuery(""); // Reset the search query
  };

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
              onClick={() => {
                setIsModalOpen(true);
                setEditingCustomer(null);
              }}
              className="addnewbtntop"
            >
              New Customer
            </button>

            <div className="d-flex align-items-center mb-3">
              <input
                type="text"
                className="searchfunctions"
                placeholder="Search by name, surname, or phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                variant="contained"
                onClick={clearFilters}
                className="prevbutton"
              >
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
      )}
    </div>
  );
};

export default Customer;
