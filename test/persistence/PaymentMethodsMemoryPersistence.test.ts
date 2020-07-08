import { ConfigParams } from 'pip-services3-commons-node';

import { PaymentMethodsMemoryPersistence } from '../../src/persistence/PaymentMethodsMemoryPersistence';
import { PaymentMethodsPersistenceFixture } from './PaymentMethodsPersistenceFixture';

suite('PaymentMethodsMemoryPersistence', ()=> {
    let persistence: PaymentMethodsMemoryPersistence;
    let fixture: PaymentMethodsPersistenceFixture;
    
    setup((done) => {
        persistence = new PaymentMethodsMemoryPersistence();
        persistence.configure(new ConfigParams());
        
        fixture = new PaymentMethodsPersistenceFixture(persistence);
        
        persistence.open(null, done);
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