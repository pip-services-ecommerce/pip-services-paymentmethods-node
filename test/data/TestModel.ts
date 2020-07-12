let assert = require('chai').assert;

import { CreditCardStateV1 } from "../../src/data/version1/CreditCardStateV1";
import { PaymentMethodTypeV1 } from "../../src/data/version1/PaymentMethodTypeV1";
import { PaymentMethodV1 } from "../../src/data/version1/PaymentMethodV1";
import { CreditCardV1 } from "../../src/data/version1/CreditCardV1";
import { BankAccountV1 } from "../../src/data/version1/BankAccountV1";

export class TestModel {
    static createPaymentMethod1() {
        return {
            id: '1',
            customer_id: '1',
            name: 'BANK OF AMERICA',
            type: PaymentMethodTypeV1.BankAccount,
            account: {
                bank_code: 'BOFAUS3MXXX',
                first_name: 'Joe',
                last_name: 'Dow',
                number: '000123456789',
                branch_code: 'DOWNTOWN MIAMI',
                currency: 'USD',
                country: 'US',
                routing_number: "110000000"
            }
        };
    }

    static createPaymentMethod2() {
        return {
            id: '2',
            customer_id: '1',
            name: 'Visa *5556',
            type: PaymentMethodTypeV1.CreditCard,
            card: {
                brand: 'VISA',
                ccv: '921',
                expire_month: 4,
                expire_year: 2024,
                first_name: 'Steve',
                last_name: 'Jobs',
                number: '4000056655665556',
                state: CreditCardStateV1.Ok
            }
        };
    }

    static createPaymentMethod3() {
        return {
            id: '3',
            customer_id: '2',
            name: 'MasterCard *8210',
            type: PaymentMethodTypeV1.CreditCard,
            card: {
                brand: 'MasterCard',
                ccv: '124',
                expire_month: 5,
                expire_year: 2022,
                first_name: 'Steve',
                last_name: 'Jobs',
                number: '5200828282828210',
                state: CreditCardStateV1.Ok
            }
        };
    }

    static createPaymentMethod4() {
        return {
            id: '4',
            customer_id: '1',
            name: 'Visa *4242',
            type: PaymentMethodTypeV1.CreditCard,
            card: {
                brand: 'VISA',
                ccv: '921',
                expire_month: 4,
                expire_year: 2024,
                first_name: 'Steve',
                last_name: 'Jobs',
                number: '4242424242424242',
                state: CreditCardStateV1.Ok
            }
        };
    }

    static assertEqualPaymentMethod(actual: PaymentMethodV1, expected: PaymentMethodV1) {
        assert.isNotNull(actual);
        assert.isNotNull(expected);

        assert.equal(actual.type, expected.type);
        assert.equal(actual.customer_id, expected.customer_id);

        if (actual.type == PaymentMethodTypeV1.CreditCard) {
            this.assertEqualCard(actual.card, expected.card);
        }
        if (actual.type == PaymentMethodTypeV1.BankAccount) {
            this.assertEqualBankAccount(actual.account, expected.account);
        }
    }

    static assertEqualCard(actual: CreditCardV1, expected: CreditCardV1) {
        assert.isNotNull(actual);
        assert.isNotNull(expected);

        assert.equal(actual.brand, expected.brand);
        //assert.equal(actual.ccv, expected.ccv);
        assert.equal(actual.expire_month, expected.expire_month);
        assert.equal(actual.expire_year, expected.expire_year);
        assert.equal(actual.first_name, expected.first_name);
        assert.equal(actual.last_name, expected.last_name);
        //assert.equal(actual.number, expected.number);
        assert.equal(actual.state, expected.state);
    }

    static assertEqualBankAccount(actual: BankAccountV1, expected: BankAccountV1) {
        assert.isNotNull(actual);
        assert.isNotNull(expected);

        assert.equal(actual.bank_code, expected.bank_code);
        assert.equal(actual.first_name, expected.first_name);
        assert.equal(actual.last_name, expected.last_name);
        //assert.equal(actual.number, expected.number);
        assert.equal(actual.branch_code, expected.branch_code);
        assert.equal(actual.country, expected.country);
    }
}