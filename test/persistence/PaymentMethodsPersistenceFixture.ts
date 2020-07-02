// let _ = require('lodash');
// let async = require('async');
// let assert = require('chai').assert;

// import { FilterParams } from 'pip-services3-commons-node';
// import { PagingParams } from 'pip-services3-commons-node';

// import { PaymentMethodV1 } from '../../src/data/version1/PaymentMethodV1';
// import { PaymentMethodTypeV1 } from '../../src/data/version1/PaymentMethodTypeV1';
// import { CreditCardStateV1 } from '../../src/data/version1/CreditCardStateV1';

// import { IPaymentMethodsPersistence } from '../../src/persistence/IPaymentMethodsPersistence';
// import { AddressV1 } from '../../src/data/version1/AddressV1';

// let PAYMENT_METHOD1: PaymentMethodV1 = {
//     id: '1',
//     customer_id: '1',
//     type: PaymentMethodTypeV1.Visa,
//     number: '4032036094894795',
//     expire_month: 1,
//     expire_year: 2021,
//     first_name: 'Bill',
//     last_name: 'Gates',
//     billing_address: {
//         line1: '2345 Swan Rd',
//         city: 'Tucson',
//         state: 'AZ',
//         postal_code: '85710',
//         country_code: 'US'
//     },
//     ccv: '213',
//     name: 'Test Card 1',
//     saved: true,
//     default: true,
//     state: CreditCardStateV1.Ok
// };
// let PAYMENT_METHOD2: PaymentMethodV1 = {
//     id: '2',
//     customer_id: '1',
//     type: PaymentMethodTypeV1.Visa,
//     number: '4032037578262780',
//     expire_month: 4,
//     expire_year: 2028,
//     first_name: 'Joe',
//     last_name: 'Dow',
//     billing_address: {
//         line1: '123 Broadway Blvd',
//         city: 'New York',
//         state: 'NY',
//         postal_code: '123001',
//         country_code: 'US'
//     },
//     name: 'Test Card 2',
//     saved: true,
//     default: false,
//     state: CreditCardStateV1.Expired
// };
// let PAYMENT_METHOD3: PaymentMethodV1 = {
//     id: '3',
//     customer_id: '2',
//     type: PaymentMethodTypeV1.Visa,
//     number: '4032037578262780',
//     expire_month: 5,
//     expire_year: 2022,
//     first_name: 'Steve',
//     last_name: 'Jobs',
//     billing_address: {
//         line1: '234 6th Str',
//         city: 'Los Angeles',
//         state: 'CA',
//         postal_code: '65320',
//         country_code: 'US'
//     },
//     ccv: '124',
//     name: 'Test Card 2',
//     state: CreditCardStateV1.Ok
// };

// export class PaymentMethodsPersistenceFixture {
//     private _persistence: IPaymentMethodsPersistence;
    
//     constructor(persistence) {
//         assert.isNotNull(persistence);
//         this._persistence = persistence;
//     }

//     private testCreatePaymentMethods(done) {
//         async.series([
//         // Create one credit method
//             (callback) => {
//                 this._persistence.create(
//                     null,
//                     PAYMENT_METHOD1,
//                     (err, creditCard) => {
//                         assert.isNull(err);

//                         assert.isObject(creditCard);
//                         assert.equal(creditCard.first_name, PAYMENT_METHOD1.first_name);
//                         assert.equal(creditCard.last_name, PAYMENT_METHOD1.last_name);
//                         assert.equal(creditCard.expire_year, PAYMENT_METHOD1.expire_year);
//                         assert.equal(creditCard.customer_id, PAYMENT_METHOD1.customer_id);

//                         callback();
//                     }
//                 );
//             },
//         // Create another credit method
//             (callback) => {
//                 this._persistence.create(
//                     null,
//                     PAYMENT_METHOD2,
//                     (err, creditCard) => {
//                         assert.isNull(err);

//                         assert.isObject(creditCard);
//                         assert.equal(creditCard.first_name, PAYMENT_METHOD2.first_name);
//                         assert.equal(creditCard.last_name, PAYMENT_METHOD2.last_name);
//                         assert.equal(creditCard.expire_year, PAYMENT_METHOD2.expire_year);
//                         assert.equal(creditCard.customer_id, PAYMENT_METHOD2.customer_id);

