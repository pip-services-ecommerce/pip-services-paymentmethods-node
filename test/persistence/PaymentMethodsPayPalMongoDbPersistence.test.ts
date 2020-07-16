import { ConfigParams } from 'pip-services3-commons-node';

import { PaymentMethodsPayPalMongoDbPersistence } from '../../src/persistence/PaymentMethodsPayPalMongoDbPersistence';
import { PaymentMethodsPersistenceFixture } from './PaymentMethodsPersistenceFixture';
import { TestModel } from '../data/TestModel';

suite('PaymentMethodsPayPalMongoDbPersistence', ()=> {
    var PAYPAL_ACCESS_ID = process.env["PAYPAL_ACCESS_ID"] || "";
    var PAYPAL_ACCESS_KEY = process.env["PAYPAL_ACCESS_KEY"] || "";

    if (!PAYPAL_ACCESS_ID || !PAYPAL_ACCESS_KEY)
        return;

    var MONGO_DB = process.env["MONGO_DB"] || "test";
    var MONGO_COLLECTION = process.env["MONGO_COLLECTION"] || "payment_methods";
    var MONGO_SERVICE_HOST = process.env["MONGO_SERVICE_HOST"] || "localhost";
    var MONGO_SERVICE_PORT = process.env["MONGO_SERVICE_PORT"] || "27017";
    var MONGO_SERVICE_URI = process.env["MONGO_SERVICE_URI"];

    var config = ConfigParams.fromTuples(
        "collection", MONGO_COLLECTION,
        "connection.database", MONGO_DB,
        "connection.host", MONGO_SERVICE_HOST,
        "connection.port", MONGO_SERVICE_PORT,
        "connection.uri", MONGO_SERVICE_URI,
        'credential.access_id', PAYPAL_ACCESS_ID,
        'credential.access_key', PAYPAL_ACCESS_KEY,
        'options.sandbox', true
    );

    let persistence: PaymentMethodsPayPalMongoDbPersistence;
    let fixture: PaymentMethodsPersistenceFixture;
    
    suiteSetup((done) => {
        persistence = new PaymentMethodsPayPalMongoDbPersistence();
        persistence.configure(config);
        
        fixture = new PaymentMethodsPersistenceFixture(persistence);
        
        persistence.open(null, done);
    });
    
    suiteTeardown((done) => {
        persistence.close(null, done);
    });

    setup((done) => {
        persistence.clear(null, done);
    });
        
    test('CRUD Operations', (done) => {
        fixture.testCrudOperations(done);
    });

    test('Get with Filters', (done) => {
        fixture.testGetWithFilter(done);
    });
});