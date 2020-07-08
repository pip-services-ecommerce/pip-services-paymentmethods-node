let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { Descriptor } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';
import { ConsoleLogger } from 'pip-services3-components-node';

import { PaymentMethodV1 } from '../../src/data/version1/PaymentMethodV1';
import { PaymentMethodTypeV1 } from '../../src/data/version1/PaymentMethodTypeV1';
import { CreditCardStateV1 } from '../../src/data/version1/CreditCardStateV1';
import { PaymentMethodsMemoryPersistence } from '../../src/persistence/PaymentMethodsMemoryPersistence';
import { PaymentMethodsController } from '../../src/logic/PaymentMethodsController';
import { PaymentMethodsLambdaFunction } from '../../src/container/PaymentMethodsLambdaFunction';
import { TestModel } from '../data/TestModel';

let PAYMENT_METHOD1: PaymentMethodV1 = TestModel.createPaymentMethod1();
let PAYMENT_METHOD2: PaymentMethodV1 = TestModel.createPaymentMethod2();

suite('PaymentMethodsLambdaFunction', () => {
    let lambda: PaymentMethodsLambdaFunction;

    suiteSetup((done) => {
        let config = ConfigParams.fromTuples(
            'logger.descriptor', 'pip-services:logger:console:default:1.0',
            'persistence.descriptor', 'pip-services-paymentmethods:persistence:memory:default:1.0',
            'controller.descriptor', 'pip-services-paymentmethods:controller:default:default:1.0'
        );

        lambda = new PaymentMethodsLambdaFunction();
        lambda.configure(config);
        lambda.open(null, done);
    });

    suiteTeardown((done) => {
        lambda.close(null, done);
    });

    test('CRUD Operations', (done) => {
        var paymentMethod1, paymentMethod2: PaymentMethodV1;

        async.series([
            // Create one credit method
            (callback) => {
                lambda.act(
                    {
                        role: 'payment_methods',
                        cmd: 'create_payment_method',
                        method: PAYMENT_METHOD1
                    },
                    (err, paymentMethod) => {
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
                lambda.act(
                    {
                        role: 'payment_methods',
                        cmd: 'create_payment_method',
                        method: PAYMENT_METHOD2
                    },
                    (err, paymentMethod) => {
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
                lambda.act(
                    {
                        role: 'payment_methods',
                        cmd: 'get_payment_methods'
                    },
                    (err, page) => {
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

                lambda.act(
                    {
                        role: 'payment_methods',
                        cmd: 'update_payment_method',
                        method: paymentMethod1
                    },
                    (err, paymentMethod) => {
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
                lambda.act(
                    {
                        role: 'payment_methods',
                        cmd: 'delete_payment_method_by_id',
                        method_id: paymentMethod1.id,
                        customer_id: paymentMethod1.customer_id
                    },
                    (err) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
            // Try to get delete credit method
            (callback) => {
                lambda.act(
                    {
                        role: 'payment_methods',
                        cmd: 'get_payment_method_by_id',
                        method_id: paymentMethod1.id,
                        customer_id: paymentMethod1.customer_id
                    },
                    (err, paymentMethod) => {
                        assert.isNull(err);

                        assert.isNull(paymentMethod || null);

                        callback();
                    }
                );
            }
        ], done);
    });
});