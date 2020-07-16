let async = require('async');
let assert = require('chai').assert;

import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { PaymentMethodV1 } from '../../src/data/version1/PaymentMethodV1';
import { PaymentMethodTypeV1 } from '../../src/data/version1/PaymentMethodTypeV1';

import { IPaymentMethodsPersistence } from '../../src/persistence/IPaymentMethodsPersistence';
import { TestModel } from '../data/TestModel';



export class PaymentMethodsPersistenceFixture {
    private _persistence: IPaymentMethodsPersistence;

    private PAYMENT_METHOD1: PaymentMethodV1;
    private PAYMENT_METHOD2: PaymentMethodV1;
    private PAYMENT_METHOD3: PaymentMethodV1;

    private PAYMENT_METHODS: PaymentMethodV1[] = [
        TestModel.createPaymentMethod1(),
        TestModel.createPaymentMethod2(),
        TestModel.createPaymentMethod3()
    ];

    constructor(persistence, paymentMethods?: PaymentMethodV1[]) {
        assert.isNotNull(persistence);
        this._persistence = persistence;

        paymentMethods = paymentMethods ?? this.PAYMENT_METHODS;
        
        if (paymentMethods)
        {
            if (paymentMethods.length > 0) this.PAYMENT_METHOD1 = paymentMethods[0];
            if (paymentMethods.length > 1) this.PAYMENT_METHOD2 = paymentMethods[1];
            if (paymentMethods.length > 2) this.PAYMENT_METHOD3 = paymentMethods[2];

            this.PAYMENT_METHODS = paymentMethods;
        }
    }

    private testCreatePaymentMethods(done) {
        async.series([
            // Create one payment method
            (callback) => {
                this._persistence.create(
                    null,
                    this.PAYMENT_METHOD1,
                    (err, paymentMethod) => {
                        assert.isNull(err);
                        assert.isObject(paymentMethod);
                        TestModel.assertEqualPaymentMethod(paymentMethod, this.PAYMENT_METHOD1);

                        this.PAYMENT_METHOD1.id = paymentMethod.id;

                        callback();
                    }
                );
            },
            // Create another payment method
            (callback) => {
                this._persistence.create(
                    null,
                    this.PAYMENT_METHOD2,
                    (err, paymentMethod) => {
                        assert.isNull(err);
                        assert.isObject(paymentMethod);
                        TestModel.assertEqualPaymentMethod(paymentMethod, this.PAYMENT_METHOD2);

                        this.PAYMENT_METHOD2.id = paymentMethod.id;

                        callback();
                    }
                );
            },
            // Create yet another payment method
            (callback) => {
                this._persistence.create(
                    null,
                    this.PAYMENT_METHOD3,
                    (err, paymentMethod) => {
                        assert.isNull(err);
                        assert.isObject(paymentMethod);
                        TestModel.assertEqualPaymentMethod(paymentMethod, this.PAYMENT_METHOD3);

                        this.PAYMENT_METHOD3.id = paymentMethod.id;

                        callback();
                    }
                );
            }
        ], done);
    }

    testCrudOperations(done) {
        let paymentMethod1: PaymentMethodV1;

        async.series([
            // Create items
            (callback) => {
                this.testCreatePaymentMethods(callback);
            },
            // Get all payment methods
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    new FilterParams(),
                    new PagingParams(),
                    (err, page) => {
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.lengthOf(page.data, 3);

                        paymentMethod1 = page.data[0];

                        callback();
                    }
                );
            },
            // Update the payment method
            (callback) => {
                paymentMethod1.name = 'Updated Card 1';

                this._persistence.update(
                    null,
                    paymentMethod1,
                    (err, paymentMethod) => {
                        assert.isNull(err);

                        assert.isObject(paymentMethod);
                        assert.equal(paymentMethod.name, 'Updated Card 1');

                        paymentMethod1 = paymentMethod;

                        callback();
                    }
                );
            },
            // Delete payment method
            (callback) => {
                this._persistence.delete(
                    null,
                    paymentMethod1.id,
                    paymentMethod1.customer_id,
                    (err) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
            // Try to get deleted payment method
            (callback) => {
                this._persistence.getById(
                    null,
                    paymentMethod1.id,
                    paymentMethod1.customer_id,
                    (err, paymentMethod) => {
                        assert.isNull(err);

                        assert.isNull(paymentMethod || null);

                        callback();
                    }
                );
            }
        ], done);
    }

    testGetWithFilter(done) {
        async.series([
            // Create payment methods
            (callback) => {
                this.testCreatePaymentMethods(callback);
            },
            // Get payment methods filtered by customer id
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    FilterParams.fromValue({
                        customer_id: '1'
                    }),
                    new PagingParams(),
                    (err, page) => {
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.lengthOf(page.data, 2);

                        callback();
                    }
                );
            },
            // Get payment methods by type
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    FilterParams.fromValue({
                        type: PaymentMethodTypeV1.CreditCard
                    }),
                    new PagingParams(),
                    (err, page) => {
                        assert.isNull(err);

                        assert.isObject(page);

                        let cardsCount = this.PAYMENT_METHODS.filter(x => x.type == PaymentMethodTypeV1.CreditCard).length;
                        assert.lengthOf(page.data, cardsCount);

                        callback();
                    }
                );
            },
            // Get payment methods by ids
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    FilterParams.fromValue({
                        ids: [this.PAYMENT_METHODS[0].id, this.PAYMENT_METHODS[2].id]
                    }),
                    new PagingParams(),
                    (err, page) => {
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.lengthOf(page.data, 2);

                        callback();
                    }
                );
            },
        ], done);
    }

}