//                         callback();
//                     }
//                 );
//             },
//         // Create yet another credit method
//             (callback) => {
//                 this._persistence.create(
//                     null,
//                     PAYMENT_METHOD3,
//                     (err, creditCard) => {
//                         assert.isNull(err);

//                         assert.isObject(creditCard);
//                         assert.equal(creditCard.first_name, PAYMENT_METHOD3.first_name);
//                         assert.equal(creditCard.last_name, PAYMENT_METHOD3.last_name);
//                         assert.equal(creditCard.expire_year, PAYMENT_METHOD3.expire_year);
//                         assert.equal(creditCard.customer_id, PAYMENT_METHOD3.customer_id);

//                         callback();
//                     }
//                 );
//             }
//         ], done);
//     }
                
//     testCrudOperations(done) {
//         let creditCard1: PaymentMethodV1;

//         async.series([
//         // Create items
//             (callback) => {
//                 this.testCreatePaymentMethods(callback);
//             },
//         // Get all credit methods
//             (callback) => {
//                 this._persistence.getPageByFilter(
//                     null,
//                     new FilterParams(),
//                     new PagingParams(),
//                     (err, page) => {
//                         assert.isNull(err);

//                         assert.isObject(page);
//                         assert.lengthOf(page.data, 3);

//                         creditCard1 = page.data[0];

//                         callback();
//                     }
//                 );
//             },
//         // Update the credit method
//             (callback) => {
//                 creditCard1.name = 'Updated Card 1';

//                 this._persistence.update(
//                     null,
//                     creditCard1,
//                     (err, creditCard) => {
//                         assert.isNull(err);

//                         assert.isObject(creditCard);
//                         assert.equal(creditCard.name, 'Updated Card 1');
//                         // PayPal changes id on update
//                         //!!assert.equal(creditCard.id, creditCard1.id);

//                         creditCard1 = creditCard;

//                         callback();
//                     }
//                 );
//             },
//         // Delete credit method
//             (callback) => {
//                 this._persistence.deleteById(
//                     null,
//                     creditCard1.id,
//                     (err) => {
//                         assert.isNull(err);

//                         callback();
//                     }
//                 );
//             },
//         // Try to get delete credit method
//             (callback) => {
//                 this._persistence.getOneById(
//                     null,
//                     creditCard1.id,
//                     (err, creditCard) => {
//                         assert.isNull(err);

//                         assert.isNull(creditCard || null);

//                         callback();
//                     }
//                 );
//             }
//         ], done);
//     }

//     testGetWithFilter(done) {
//         async.series([
//         // Create credit methods
//             (callback) => {
//                 this.testCreatePaymentMethods(callback);
//             },
//         // Get credit methods filtered by customer id
//             (callback) => {
//                 this._persistence.getPageByFilter(
//                     null,
//                     FilterParams.fromValue({
//                         customer_id: '1'
//                     }),
//                     new PagingParams(),
//                     (err, page) => {
//                         assert.isNull(err);

//                         assert.isObject(page);
//                         assert.lengthOf(page.data, 2);

//                         callback();
//                     }
//                 );
//             },
//         // Get credit methods by state
//             (callback) => {
//                 this._persistence.getPageByFilter(
//                     null,
//                     FilterParams.fromValue({
//                         state: 'ok'
//                     }),
//                     new PagingParams(),
//                     (err, page) => {
//                         assert.isNull(err);

//                         assert.isObject(page);
//                         // PayPal calculate states by itself
//                         //assert.lengthOf(page.data, 2);

//                         callback();
//                     }
//                 );
//             },
//         // Get credit methods by saved
//             (callback) => {
//                 this._persistence.getPageByFilter(
//                     null,
//                     FilterParams.fromValue({
//                         saved: true
//                     }),
//                     new PagingParams(),
//                     (err, page) => {
//                         assert.isNull(err);

//                         assert.isObject(page);
//                         assert.lengthOf(page.data, 2);

//                         callback();
//                     }
//                 );
//             },
//         // Get credit methods by ids
//             (callback) => {
//                 this._persistence.getPageByFilter(
//                     null,
//                     FilterParams.fromValue({
//                         ids: ['1', '3']
//                     }),
//                     new PagingParams(),
//                     (err, page) => {
//                         assert.isNull(err);

//                         assert.isObject(page);
//                         // PayPal manages ids by itself
//                         //assert.lengthOf(page.data, 2);

//                         callback();
//                     }
//                 );
//             },
//         ], done);
//     }

// }
