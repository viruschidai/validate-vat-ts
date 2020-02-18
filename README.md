# Validate European VAT number

[![Build Status](https://travis-ci.com/viruschidai/validate-vat-ts.svg?branch=master)](https://travis-ci.com/viruschidai/validate-vat-ts)

The original [validate-vat](https://github.com/viruschidai/validate-vat) lib was written in CoffeeScript and did not update for many years. This rewrites it in TypeScript and should work in both server side and client side. This lib is basically calling web service provided by VIES (at http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl) for VAT number validation. 

## What is a VAT number?
A value added tax identification number or VAT identification number (VATIN) is an identifier used in many countries, including the countries of the European Union, for value added tax purposes.

## Get started
```bash
npm install validate-vat-ts
```
In your code
```javascript
import validateVat, {ViesValidationResponse} from 'validate-vat-ts';

const consumer = async () => {
  try {
    const validationInfo: ViesValidationResponse = await validateVat(CountryCodes.Germany, "12323");
  } catch (e) {
    console.log(e);
  }
}
```
For more usages, please refer to the [test file](./src/index.spec.ts).

##### Returns
when valid
```javascript
{
  countryCode: 'xx',
  vatNumber: 'xxxxxxxxx',
  requestDate: '2013-11-22+01:00',
  valid: true,
  name: 'company name',
  address: 'company address'
}
```
when invalid
```javascript
{
  countryCode: 'xx',
  vatNumber: 'xxxxxxxxxx',
  requestDate: '2013-11-22+01:00',
  valid: false,
  name: '---',
  address: '---'
}
```

#### Exceptions

The function will throw three types errors.

- ViesServerError
   
  This is when the VIES server returns some error code. The error message is whatever the `faultstring` returned from VIES server. You could probably find out all the possible error messages from the[test file](./src/index.spec.ts)

- ViesClientError 

  This is when the client side failed to talk to the VIES server.

- Error
  
  Happens in other unexpected situations


## License
The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
