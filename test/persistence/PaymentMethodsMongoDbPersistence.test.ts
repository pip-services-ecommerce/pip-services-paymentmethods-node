let process = require('process');

import { ConfigParams } from 'pip-services3-commons-node';

import { PaymentMethodsMongoDbPersistence } from '../../src/persistence/PaymentMethodsMongoDbPersistence';
import { PaymentMethodsPersistenceFixture } from './PaymentMethodsPersistenceFixture';

suite('PaymentMethodsMongoDbPersistence', ()=> {
    let persistence: PaymentMethodsMongoDbPersistence;
    let fixture: PaymentMethodsPersistenceFixture;

    setup((done) => {
        var MONGO_DB = process.env["MONGO_DB"] || "test";
        var MONGO_COLLECTION = process.env["MONGO_COLLECTION"] || "payment_methods";
        var MONGO_SERVICE_HOST = process.env["MONGO_SERVICE_HOST"] || "localhost";
        var MONGO_SERVICE_PORT = process.env["MONGO_SERVICE_PORT"] || "27017";
        var MONGO_SERVICE_URI = process.env["MONGO_SERVICE_URI"];

        var dbConfig = ConfigParams.fromTuples(
            "collection", MONGO_COLLECTION,
            "connection.database", MONGO_DB,
            "connection.host", MONGO_SERVICE_HOST,
            "connection.port", MONGO_SERVICE_PORT,
            "connection.uri", MONGO_SERVICE_URI
        );

        persistence = new PaymentMethodsMongoDbPersistence();
        persistence.configure(dbConfig);

        fixture = new PaymentMethodsPersistenceFixture(persistence);

        persistence.open(null, (err: any) => {
            persistence.clear(null, (err) => {
                done(err);
            });
        });
    });
    
    teardown((done) => {
        persistence.close(null, done);
    });

    test('CRUD Operations', (done) => {
        fixture.testCrudOperations(done);
    });

    test('Get with Filters', (done) => {
        fixture.testGetWithFilter(done);
    });

});