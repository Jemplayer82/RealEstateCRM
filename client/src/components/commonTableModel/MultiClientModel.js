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
import React, { useState, useEffect } from "react";
import ClientTable from "./Client.js";
import Spinner from "components/spinner/Spinner";
import { fetchClientCustomFiled } from "../../redux/slices/clientCustomFiledSlice.js";
import { fetchClientData } from "../../redux/slices/clientSlice.js";
import { GiClick } from "react-icons/gi";
import { useDispatch } from "react-redux";

const MultiClientModel = (props) => {
  const { onClose, isOpen, fieldName, setFieldValue, data } = props;
  const [selectedValues, setSelectedValues] = useState([]);
  const [columns, setColumns] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [isLoding, setIsLoding] = useState(false);
  const dispatch = useDispatch();

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

  const user = JSON.parse(localStorage.getItem("user"));

  const uniqueValues = [...new Set(selectedValues)];

  const handleSubmit = async () => {
    try {
      setIsLoding(true);
      setFieldValue(fieldName, uniqueValues);
      onClose();
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoding(false);
    }
  };

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
            <ClientTable
              title={"Clients"}
              isLoding={isLoding}
              allData={data}
              tableData={data}
              type="multi"
              tableCustomFields={
                clientData?.[0]?.fields?.filter(
                  (field) => field?.isTableField === true,
                ) || []
              }
              selectedValues={selectedValues}
              setSelectedValues={setSelectedValues}
              columnsData={columns ?? []}
            />
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            variant="brand"
            onClick={handleSubmit}
            disabled={isLoding ? true : false}
            leftIcon={<GiClick />}
          >
            {" "}
            {isLoding ? <Spinner /> : "Select"}
          </Button>
          <Button onClick={() => onClose()}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MultiClientModel;
