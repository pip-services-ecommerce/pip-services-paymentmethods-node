import { ConfigParams } from 'pip-services3-commons-node';

import { PaymentMethodsStripePersistence } from '../../src/persistence/PaymentMethodsStripePersistence';
import { PaymentMethodsPersistenceFixture } from './PaymentMethodsPersistenceFixture';

suite('PaymentMethodsStripePersistence', () => {
    let terminate: boolean = false;

    let persistence: PaymentMethodsStripePersistence;
    let fixture: PaymentMethodsPersistenceFixture;

    setup((done) => {
        var STRIPE_ACCESS_KEY = process.env["STRIPE_ACCESS_KEY"];

        if (!STRIPE_ACCESS_KEY) {
            terminate = true;
            done(null);
            return;
        }

        var config = ConfigParams.fromTuples(
            'connection.host', 'api.stripe.com',
            'connection.timeout', 8000,
            'credential.access_key', STRIPE_ACCESS_KEY
        );

        persistence = new PaymentMethodsStripePersistence();
        persistence.configure(config);

        fixture = new PaymentMethodsPersistenceFixture(persistence);

        persistence.open(null, (err) => {
            persistence.clear(null, (err) => {
                done(err);
            });
        });
    });

    teardown((done) => {
        if (terminate) {
            done(null);
            return;
        }

        persistence.close(null, done);
    });

    test('External bank account for payouts', (done) => {
        if (terminate) {
            done(null);
            return;
        }

        done();
        //fixture.testExternalBankAccount(done);
    });
    
    test('External card for payouts', (done) => {
        if (terminate) {
            done(null);
            return;
        }

        done();
        // fixture.testExternalCard(done);
    });

    test('CRUD Operations', (done) => {
        if (terminate) {
            done(null);
            return;
        }

        fixture.testCrudOperations(done);
    });

    test('Get with Filters', (done) => {
        if (terminate) {
            done(null);
            return;
        }

        fixture.testGetWithFilter(done);
    });
});