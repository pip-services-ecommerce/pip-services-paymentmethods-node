// let _ = require('lodash');
// let async = require('async');
// let assert = require('chai').assert;

// import { Descriptor } from 'pip-services3-commons-node';
// import { ConfigParams } from 'pip-services3-commons-node';
// import { References } from 'pip-services3-commons-node';
// import { ConsoleLogger } from 'pip-services3-components-node';

// import { PaymentMethodV1 } from '../../src/data/version1/PaymentMethodV1';
// import { PaymentMethodTypeV1 } from '../../src/data/version1/PaymentMethodTypeV1';
// import { CreditCardStateV1 } from '../../src/data/version1/CreditCardStateV1';
// import { PaymentMethodsMemoryPersistence } from '../../src/persistence/PaymentMethodsMemoryPersistence';
// import { PaymentMethodsController } from '../../src/logic/PaymentMethodsController';
// import { PaymentMethodsLambdaFunction } from '../../src/container/PaymentMethodsLambdaFunction';

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

// suite('PaymentMethodsLambdaFunction', ()=> {
//     let lambda: PaymentMethodsLambdaFunction;

//     suiteSetup((done) => {
//         let config = ConfigParams.fromTuples(
//             'logger.descriptor', 'pip-services:logger:console:default:1.0',
//             'persistence.descriptor', 'pip-services-paymentmethods:persistence:memory:default:1.0',
//             'controller.descriptor', 'pip-services-paymentmethods:controller:default:default:1.0'
//         );

//         lambda = new PaymentMethodsLambdaFunction();
//         lambda.configure(config);
//         lambda.open(null, done);
//     });
    
//     suiteTeardown((done) => {
//         lambda.close(null, done);
//     });
    
//     test('CRUD Operations', (done) => {
//         var creditCard1, creditCard2: PaymentMethodV1;

//         async.series([
//         // Create one credit method
//             (callback) => {
//                 lambda.act(
//                     {
//                         role: 'payment_methods',
//                         cmd: 'create_payment_method',
//                         method: PAYMENT_METHOD1
//                     },
//                     (err, creditCard) => {
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
//                 lambda.act(
//                     {
//                         role: 'payment_methods',
//                         cmd: 'create_payment_method',
//                         method: PAYMENT_METHOD2
//                     },
//                     (err, creditCard) => {
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
//                 lambda.act(
//                     {
//                         role: 'payment_methods',
//                         cmd: 'get_payment_methods' 
//                     },
//                     (err, page) => {
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

//                 lambda.act(
//                     {
//                         role: 'payment_methods',
//                         cmd: 'update_payment_method',
//                         method: creditCard1
//                     },
//                     (err, creditCard) => {
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
//                 lambda.act(
//                     {
//                         role: 'payment_methods',
//                         cmd: 'delete_payment_method_by_id',
//                         method_id: creditCard1.id,
//                         customer_id: creditCard1.customer_id
//                     },
//                     (err) => {
//                         assert.isNull(err);

//                         callback();
//                     }
//                 );
//             },
//         // Try to get delete credit method
//             (callback) => {
//                 lambda.act(
//                     {
//                         role: 'payment_methods',
//                         cmd: 'get_payment_method_by_id',
//                         method_id: creditCard1.id,
//                         customer_id: creditCard1.customer_id
//                     },
//                     (err, creditCard) => {
//                         assert.isNull(err);

//                         assert.isNull(creditCard || null);

//                         callback();
//                     }
//                 );
//             }
//         ], done);
//     });
// });