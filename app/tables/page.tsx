// app/table/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import DataTable from "@/components/DataTable";

interface RecordType {
  id: string;
  companySigDate: string;
  companySignatureName: string;
  documentName: string;
  documentStatus: string;
  documentType: string;
  employeeNumber: string;
  employeeSigDate: string;
  employeeSignatureName: string;
}

const TablePage: React.FC = () => {
  const [data, setData] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/"); // Redirect to login if not authenticated
      return;
    }
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API +
          "ru/data/v3/testmethods/docs/userdocs/get",
        {
          headers: { "x-auth": token },
        }
      );
      setData(response.data.data); // Adjust based on the actual response structure
      console.log(response.data.data);
    } catch (err) {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (newRecord: Partial<RecordType>) => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Unauthorized: No token provided.");
        setLoading(false);
        return;
      }

      const payload = {
        companySigDate: newRecord.companySigDate,
        companySignatureName: newRecord.companySignatureName,
        documentName: newRecord.documentName,
        documentStatus: newRecord.documentStatus,
        documentType: newRecord.documentType,
        employeeNumber: newRecord.employeeNumber,
        employeeSigDate: newRecord.employeeSigDate,
        employeeSignatureName: newRecord.employeeSignatureName,
      };

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API +
          "ru/data/v3/testmethods/docs/userdocs/create",
        payload,
        {
          headers: { "x-auth": token },
        }
      );

      // Ensure the new record is formatted correctly with an `id`
      const newRow = { id: response.data.data.id, ...response.data.data };

      // Update the data state with the newly added record from the response
      setData((prevData) => [...prevData, newRow]);
    } catch (err) {
      console.error("Failed to add record:", err);
      setError("Failed to add record.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async (
    id: string,
    updatedRecord: Omit<RecordType, "id">
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        process.env.NEXT_PUBLIC_API +
          `ru/data/v3/testmethods/docs/userdocs/set/${id}`,
        updatedRecord,
        {
          headers: { "x-auth": token },
        }
      );
      setData(
        data.map((item) =>
          item.id === id ? { ...item, ...updatedRecord } : item
        )
      );
    } catch (err) {
      setError("Failed to update record.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        process.env.NEXT_PUBLIC_API +
          `ru/data/v3/testmethods/docs/userdocs/delete/${id}`,
        {},
        { headers: { "x-auth": token } }
      );
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      setError("Failed to delete record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Data Table</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <DataTable
        data={data}
        handleDeleteRecord={handleDeleteRecord}
        handleEditRecord={handleUpdateRecord}
        handleAddRecord={handleAddRecord}
      />
    </div>
  );
};

export default TablePage;
