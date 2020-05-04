import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';

import { useAppContext } from '../../../context/app';
import { useCartContext } from '../../../context/cart';

export const useAddressBook = props => {
    const {
        mutations: { setCustomerAddressOnCartMutation },
        queries: { getCustomerAddressesQuery },
        toggleActiveContent
    } = props;

    const [, { toggleDrawer }] = useAppContext();
    const [{ cartId }] = useCartContext();

    const [activeAddress, setActiveAddress] = useState();
    const [selectedAddress, setSelectedAddress] = useState();

    const [
        setCustomerAddressOnCart,
        { loading: setCustomerAddressOnCartLoading }
    ] = useMutation(setCustomerAddressOnCartMutation);

    const {
        data: customerAddressesData,
        error: customerAddressesError,
        loading: customerAddressesLoading
    } = useQuery(getCustomerAddressesQuery);

    useEffect(() => {
        console.error(customerAddressesError);
    }, [customerAddressesError]);

    const isLoading =
        customerAddressesLoading || setCustomerAddressOnCartLoading;
    const customerAddresses =
        (customerAddressesData && customerAddressesData.customer.addresses) ||
        [];

    const handleEditAddress = useCallback(
        address => {
            setActiveAddress(address);
            toggleDrawer('shippingInformation.edit');
        },
        [toggleDrawer]
    );

    const handleAddAddress = useCallback(() => {
        handleEditAddress();
    }, [handleEditAddress]);

    const handleSelectAddress = useCallback(addressId => {
        setSelectedAddress(addressId);
    }, []);

    const handleApplyAddress = useCallback(async () => {
        try {
            await setCustomerAddressOnCart({
                variables: {
                    cartId,
                    addressId: selectedAddress
                }
            });
        } catch (error) {
            console.error(error);
        }

        toggleActiveContent();
    }, [
        cartId,
        selectedAddress,
        setCustomerAddressOnCart,
        toggleActiveContent
    ]);

    return {
        activeAddress,
        customerAddresses,
        isLoading,
        handleAddAddress,
        handleApplyAddress,
        handleSelectAddress,
        handleEditAddress,
        selectedAddress,
        setSelectedAddress
    };
};
