import React from 'react';
import { shape, string, bool, func, arrayOf } from 'prop-types';
import { Edit2 as EditIcon } from 'react-feather';
import { useAddressCard } from '@magento/peregrine/lib/talons/CheckoutPage/AddressBook/useAddressCard';

import { mergeClasses } from '../../../classify';
import Icon from '../../Icon';
import defaultClasses from './addressCard.css';

const AddressCard = props => {
    const {
        address,
        classes: propClasses,
        isSelected,
        onEdit,
        onSelection
    } = props;

    const talonProps = useAddressCard({ address, onEdit, onSelection });
    const {
        handleClick,
        handleEditAddress,
        handleKeyPress,
        hasUpdate
    } = talonProps;

    const {
        city,
        country_code,
        default_shipping,
        firstname,
        lastname,
        postcode,
        region: { region },
        street
    } = address;

    const streetRows = street.map((row, index) => {
        return <span key={index}>{row}</span>;
    });

    const classes = mergeClasses(defaultClasses, propClasses);

    const rootClasses = isSelected
        ? hasUpdate
            ? [classes.root_updated]
            : [classes.root_selected]
        : [classes.root];

    if (default_shipping) {
        rootClasses.push(classes.defaultCard);
    }

    const editButton = isSelected ? (
        <button className={classes.editButton} onClick={handleEditAddress}>
            <Icon
                classes={{ icon: classes.editIcon }}
                size={16}
                src={EditIcon}
            />
        </button>
    ) : null;

    const defaultBadge = default_shipping ? (
        <span className={classes.defaultBadge}>{'Default'}</span>
    ) : null;

    return (
        <div
            className={rootClasses.join(' ')}
            onClick={handleClick}
            onKeyPress={handleKeyPress}
            role="button"
            tabIndex="0"
        >
            {editButton}
            {defaultBadge}
            <span className={classes.name}>{`${firstname} ${lastname}`}</span>
            {streetRows}
            <span>{`${city}, ${region} ${postcode} ${country_code}`}</span>
        </div>
    );
};

export default AddressCard;

AddressCard.propTypes = {
    address: shape({
        city: string,
        country_code: string,
        default_shipping: bool,
        firstname: string,
        lastname: string,
        postcode: string,
        region: shape({
            region_code: string,
            region: string
        }),
        street: arrayOf(string)
    }).isRequired,
    classes: shape({
        root: string,
        root_selected: string,
        root_updated: string,
        editButton: string,
        editIcon: string,
        defaultBadge: string,
        name: string,
        address: string
    }),
    isSelected: bool.isRequired,
    onEdit: func.isRequired,
    onSelection: func.isRequired
};
