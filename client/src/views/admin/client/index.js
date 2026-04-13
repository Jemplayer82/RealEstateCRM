import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  GridItem,
  Text,
  useDisclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import {
  DeleteIcon,
  ViewIcon,
  EditIcon,
  EmailIcon,
  PhoneIcon,
} from "@chakra-ui/icons";
import { CiMenuKebab } from "react-icons/ci";
import { getApi } from "services/api";
import Add from "./Add";
import Edit from "./Edit";
import AddEmailHistory from "../emailHistory/components/AddEmail";
import AddPhoneCall from "../phoneCall/components/AddPhoneCall";
import { HasAccess } from "../../../redux/accessUtils";
import CommonCheckTable from "../../../components/reactTable/checktable";
import ImportModal from "./components/ImportModel";
import CommonDeleteModel from "components/commonDeleteModel";
import { deleteManyApi } from "services/api";
import { fetchClientData } from "../../../redux/slices/clientSlice";
import { useDispatch, useSelector } from "react-redux";
import { fetchClientCustomFiled } from "../../../redux/slices/clientCustomFiledSlice";
import { toast } from "react-toastify";
import { formatPhoneUS } from 'utils/phone';

const Index = () => {
  const navigate = useNavigate();
  const [permission, emailAccess, callAccess] = HasAccess([
    "Clients",
    "Emails",
    "Calls",
  ]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();

  const [isLoding, setIsLoding] = useState(false);
  const [action, setAction] = useState(false);
  const [columns, setColumns] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [edit, setEdit] = useState(false);
  const [deleteModel, setDelete] = useState(false);
  const [addPhoneCall, setAddPhoneCall] = useState(false);
  const [callSelectedId, setCallSelectedId] = useState();
  const [addEmailHistory, setAddEmailHistory] = useState(false);
  const [selectedId, setSelectedId] = useState();
  const [selectedValues, setSelectedValues] = useState([]);
  const [isImportClient, setIsImport] = useState(false);
  const [emailRec, setEmailRec] = useState("");
  const [phoneRec, setPhoneRec] = useState({});

  const data = useSelector((state) => state?.clientData?.data);

  const handleOpenEmail = (id, dataClient) => {
    if (id) {
      setEmailRec(dataClient?.email);
      setAddEmailHistory(true);
    }
  };

  const fetchCustomDataFields = async () => {
    setIsLoding(true);
    const result = await dispatch(fetchClientCustomFiled());
    if (result?.payload?.status === 200) {
      setClientData(result?.payload?.data);
    } else {
      toast.error("Failed to fetch data", "error");
    }
    const actionHeader = {
      Header: "Action",
      accessor: "action",
      isSortable: false,
      center: true,
      cell: ({ row }) => (
        <Text fontSize="md" fontWeight="900" textAlign={"center"}>
          <Menu isLazy>
            <MenuButton>
              <CiMenuKebab />
            </MenuButton>
            <MenuList
              minW={"fit-content"}
              transform={"translate(1520px, 173px);"}
            >
              {permission?.update && (
                <MenuItem
                  py={2.5}
                  icon={<EditIcon fontSize={15} mb={1} />}
                  onClick={() => {
                    setEdit(true);
                    setSelectedId(row?.values?._id);
                  }}
                >
                  Edit
                </MenuItem>
              )}
              {callAccess?.create && (
                <MenuItem
                  py={2.5}
                  width={"165px"}
                  onClick={() => {
                    setPhoneRec(row?.original);
                    setAddPhoneCall(true);
                    setCallSelectedId(row?.values?._id);
                  }}
                  icon={<PhoneIcon fontSize={15} mb={1} />}
                >
                  Create Call
                </MenuItem>
              )}
              {emailAccess?.create && (
                <MenuItem
                  py={2.5}
                  width={"165px"}
                  onClick={() => {
                    handleOpenEmail(row?.values?._id, row?.original);
                    setSelectedId(row?.values?._id);
                  }}
                  icon={<EmailIcon fontSize={15} mb={1} />}
                >
                  Send Email
                </MenuItem>
              )}
              {permission?.view && (
                <MenuItem
                  py={2.5}
                  color={"green"}
                  icon={<ViewIcon mb={1} fontSize={15} />}
                  onClick={() => {
                    navigate(`/clientView/${row?.values?._id}`);
                  }}
                >
                  View
                </MenuItem>
              )}
              {permission?.delete && (
                <MenuItem
                  py={2.5}
                  color={"red"}
                  icon={<DeleteIcon fontSize={15} mb={1} />}
                  onClick={() => {
                    setDelete(true);
                    setSelectedValues([row?.values?._id]);
                  }}
                >
                  Delete
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </Text>
      ),
    };

    const tempTableColumns = [
      { Header: "#", accessor: "_id", isSortable: false, width: 10 },
      ...(result?.payload?.data && result?.payload?.data?.length > 0
        ? result?.payload?.data[0]?.fields
            ?.filter((field) => field?.isTableField === true && field?.isView)
            ?.map((field) => ({
              Header: field?.label,
              accessor: field?.name,
              cell: (cell) => (
                <div className="selectOpt">
                  <Text
                    onClick={() => {
                      navigate(`/clientView/${cell?.row?.original?._id}`);
                    }}
                    me="10px"
                    sx={{
                      "&:hover": {
                        color: "blue.500",
                        textDecoration: "underline",
                      },
                      cursor: "pointer",
                    }}
                    color="brand.600"
                    fontSize="sm"
                    fontWeight="700"
                  >
                    {field?.type === "tel"
                      ? formatPhoneUS(cell?.value) || "-"
                      : cell?.value || "-"}
                  </Text>
                </div>
              ),
            })) || []
        : []),
      ...(result?.payload?.data?.[0]?.fields || []) // Check if fields is defined, if not, use empty array
        ?.filter((field) => field?.isTableField === true && !field?.isView) // Filter out fields where isTableField is true
        ?.map((field) => ({
          Header: field?.label,
          accessor: field?.name,
          cell: (cell) => field?.type === "tel"
            ? formatPhoneUS(cell?.value) || " - "
            : cell?.value || " - ",
        })),
      ...(permission?.update || permission?.view || permission?.delete
        ? [actionHeader]
        : []),
    ];

    setColumns(tempTableColumns);
    setIsLoding(false);
  };

  const handleDeleteClient = async (ids) => {
    try {
      setIsLoding(true);
      let response = await deleteManyApi("api/client/deleteMany", ids);
      if (response?.status === 200) {
        setSelectedValues([]);
        setDelete(false);
        setAction((pre) => !pre);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoding(false);
    }
  };

  useEffect(async () => {
    // fetchData();
    await dispatch(fetchClientData());
    fetchCustomDataFields();
  }, [action]);

  return (
    <div>
      <Grid templateColumns="repeat(6, 1fr)" mb={3} gap={4}>
        {!isLoding && (
          <GridItem colSpan={6}>
            <CommonCheckTable
              title={"Clients"}
              isLoding={isLoding}
              columnData={columns ?? []}
              // dataColumn={dataColumn ?? []}
              allData={data ?? []}
              tableData={data}
              tableCustomFields={
                clientData?.[0]?.fields?.filter(
                  (field) => field?.isTableField === true,
                ) || []
              }
              access={permission}
              // action={action}
              // setAction={setAction}
              // selectedColumns={selectedColumns}
              // setSelectedColumns={setSelectedColumns}
              // isOpen={isOpen}
              // onClose={onclose}
              onOpen={onOpen}
              selectedValues={selectedValues}
              setSelectedValues={setSelectedValues}
              setDelete={setDelete}
              setIsImport={setIsImport}
            />
          </GridItem>
        )}
      </Grid>

      {isOpen && (
        <Add
          isOpen={isOpen}
          size={"lg"}
          clientData={clientData[0]}
          onClose={onClose}
          setAction={setAction}
          action={action}
        />
      )}
      {edit && (
        <Edit
          isOpen={edit}
          size={"lg"}
          clientData={clientData[0]}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onClose={setEdit}
          setAction={setAction}
          moduleId={clientData?.[0]?._id}
        />
      )}
      {deleteModel && (
        <CommonDeleteModel
          isOpen={deleteModel}
          onClose={() => setDelete(false)}
          type="Clients"
          handleDeleteData={handleDeleteClient}
          ids={selectedValues}
        />
      )}
      {addEmailHistory && (
        <AddEmailHistory
          fetchData={fetchClientData}
          isOpen={addEmailHistory}
          onClose={setAddEmailHistory}
          id={selectedId}
          contactEmail={emailRec}
        />
      )}
      {addPhoneCall && (
        <AddPhoneCall
          fetchData={fetchClientData}
          isOpen={addPhoneCall}
          onClose={setAddPhoneCall}
          id={callSelectedId}
          cData={phoneRec}
        />
      )}
      {isImportClient && (
        <ImportModal
          text="Client file"
          isOpen={isImportClient}
          onClose={setIsImport}
          customFields={clientData?.[0]?.fields || []}
        />
      )}
    </div>
  );
};

export default Index;
