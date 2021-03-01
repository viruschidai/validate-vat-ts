import validateVat, {
  CountryCodes,
  ViesValidationResponse,
  ViesServerError,
  ViesClientError,
  VAT_TEST_SERVICE_URL
} from "./index";

describe("validateVat()", () => {
  describe("Using VIES prod service", () => {
    test("should return true if it is a valid VAT number", async () => {
      const result = (await validateVat(
        CountryCodes.Netherlands,
        "853746333B01"
      )) as ViesValidationResponse;
      expect(result.valid).toBeTruthy();
    }, 10000);

    test.skip("should return false if it is an invalid VAT number", async () => {
      const result = (await validateVat(
        CountryCodes.UnitedKingdom,
        "802311783"
      )) as ViesValidationResponse;
      expect(result.valid).toBeFalsy();
    }, 10000);

    test("should throw INVALID_INPUT when VAT number is invalid", async () => {
      try {
        await validateVat( CountryCodes.UnitedKingdom, "802311783");
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe("INVALID_INPUT");
      }
    }, 10000);

    test("should throw INVALID_INPUT when VAT number is empty", async done => {
      try {
        await validateVat(CountryCodes.Germany, "");
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe("INVALID_INPUT");
        done();
      }
    }, 10000);

    test("should throw Error when failed to call service", async done => {
      try {
        await validateVat(
          CountryCodes.Germany,
          "test",
          "http://www.vattest123.com"
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        done();
      }
    });
  });

  describe("Using VIES testing service", () => {
    test("should return true if VAT number is 100", async () => {
      const result = (await validateVat(
        CountryCodes.Finland,
        "100",
        VAT_TEST_SERVICE_URL
      )) as ViesValidationResponse;
      expect(result.valid).toBeTruthy();
    });

    test("should return false if VAT number is 200", async () => {
      const result = (await validateVat(
        CountryCodes.Germany,
        "200",
        VAT_TEST_SERVICE_URL
      )) as ViesValidationResponse;
      expect(result.valid).toBeFalsy();
    });

    test("should throw INVALID_INPUT when VAT number is 201", async done => {
      try {
        await validateVat(CountryCodes.Germany, "201", VAT_TEST_SERVICE_URL);
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe("INVALID_INPUT");
        done();
      }
    });

    test("should throw INVALID_REQUESTER_INFO when VAT number is 202", async done => {
      try {
        await validateVat(CountryCodes.Germany, "202", VAT_TEST_SERVICE_URL);
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe("INVALID_REQUESTER_INFO");
        done();
      }
    });

    test("should throw SERVICE_UNAVAILABLE when VAT number is 300", async done => {
      try {
        await validateVat(CountryCodes.Germany, "300", VAT_TEST_SERVICE_URL);
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe("SERVICE_UNAVAILABLE");
        done();
      }
    });

    test("should throw MS_UNAVAILABLE when VAT number is 301", async done => {
      try {
        await validateVat(CountryCodes.Germany, "301", VAT_TEST_SERVICE_URL);
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe("MS_UNAVAILABLE");
        done();
      }
    });

    test("should throw TIMEOUT when VAT number is 302", async done => {
      try {
        await validateVat(CountryCodes.Germany, "302", VAT_TEST_SERVICE_URL);
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe("TIMEOUT");
        done();
      }
    });

    test("should throw VAT_BLOCKED when VAT number is 400", async done => {
      try {
        await validateVat(CountryCodes.Germany, "400", VAT_TEST_SERVICE_URL);
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe("VAT_BLOCKED");
        done();
      }
    });

    test("should throw IP_BLOCKED when VAT number is 401", async done => {
      try {
        await validateVat(CountryCodes.Germany, "401", VAT_TEST_SERVICE_URL);
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe("IP_BLOCKED");
        done();
      }
    });

    test("should throw GLOBAL_MAX_CONCURRENT_REQ when VAT number is 500", async done => {
      try {
        await validateVat(CountryCodes.Germany, "500", VAT_TEST_SERVICE_URL);
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe(
          "GLOBAL_MAX_CONCURRENT_REQ"
        );
        done();
      }
    });

    test("should throw GLOBAL_MAX_CONCURRENT_REQ_TIME when VAT number is 501", async done => {
      try {
        await validateVat(CountryCodes.Germany, "501", VAT_TEST_SERVICE_URL);
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe(
          "GLOBAL_MAX_CONCURRENT_REQ_TIME"
        );
        done();
      }
    });

    test("should throw MS_MAX_CONCURRENT_REQ when VAT number is 600", async done => {
      try {
        await validateVat(CountryCodes.Germany, "600", VAT_TEST_SERVICE_URL);
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe("MS_MAX_CONCURRENT_REQ");
        done();
      }
    });

    test("should throw MS_MAX_CONCURRENT_REQ_TIME when VAT number is 601", async done => {
      try {
        await validateVat(CountryCodes.Germany, "601", VAT_TEST_SERVICE_URL);
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe(
          "MS_MAX_CONCURRENT_REQ_TIME"
        );
        done();
      }
    });

    test("should throw SERVICE_UNAVAILABLE for all other cases", async done => {
      try {
        await validateVat(CountryCodes.Germany, "700", VAT_TEST_SERVICE_URL);
      } catch (e) {
        expect(e).toBeInstanceOf(ViesServerError);
        expect((e as ViesServerError).message).toBe("SERVICE_UNAVAILABLE");
        done();
      }
    });
  });
});
