export type FormFields = {
  refNo: string;
  name: string;
  address: string;
  subject: string;
  salary: string;
  email: string;
  mobile: string;
};

export const EMPTY_FORM: FormFields = {
  refNo: "",
  name: "",
  address: "",
  subject: "",
  salary: "",
  email: "",
  mobile: "",
};

export type OverlayOptions = {
  offsetX: number;
  offsetY: number;
};
