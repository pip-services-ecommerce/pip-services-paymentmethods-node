// let _ = require('lodash');
// let async = require('async');
// let restify = require('restify');
// let assert = require('chai').assert;

// import { ConfigParams } from 'pip-services3-commons-node';
// import { Descriptor } from 'pip-services3-commons-node';
// import { References } from 'pip-services3-commons-node';

// import { PaymentMethodV1 } from '../../../src/data/version1/PaymentMethodV1';
// import { PaymentMethodTypeV1 } from '../../../src/data/version1/PaymentMethodTypeV1';
// import { CreditCardStateV1 } from '../../../src/data/version1/CreditCardStateV1';
// import { PaymentMethodsMemoryPersistence } from '../../../src/persistence/PaymentMethodsMemoryPersistence';
// import { PaymentMethodsController } from '../../../src/logic/PaymentMethodsController';
// import { PaymentMethodsHttpServiceV1 } from '../../../src/services/version1/PaymentMethodsHttpServiceV1';

// let httpConfig = ConfigParams.fromTuples(
//     "connection.protocol", "http",
//     "connection.host", "localhost",
//     "connection.port", 3000
// );

// let PAYMENT_METHOD1: PaymentMethodV1 = {
//     id: '1',
//     customer_id: '1',
//     type: PaymentMethodTypeV1.Visa,
//     number: '1111111111111111',
//     expire_month: 1,
//     expire_year: 2021,
//     first_name: 'Bill',
//     last_name: 'Gates',
//     billing_address: {
//         line1: '2345 Swan Rd',
//         city: 'Tucson',
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
//     number: '2222222222222222',
//     expire_month: 4,
//     expire_year: 2028,
//     first_name: 'Joe',
//     last_name: 'Dow',
//     billing_address: {
//         line1: '123 Broadway Blvd',
//         city: 'New York',
//         postal_code: '123001',
//         country_code: 'US'
//     },
//     name: 'Test Card 2',
//     saved: true,
//     default: false,
//     state: CreditCardStateV1.Expired
// };


// suite('PaymentMethodsHttpServiceV1', ()=> {    
//     let service: PaymentMethodsHttpServiceV1;
//     let rest: any;

//     suiteSetup((done) => {
//         let persistence = new PaymentMethodsMemoryPersistence();
//         let controller = new PaymentMethodsController();

//         service = new PaymentMethodsHttpServiceV1();
//         service.configure(httpConfig);

//         let references: References = References.fromTuples(
//             new Descriptor('pip-services-paymentmethods', 'persistence', 'memory', 'default', '1.0'), persistence,
//             new Descriptor('pip-services-paymentmethods', 'controller', 'default', 'default', '1.0'), controller,
//             new Descriptor('pip-services-paymentmethods', 'service', 'http', 'default', '1.0'), service
//         );
//         controller.setReferences(references);
//         service.setReferences(references);

//         service.open(null, done);
//     });
    
//     suiteTeardown((done) => {
//         service.close(null, done);
//     });

//     setup(() => {
//         let url = 'http://localhost:3000';
//         rest = restify.createJsonClient({ url: url, version: '*' });
//     });
    
    
//     test('CRUD Operations', (done) => {
//         let creditCard1, creditCard2: PaymentMethodV1;

//         async.series([
//         // Create one credit method
//             (callback) => {
//                 rest.post('/v1/payment_methods/create_payment_method',
//                     {
//                         method: PAYMENT_METHOD1
//                     },
//                     (err, req, res, creditCard) => {
//                         assert.isNull(err);

//                         assert.isObject(creditCard);
//                         assert.equal(creditCard.number, PAYMENT_METHOD1.number);
//                         assert.equal(creditCard.expire_year, PAYMENT_METHOD1.expire_year);
//                         assert.equal(creditCard.customer_id, PAYMENT_METHOD1.customer_id);

//                         creditCard1 = creditCard;

//                         callback();
//                     }
//                 );
//             },
//         // Create another credit method
//             (callback) => {
//                 rest.post('/v1/payment_methods/create_payment_method', 
//                     {
//                         method: PAYMENT_METHOD2
//                     },
//                     (err, req, res, creditCard) => {
//                         assert.isNull(err);

//                         assert.isObject(creditCard);
//                         assert.equal(creditCard.number, PAYMENT_METHOD2.number);
//                         assert.equal(creditCard.expire_year, PAYMENT_METHOD2.expire_year);
//                         assert.equal(creditCard.customer_id, PAYMENT_METHOD2.customer_id);

//                         creditCard2 = creditCard;

//                         callback();
//                     }
//                 );
//             },
//         // Get all credit methods
//             (callback) => {
//                 rest.post('/v1/payment_methods/get_payment_methods',
//                     {},
//                     (err, req, res, page) => {
//                         assert.isNull(err);

//                         assert.isObject(page);
//                         assert.lengthOf(page.data, 2);

//                         callback();
//                     }
//                 );
//             },
//         // Update the credit method
//             (callback) => {
//                 creditCard1.name = 'Updated Card 1';

//                 rest.post('/v1/payment_methods/update_payment_method',
//                     { 
//                         method: creditCard1
//                     },
//                     (err, req, res, creditCard) => {
//                         assert.isNull(err);

//                         assert.isObject(creditCard);
//                         assert.equal(creditCard.name, 'Updated Card 1');
//                         assert.equal(creditCard.id, PAYMENT_METHOD1.id);

//                         creditCard1 = creditCard;

//                         callback();
//                     }
//                 );
//             },
//         // Delete credit method
//             (callback) => {
//                 rest.post('/v1/payment_methods/delete_payment_method_by_id',
//                     {
//                         method_id: creditCard1.id,
//                         customer_id: creditCard1.customer_id
//                     },
//                     (err, req, res, result) => {
//                         assert.isNull(err);

//                         //assert.isNull(result);

//                         callback();
//                     }
//                 );
//             },
//         // Try to get delete credit method
//             (callback) => {
//                 rest.post('/v1/payment_methods/get_payment_method_by_id',
//                     {
//                         method_id: creditCard1.id,
//                         customer_id: creditCard1.customer_id
//                     },
//                     (err, req, res, result) => {
//                         assert.isNull(err);

//                         //assert.isNull(result);

//                         callback();
//                     }
//                 );
//             }
//         ], done);
//     });
// });