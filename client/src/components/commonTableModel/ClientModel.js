import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import ClientTable from "./Client.js";
import Spinner from "components/spinner/Spinner";
import { GiClick } from "react-icons/gi";
import CommonCheckTable from "components/reactTable/checktable.js";
import { fetchClientCustomFiled } from "../../redux/slices/clientCustomFiledSlice.js";
import { fetchClientData } from "../../redux/slices/clientSlice.js";
import { useDispatch } from "react-redux";

const ClientModel = (props) => {
  const { onClose, isOpen, fieldName, setFieldValue, data } = props;
  const [selectedValues, setSelectedValues] = useState();
  const [clientData, setClientData] = useState([]);
  const [isLoding, setIsLoding] = useState(false);
  const [columns, setColumns] = useState([]);
  const dispatch = useDispatch();

  const handleSubmit = async () => {
    try {
      setIsLoding(true);
      setFieldValue(fieldName, selectedValues);
      onClose();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoding(false);
    }
  };
  const fetchCustomDataFields = async () => {
    setIsLoding(true);
    const result = await dispatch(fetchClientCustomFiled());
    setClientData(result?.payload?.data);

    const tempTableColumns = [
      { Header: "#", accessor: "_id", isSortable: false, width: 10 },
      ...(result?.payload?.data?.[0]?.fields || [])
        .filter((field) => field?.isTableField === true)
        .map((field) => ({ Header: field?.label, accessor: field?.name })),
    ];

    setColumns(tempTableColumns);
    setIsLoding(false);
  };
  useEffect(async () => {
    await dispatch(fetchClientData());
    fetchCustomDataFields();
  }, []);
  return (
    <Modal onClose={onClose} size="full" isOpen={isOpen}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Client</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoding ? (
            <Flex justifyContent={"center"} alignItems={"center"} width="100%">
              <Spinner />
            </Flex>
          ) : (
            <CommonCheckTable
              title={"Clients"}
              isLoding={isLoding}
              columnData={columns ?? []}
              // dataColumn={columns ?? []}
              allData={data ?? []}
              tableData={data}
              tableCustomFields={
                clientData?.[0]?.fields?.filter(
                  (field) => field?.isTableField === true,
                ) || []
              }
              AdvanceSearch={() => ""}
              ManageGrid={false}
              deleteMany={false}
              selectedValues={selectedValues}
              setSelectedValues={setSelectedValues}
              selectType="single"
              customSearch={false}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="brand"
            size="sm"
            me={2}
            onClick={handleSubmit}
            disabled={isLoding ? true : false}
            leftIcon={<GiClick />}
          >
            {" "}
            {isLoding ? <Spinner /> : "Select"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            colorScheme="red"
            onClick={() => onClose()}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ClientModel;
