let async = require('async');
let assert = require('chai').assert;

import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { PaymentMethodV1 } from '../../src/data/version1/PaymentMethodV1';
import { PaymentMethodTypeV1 } from '../../src/data/version1/PaymentMethodTypeV1';

import { IPaymentMethodsPersistence } from '../../src/persistence/IPaymentMethodsPersistence';
import { TestModel } from '../data/TestModel';
import { Test } from 'mocha';



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

        if (paymentMethods) {
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
                        if (err) {
                            console.log('[testCreatePaymentMethods] Create one payment method');
                            console.log(err);
                        }

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
                        if (err) {
                            console.log('[testCreatePaymentMethods] Create another payment method');
                            console.log(err);
                        }

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
                        if (err) {
                            console.log('[testCreatePaymentMethods] Create yet another payment method');
                            console.log(err);
                        }

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
                    FilterParams.fromValue({
                        payout: false
                    }),
                    new PagingParams(),
                    (err, page) => {
                        if (err) {
                            console.log('[testCrudOperations] Get all payment methods');
                            console.log(err);
                        }

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
                        if (err) {
                            console.log('[testCrudOperations] Update the payment method');
                            console.log(err);
                        }

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
                        if (err) {
                            console.log('[testCrudOperations] Delete payment method');
                            console.log(err);
                        }

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
                        if (err) {
                            console.log('[testCrudOperations] Try to get deleted payment method');
                            console.log(err);
                        }

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
                        customer_id: '1',
                        payout: false
                    }),
                    new PagingParams(),
                    (err, page) => {
                        if (err) {
                            console.log('[testGetWithFilter] Get payment methods filtered by customer id');
                            console.log(err);
                        }

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
                        type: PaymentMethodTypeV1.Card,
                        payout: false
                    }),
                    new PagingParams(),
                    (err, page) => {
                        if (err) {
                            console.log('[testGetWithFilter] Get payment methods by type');
                            console.log(err);
                        }

                        assert.isNull(err);

                        assert.isObject(page);

                        let cardsCount = this.PAYMENT_METHODS.filter(x => x.type == PaymentMethodTypeV1.Card).length;
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
                        ids: [this.PAYMENT_METHODS[0].id, this.PAYMENT_METHODS[2].id],
                        payout: false
                    }),
                    new PagingParams(),
                    (err, page) => {
                        if (err) {
                            console.log('[testGetWithFilter] Get payment methods by ids');
                            console.log(err);
                        }
                        
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.lengthOf(page.data, 2);

                        callback();
                    }
                );
            },
        ], done);
    }

    testExternalBankAccount(done) {
        let bankAccount = TestModel.createPayoutBankAccount();

        async.series([
            // Create external bank account
            (callback) => {
                this._persistence.create(
                    null,
                    bankAccount,
                    (err, paymentMethod) => {
                        if (err) {
                            console.log('[testExternalBankAccount] Create bank account');
                            console.log(err);
                        }

                        assert.isNull(err);
                        assert.isObject(paymentMethod);
                        TestModel.assertEqualPaymentMethod(paymentMethod, bankAccount);

                        callback();
                    }
                );
            },
            // Get payment methods by type
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    FilterParams.fromValue({
                        type: PaymentMethodTypeV1.BankAccount,
                        payout: true
                    }),
                    new PagingParams(),
                    (err, page) => {
                        if (err) {
                            console.log('[testExternalBankAccount] Get payment methods by type');
                            console.log(err);
                        }

                        assert.isNull(err);

                        assert.isObject(page);

                        let cardsCount = this.PAYMENT_METHODS.filter(x => x.type == PaymentMethodTypeV1.Card).length;
                        assert.lengthOf(page.data, cardsCount);

                        callback();
                    }
                );
            },
        ], done);
    }

    testExternalCard(done) {
        async.series([
            
        ], done);
    }
}
