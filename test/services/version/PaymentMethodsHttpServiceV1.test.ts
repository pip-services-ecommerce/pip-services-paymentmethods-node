let _ = require('lodash');
let async = require('async');
let restify = require('restify');
let assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';

import { PaymentMethodV1 } from '../../../src/data/version1/PaymentMethodV1';
import { PaymentMethodTypeV1 } from '../../../src/data/version1/PaymentMethodTypeV1';
import { CreditCardStateV1 } from '../../../src/data/version1/CreditCardStateV1';
import { PaymentMethodsMemoryPersistence } from '../../../src/persistence/PaymentMethodsMemoryPersistence';
import { PaymentMethodsController } from '../../../src/logic/PaymentMethodsController';
import { PaymentMethodsHttpServiceV1 } from '../../../src/services/version1/PaymentMethodsHttpServiceV1';
import { TestModel } from '../../data/TestModel';

let httpConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

let PAYMENT_METHOD1: PaymentMethodV1 = TestModel.createPaymentMethod1();
let PAYMENT_METHOD2: PaymentMethodV1 = TestModel.createPaymentMethod2();

suite('PaymentMethodsHttpServiceV1', () => {
    let service: PaymentMethodsHttpServiceV1;
    let rest: any;

    suiteSetup((done) => {
        let persistence = new PaymentMethodsMemoryPersistence();
        let controller = new PaymentMethodsController();

        service = new PaymentMethodsHttpServiceV1();
        service.configure(httpConfig);

        let references: References = References.fromTuples(
            new Descriptor('pip-services-paymentmethods', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('pip-services-paymentmethods', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-paymentmethods', 'service', 'http', 'default', '1.0'), service
        );
        controller.setReferences(references);
        service.setReferences(references);

        service.open(null, done);
    });

    suiteTeardown((done) => {
        service.close(null, done);
    });

    setup(() => {
        let url = 'http://localhost:3000';
        rest = restify.createJsonClient({ url: url, version: '*' });
    });


    test('CRUD Operations', (done) => {
        let paymentMethod1, paymentMethod2: PaymentMethodV1;

        async.series([
            // Create one credit method
            (callback) => {
                rest.post('/v1/payment_methods/create_payment_method',
                    {
                        method: PAYMENT_METHOD1
                    },
                    (err, req, res, paymentMethod) => {
                        assert.isNull(err);

                        assert.isObject(paymentMethod);
                        TestModel.assertEqualPaymentMethod(paymentMethod, PAYMENT_METHOD1);

                        paymentMethod1 = paymentMethod;

                        callback();
                    }
                );
            },
            // Create another credit method
            (callback) => {
                rest.post('/v1/payment_methods/create_payment_method',
                    {
                        method: PAYMENT_METHOD2
                    },
                    (err, req, res, paymentMethod) => {
                        assert.isNull(err);

                        assert.isObject(paymentMethod);
                        TestModel.assertEqualPaymentMethod(paymentMethod, PAYMENT_METHOD2);

                        paymentMethod2 = paymentMethod;

                        callback();
                    }
                );
            },
            // Get all credit methods
            (callback) => {
                rest.post('/v1/payment_methods/get_payment_methods',
                    {},
                    (err, req, res, page) => {
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.lengthOf(page.data, 2);

                        callback();
                    }
                );
            },
            // Update the credit method
            (callback) => {
                paymentMethod1.name = 'Updated Card 1';

                rest.post('/v1/payment_methods/update_payment_method',
                    {
                        method: paymentMethod1
                    },
                    (err, req, res, paymentMethod) => {
                        assert.isNull(err);

                        assert.isObject(paymentMethod);
                        assert.equal(paymentMethod.name, 'Updated Card 1');
                        assert.equal(paymentMethod.id, PAYMENT_METHOD1.id);

                        paymentMethod1 = paymentMethod;

                        callback();
                    }
                );
            },
            // Delete credit method
            (callback) => {
                rest.post('/v1/payment_methods/delete_payment_method_by_id',
                    {
                        method_id: paymentMethod1.id,
                        customer_id: paymentMethod1.customer_id
                    },
                    (err, req, res, result) => {
                        assert.isNull(err);

                        //assert.isNull(result);

                        callback();
                    }
                );
            },
            // Try to get delete credit method
            (callback) => {
                rest.post('/v1/payment_methods/get_payment_method_by_id',
                    {
                        method_id: paymentMethod1.id,
                        customer_id: paymentMethod1.customer_id
                    },
                    (err, req, res, result) => {
                        assert.isNull(err);

                        //assert.isNull(result);

                        callback();
                    }
                );
            }
        ], done);
    });
});