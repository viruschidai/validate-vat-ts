import * as fetch from "isomorphic-fetch";

export interface ViesValidationResponse {
  countryCode: string;
  vatNumber: string;
  requestDate: string;
  valid: boolean;
  name?: string;
  address?: string;
}

export class ViesServerError extends Error {
  public soapResponse?: string;

  constructor(
    message?: string,
    soapResponse?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.soapResponse = soapResponse;
  }
}

export class ViesClientError extends Error {
  public soapResponse: string;

  constructor(public message: string, soapResponse: string) {
    super(message);
    Object.setPrototypeOf(this, ViesClientError.prototype);
    this.soapResponse = soapResponse;
  }
}

export const VAT_SERVICE_URL: string =
  "https://ec.europa.eu/taxation_customs/vies/services/checkVatService";

export const VAT_TEST_SERVICE_URL: string =
  "https://ec.europa.eu/taxation_customs/vies/services/checkVatTestService";

const soapBodyTemplate: string =
  '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"\n  xmlns:tns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types"\n  xmlns:impl="urn:ec.europa.eu:taxud:vies:services:checkVat">\n  <soap:Header>\n  </soap:Header>\n  <soap:Body>\n    <tns1:checkVat xmlns:tns1="urn:ec.europa.eu:taxud:vies:services:checkVat:types"\n     xmlns="urn:ec.europa.eu:taxud:vies:services:checkVat:types">\n     <tns1:countryCode>_country_code_placeholder_</tns1:countryCode>\n     <tns1:vatNumber>_vat_number_placeholder_</tns1:vatNumber>\n    </tns1:checkVat>\n  </soap:Body>\n</soap:Envelope>';

export enum CountryCodes {
  Austria = "AT",
  Belgium = "BE",
  Bulgaria = "BG",
  Croatia = "HR",
  Cyprus = "CY",
  CzechRepublic = "CZ",
  Denmark = "DK",
  Estonia = "EE",
  Finland = "FI",
  France = "FR",
  Germany = "DE",
  Hungary = "HU",
  Ireland = "IE",
  Italy = "IT",
  Latvia = "LV",
  Lithuania = "LT",
  Luxembourg = "LU",
  Malta = "MT",
  Netherlands = "NL",
  Poland = "PL",
  Portugal = "PT",
  Romania = "RO",
  Slovakia = "SK",
  Slovenia = "SI",
  Spain = "ES",
  Sweden = "SE",
  UnitedKingdom = "GB"
}

const getReadableErrorMsg = function(faultstring: string): string {
  switch (faultstring) {
    case "INVALID_INPUT":
      return "The provided CountryCode is invalid or the VAT number is empty";
    case "SERVICE_UNAVAILABLE":
      return "The VIES VAT service is unavailable, please try again later";
    case "MS_UNAVAILABLE":
      return "The VAT database of the requested member country is unavailable, please try again later";
    case "MS_MAX_CONCURRENT_REQ":
      return "The VAT database of the requested member country has had too many requests, please try again later";
    case "TIMEOUT":
      return "The request to VAT database of the requested member country has timed out, please try again later";
    case "SERVER_BUSY":
      return "The service cannot process your request, please try again later";
    case "INVALID_REQUESTER_INFO":
      return "The requester info is invalid";
    default:
      return "Unknown error";
  }
};

const parseField = (
  soapMessage: string,
  fieldName: string
): string | undefined => {
  const regex = new RegExp(
    `<${fieldName}>\((\.|\\s)\*?\)</${fieldName}>`,
    "gm"
  );
  const match = regex.exec(soapMessage);
  return match ? match[1] : undefined;
};

const hasFault = (soapMessage: string): boolean => {
  return soapMessage.match(/<soap:Fault>\S+<\/soap:Fault>/g) !== null;
};

const parseSoapResponse = (soapMessage: string): ViesValidationResponse => {
  if (hasFault(soapMessage)) {
    const faultString = parseField(soapMessage, "faultstring");

    throw new ViesServerError(
      faultString,
      soapMessage
    );
  } else {
    const countryCode = parseField(soapMessage, "countryCode");
    const vatNumber = parseField(soapMessage, "vatNumber");
    const requestDate = parseField(soapMessage, "requestDate");
    const valid = parseField(soapMessage, "valid");

    if (!countryCode || !vatNumber || !requestDate || !valid) {
      throw new ViesClientError(
        `Failed to parse vat validation info from VIES response`,
        soapMessage
      );
    }

    return {
      countryCode,
      vatNumber,
      requestDate,
      valid: valid === "true",
      name: parseField(soapMessage, "name"),
      address: parseField(soapMessage, "address")?.replace(/\n/g, ", ")
    };
  }
};

const headers = {
  "Content-Type": "application/x-www-form-urlencoded",
  "User-Agent": "node-soap",
  Accept:
    "text/html,application/xhtml+xml,application/xml,text/xml;q=0.9,*/*;q=0.8",
  "Accept-Encoding": "none",
  "Accept-Charset": "utf-8",
  Connection: "close",
  Host: "ec.europa.eu",
  SOAPAction: "urn:ec.europa.eu:taxud:vies:services:checkVat/checkVat"
};

const validateVat = async (
  countryCode: CountryCodes,
  vatNumber: string,
  serviceUrl: string = VAT_SERVICE_URL
): Promise<ViesValidationResponse> => {
  const xml = soapBodyTemplate
    .replace("_country_code_placeholder_", countryCode)
    .replace("_vat_number_placeholder_", vatNumber)
    .replace("\n", "")
    .trim();

  const response = await fetch(serviceUrl, {
    headers,
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    body: xml // body data type must match "Content-Type" header
  });

  return parseSoapResponse(await response.text());
};

export default validateVat;
