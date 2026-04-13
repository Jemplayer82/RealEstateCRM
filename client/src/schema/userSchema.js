import * as yup from "yup";

export const userSchema = yup.object({
  firstName: yup.string().required("First Name Is required"),
  lastName: yup.string(),

  phoneNumber: yup
    .string()
    .transform((val) => String(val ?? "").replace(/\D/g, ""))
    .matches(/^\d{10}$/, "Enter a valid 10-digit US phone number")
    .required("Phone Number is required"),
  username: yup
    .string()
    .email("Email must be a valid email")
    .required("Email Is required"),
});
