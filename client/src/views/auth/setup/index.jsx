import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { RiEyeCloseLine } from "react-icons/ri";
import { toast } from "react-toastify";
import DefaultAuth from "layouts/auth/Default";
import Spinner from "components/spinner/Spinner";
import { postApi } from "services/api";
import { constant } from "constant";

const setupSchema = Yup.object({
  firstName: Yup.string().min(1).max(50).required("First name is required"),
  lastName: Yup.string().min(1).max(50).required("Last name is required"),
  username: Yup.string().email("Must be a valid email").required("Email is required"),
  phoneNumber: Yup.string().optional(),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function Setup({ onSetupComplete }) {
  const textColor = useColorModeValue("navy.700", "white");
  const textColorSecondary = "gray.400";
  const brandStars = useColorModeValue("brand.500", "brand.400");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      username: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: setupSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${constant.baseUrl}api/user/complete-setup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: values.firstName,
            lastName: values.lastName,
            username: values.username,
            phoneNumber: values.phoneNumber,
            password: values.password,
          }),
        });
        const data = await response.json();

        if (response.ok) {
          // Store token and user just like the login flow does
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          toast.success("Account created! Welcome to RealEstate CRM.");
          onSetupComplete();
          navigate("/superAdmin");
        } else {
          toast.error(data.message || "Setup failed.");
        }
      } catch (e) {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
  });

  const { errors, values, touched, handleBlur, handleChange, handleSubmit } = formik;

  const Field = ({ name, label, type = "text", placeholder, showToggle, show, onToggle }) => (
    <FormControl isInvalid={errors[name] && touched[name]}>
      <FormLabel display="flex" ms="4px" fontSize="sm" fontWeight="500" color={textColor} mb="8px">
        {label}<Text color={brandStars}>*</Text>
      </FormLabel>
      <InputGroup size="md">
        <Input
          fontSize="sm"
          name={name}
          type={showToggle ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          value={values[name]}
          onChange={handleChange}
          onBlur={handleBlur}
          mb={errors[name] && touched[name] ? undefined : "16px"}
          fontWeight="500"
          size="lg"
          borderColor={errors[name] && touched[name] ? "red.300" : undefined}
        />
        {showToggle && (
          <InputRightElement display="flex" alignItems="center" mt="4px">
            <Icon
              color={textColorSecondary}
              _hover={{ cursor: "pointer" }}
              as={show ? RiEyeCloseLine : MdOutlineRemoveRedEye}
              onClick={onToggle}
            />
          </InputRightElement>
        )}
      </InputGroup>
      {errors[name] && touched[name] && (
        <FormErrorMessage mb="16px">{errors[name]}</FormErrorMessage>
      )}
    </FormControl>
  );

  return (
    <DefaultAuth>
      <Flex
        maxW={{ base: "100%", md: "max-content" }}
        w="100%"
        mx={{ base: "auto", lg: "0px" }}
        me="auto"
        h="fit-content"
        alignItems="start"
        justifyContent="center"
        mb={{ base: "30px", md: "60px" }}
        px={{ base: "25px", md: "0px" }}
        mt={{ base: "40px", md: "8vh" }}
        flexDirection="column"
      >
        <Box me="auto" mb="30px">
          <Heading color={textColor} fontSize="36px" mb="10px">
            Welcome! Let's get started.
          </Heading>
          <Text color={textColorSecondary} fontWeight="400" fontSize="md">
            Create your admin account to set up your CRM.
          </Text>
        </Box>

        <Flex
          direction="column"
          w={{ base: "100%", md: "480px" }}
          maxW="100%"
          background="transparent"
          borderRadius="15px"
          mx={{ base: "auto", lg: "unset" }}
          me="auto"
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={0} align="stretch">
              <Flex gap={4}>
                <Box flex={1}>
                  <Field name="firstName" label="First Name" placeholder="John" />
                </Box>
                <Box flex={1}>
                  <Field name="lastName" label="Last Name" placeholder="Doe" />
                </Box>
              </Flex>

              <Field
                name="username"
                label="Email"
                type="email"
                placeholder="admin@yourcompany.com"
              />

              <Field
                name="phoneNumber"
                label="Phone (optional)"
                type="tel"
                placeholder="+1 555 000 0000"
              />

              <Field
                name="password"
                label="Password"
                placeholder="Min. 8 characters"
                showToggle
                show={showPass}
                onToggle={() => setShowPass(!showPass)}
              />

              <Field
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Re-enter password"
                showToggle
                show={showConfirm}
                onToggle={() => setShowConfirm(!showConfirm)}
              />

              <Button
                fontSize="sm"
                variant="brand"
                fontWeight="500"
                w="100%"
                h="50px"
                type="submit"
                mt="8px"
                isDisabled={isLoading}
              >
                {isLoading ? <Spinner /> : "Create Admin Account"}
              </Button>
            </VStack>
          </form>
        </Flex>
      </Flex>
    </DefaultAuth>
  );
}
