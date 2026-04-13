import { CloseIcon } from "@chakra-ui/icons";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import Spinner from "components/spinner/Spinner";
import { useFormik } from "formik";
import { useState } from "react";
import { postApi } from "services/api";
import { toast } from "react-toastify";
import { generateValidationSchema } from "utils";
import CustomForm from "utils/customForm";
import * as yup from "yup";

const Add = (props) => {
  const [isLoding, setIsLoding] = useState(false);
  const [mlsNumber, setMlsNumber] = useState("");
  const [isMlsLoding, setIsMlsLoding] = useState(false);

  const initialFieldValues = Object?.fromEntries(
    (props?.propertyData?.fields || [])?.map((field) => [field?.name, ""]),
  );

  const initialValues = {
    ...initialFieldValues,
    createBy: JSON.parse(localStorage.getItem("user"))._id,
  };

  const formik = useFormik({
    initialValues: initialValues,
    enableReinitialize: true,
    validationSchema: yup
      .object()
      ?.shape(generateValidationSchema(props?.propertyData?.fields)),

    onSubmit: (values, { resetForm }) => {
      AddData();
    },
  });

  const {
    errors,
    touched,
    values,
    handleBlur,
    handleChange,
    handleSubmit,
    setFieldValue,
  } = formik;

  const AddData = async () => {
    try {
      setIsLoding(true);
      let response = await postApi("api/form/add", {
        ...values,
        moduleId: props?.propertyData?._id,
      });
      if (response?.status === 200) {
        props.onClose();
        formik.resetForm();
        props.setAction((pre) => !pre);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsLoding(false);
    }
  };

  const handleMlsLookup = async () => {
    if (!mlsNumber.trim()) return;
    try {
      setIsMlsLoding(true);
      const response = await postApi("api/property/scrape-mls", { location: mlsNumber.trim() });
      if (response?.status === 200 && response?.data?.success) {
        const d = response.data.data;
        const updates = {};
        if (d.name !== undefined) updates.name = d.name;
        if (d.lrNo !== undefined) updates.lrNo = d.lrNo;
        if (d.status !== undefined) updates.status = d.status;
        if (d.yearBuilt !== undefined && d.yearBuilt !== null) updates.yearBuilt = String(d.yearBuilt);
        if (d.propertyDescription !== undefined) updates.propertyDescription = d.propertyDescription;
        if (d.location !== undefined) updates.location = d.location;
        if (d.flooringType !== undefined) updates.flooringType = d.flooringType;
        if (d.parking !== undefined) updates.parking = d.parking;
        if (d.Floor !== undefined && d.Floor !== null) updates.Floor = d.Floor;
        if (d.price !== undefined && d.price !== null) updates.price = d.price;
        if (d.beds !== undefined && d.beds !== null) updates.beds = d.beds;
        if (d.baths !== undefined && d.baths !== null) updates.baths = d.baths;
        if (d.sqft !== undefined && d.sqft !== null) updates.sqft = d.sqft;
        formik.setValues({ ...formik.values, ...updates });
        toast.success("Property data loaded");
      } else {
        // postApi catches errors and returns the axios error object — unwrap properly
        const errMsg =
          response?.data?.error ||
          response?.response?.data?.error ||
          response?.response?.data?.message ||
          (response?.response?.status ? `HTTP ${response.response.status}` : null) ||
          "Address not found";
        console.log("[Lookup] non-200 response:", response?.status, response?.response?.status, JSON.stringify(response?.data || response?.response?.data));
        toast.error(errMsg);
      }
    } catch (e) {
      console.error("[Lookup] exception:", e);
      toast.error("Lookup failed: " + (e?.message || "unknown error"));
    } finally {
      setIsMlsLoding(false);
    }
  };

  return (
    <div>
      <Drawer isOpen={props?.isOpen} size={props?.size}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader
            alignItems={"center"}
            justifyContent="space-between"
            display="flex"
          >
            Add Property
            <IconButton onClick={props?.onClose} icon={<CloseIcon />} />
          </DrawerHeader>
          <DrawerBody>
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
                background: "#f7fafc",
              }}
            >
              <p
                style={{
                  fontWeight: "600",
                  fontSize: "14px",
                  marginBottom: "10px",
                  color: "#2d3748",
                }}
              >
                Address Lookup
              </p>
              <InputGroup size="sm">
                <Input
                  placeholder="Enter property address (e.g. 123 Main St, Dallas TX)"
                  value={mlsNumber}
                  onChange={(e) => setMlsNumber(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleMlsLookup(); }}
                  background="white"
                  pr="80px"
                />
                <InputRightElement width="80px">
                  <Button
                    size="xs"
                    variant="brand"
                    onClick={handleMlsLookup}
                    disabled={isMlsLoding || !mlsNumber.trim()}
                    height="24px"
                    minWidth="68px"
                  >
                    {isMlsLoding ? <Spinner /> : "Lookup"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </div>
            <CustomForm
              moduleData={props?.propertyData}
              values={values}
              setFieldValue={setFieldValue}
              handleChange={handleChange}
              handleBlur={handleBlur}
              errors={errors}
              touched={touched}
            />
          </DrawerBody>

          <DrawerFooter>
            <Button
              size="sm"
              sx={{ textTransform: "capitalize" }}
              disabled={isLoding ? true : false}
              variant="brand"
              type="submit"
              onClick={handleSubmit}
            >
              {isLoding ? <Spinner /> : "Save"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              sx={{
                marginLeft: 2,
                textTransform: "capitalize",
              }}
              onClick={props?.onClose}
            >
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Add;
