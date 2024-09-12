// components/DataTable.tsx
import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  DataGrid,
  GridRowsProp,
  GridRowModesModel,
  GridRowModes,
  GridColDef,
  GridToolbarContainer,
  GridActionsCellItem,
  GridEventListener,
  GridRowId,
  GridRowModel,
  GridRowEditStopReasons,
  GridSlots,
} from "@mui/x-data-grid";
import axios from "axios";

interface Record {
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

interface DataTableProps {
  data: Record[];
  handleDeleteRecord: (id: string) => void;
  handleEditRecord: (id: string, updatedRecord: Record) => void;
  handleAddRecord: (newRecord: Record) => void;
}

function EditToolbar(props: {
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel
  ) => void;
}) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = Date.now().toString(); // Generate unique ID using current timestamp
    const newRecord = {
      id,
      companySigDate: "",
      companySignatureName: "",
      documentName: "",
      documentStatus: "",
      documentType: "",
      employeeNumber: "",
      employeeSigDate: "",
      employeeSignatureName: "",
      isNew: true,
    };

    setRows((oldRows) => [...oldRows, newRecord]); // Add new row without making a request
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "companySigDate" }, // Set the new row to edit mode
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  handleDeleteRecord,
  handleEditRecord,
  handleAddRecord,
}) => {
  const [rows, setRows] = React.useState<GridRowsProp>(data);
  const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>(
    {}
  );

  React.useEffect(() => {
    setRows(data); // Update rows when data changes
  }, [data]);

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    event
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: GridRowId) => () => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.Edit },
    }));
  };

  const handleSaveClick = (id: GridRowId) => () => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View },
    }));
  };

  const handleDeleteClick = (id: GridRowId) => () => {
    handleDeleteRecord(id.toString());
  };

  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel((prev) => ({
      ...prev,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    }));

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow && editedRow.isNew) {
      setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    if (newRow.isNew) {
      // New record; send POST request
      try {
        const token = localStorage.getItem("token");

        const payload = {
          companySigDate: newRow.companySigDate,
          companySignatureName: newRow.companySignatureName,
          documentName: newRow.documentName,
          documentStatus: newRow.documentStatus,
          documentType: newRow.documentType,
          employeeNumber: newRow.employeeNumber,
          employeeSigDate: newRow.employeeSigDate,
          employeeSignatureName: newRow.employeeSignatureName,
        };

        console.log("Adding new record with payload:", payload);

        const response = await axios.post(
          "https://test.v5.pryaniky.com/ru/data/v3/testmethods/docs/userdocs/create",
          payload,
          {
            headers: { "x-auth": token },
          }
        );

        console.log("Add Record Response:", response.data);

        // Update the row with data from the response
        const updatedRow = {
          id: response.data.data.id,
          ...response.data.data,
          isNew: false,
        };
        setRows((prevRows) =>
          prevRows.map((row) => (row.id === newRow.id ? updatedRow : row))
        );
        return updatedRow;
      } catch (err) {
        console.error("Failed to add record:", err);
        setError("Failed to add record.");
      }
    } else {
      // Existing record; update state only
      setRows((prevRows) =>
        prevRows.map((row) => (row.id === newRow.id ? newRow : row))
      );
      handleEditRecord(newRow.id.toString(), newRow as Record);
      return newRow;
    }
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns: GridColDef[] = [
    {
      field: "companySigDate",
      headerName: "Company Sig Date",
      width: 180,
      editable: true,
    },
    {
      field: "companySignatureName",
      headerName: "Company Signature Name",
      width: 180,
      editable: true,
    },
    {
      field: "documentName",
      headerName: "Document Name",
      width: 150,
      editable: true,
    },
    {
      field: "documentStatus",
      headerName: "Document Status",
      width: 150,
      editable: true,
    },
    {
      field: "documentType",
      headerName: "Document Type",
      width: 150,
      editable: true,
    },
    {
      field: "employeeNumber",
      headerName: "Employee Number",
      width: 150,
      editable: true,
    },
    {
      field: "employeeSigDate",
      headerName: "Employee Sig Date",
      width: 180,
      editable: true,
    },
    {
      field: "employeeSignatureName",
      headerName: "Employee Signature Name",
      width: 180,
      editable: true,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key={id}
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
              color="primary"
            />,
            <GridActionsCellItem
              key={id}
              icon={<CancelIcon />}
              label="Cancel"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            key={id}
            icon={<EditIcon />}
            label="Edit"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key={id}
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar as GridSlots["toolbar"],
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel, handleAddRecord },
        }}
        getRowId={(row) => row.id}
      />
    </Box>
  );
};

export default DataTable;
function setError(arg0: string) {
  throw new Error("Function not implemented.");
}
