import faker from 'faker/locale/en_GB';
import gql from 'graphql-tag';

import { CREATE_CHANNEL } from '../../../admin-ui/src/app/data/definitions/settings-definitions';
import { CREATE_SHIPPING_METHOD } from '../../../admin-ui/src/app/data/definitions/shipping-definitions';
import {
    Channel,
    CreateAddressInput,
    CreateCustomerInput,
    CurrencyCode,
    LanguageCode,
    ProductVariant,
} from '../e2e/graphql/generated-e2e-admin-types';
import { defaultShippingCalculator } from '../src/config/shipping-method/default-shipping-calculator';
import { defaultShippingEligibilityChecker } from '../src/config/shipping-method/default-shipping-eligibility-checker';
import { Customer } from '../src/entity/customer/customer.entity';

import { SimpleGraphQLClient } from './simple-graphql-client';

// tslint:disable:no-console
/**
 * A service for creating mock data via the GraphQL API.
 */
export class MockDataService {
    apiUrl: string;

    constructor(private client: SimpleGraphQLClient, private logging = true) {
        // make the generated results deterministic
        faker.seed(1);
    }

    async populateCustomers(count: number = 5): Promise<any> {
        for (let i = 0; i < count; i++) {
            const firstName = faker.name.firstName();
            const lastName = faker.name.lastName();

            const query1 = gql`
                mutation CreateCustomer($input: CreateCustomerInput!, $password: String) {
                    createCustomer(input: $input, password: $password) {
                        id
                        emailAddress
                    }
                }
            `;

            const variables1 = {
                input: {
                    firstName,
                    lastName,
                    emailAddress: faker.internet.email(firstName, lastName),
                    phoneNumber: faker.phone.phoneNumber(),
                } as CreateCustomerInput,
                password: 'test',
            };

            const customer: { id: string; emailAddress: string } | void = await this.client
                .query(query1, variables1)
                .then((data: any) => data.createCustomer, err => this.log(err));

            if (customer) {
                const query2 = gql`
                    mutation($customerId: ID!, $input: CreateAddressInput!) {
                        createCustomerAddress(customerId: $customerId, input: $input) {
                            id
                            streetLine1
                        }
                    }
                `;

                const variables2 = {
                    input: {
                        fullName: `${firstName} ${lastName}`,
                        streetLine1: faker.address.streetAddress(),
                        city: faker.address.city(),
                        province: faker.address.county(),
                        postalCode: faker.address.zipCode(),
                        countryCode: 'GB',
                    } as CreateAddressInput,
                    customerId: customer.id,
                };

                await this.client.query(query2, variables2).catch(err => this.log(err));
            }
        }
        this.log(`Created ${count} Customers`);
    }

    private log(...args: any[]) {
        if (this.logging) {
            console.log(...args);
        }
    }
}
