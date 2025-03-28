import React, { useState } from "react";
import { Modal, Button, Input, Table } from "antd";

const WasteManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);

  const products = [
    { id: 1, name: "Paper Roll", quantity: 100 },
    { id: 2, name: "Ink Cartridge", quantity: 50 },
    { id: 3, name: "Plastic Covers", quantity: 30 },
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleConfirmWaste = () => {
    console.log("Admin Email:", adminEmail);
    console.log("Admin Password:", adminPassword);
    console.log("Wasted Products:", selectedProducts);
    setIsModalVisible(false);
  };

  const handleProductSelect = (record) => {
    setSelectedProducts((prev) => {
      if (prev.find((p) => p.id === record.id)) {
        return prev.filter((p) => p.id !== record.id);
      }
      return [...prev, record];
    });
  };

  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Select",
      key: "select",
      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedProducts.some((p) => p.id === record.id)}
          onChange={() => handleProductSelect(record)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Waste Management</h2>
      <Table dataSource={products} columns={columns} rowKey="id" />
      <Button type="primary" onClick={showModal} disabled={selectedProducts.length === 0}>
        Submit Waste
      </Button>

      <Modal
        title="Admin Authentication"
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleConfirmWaste}
      >
        <p>Enter Admin Credentials</p>
        <Input
          placeholder="Admin Email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          style={{ marginBottom: "10px" }}
        />
        <Input.Password
          placeholder="Admin Password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default WasteManagement;
