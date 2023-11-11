import React from 'react';
import { useLoadScript } from '@react-google-maps/api';
import { Meteor } from 'meteor/meteor';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from '@reach/combobox';
import '@reach/combobox/styles.css';
import PropTypes from 'prop-types';

const PlacesAutocomplete = ({ setSelected }) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    const { lat, lng } = await getLatLng(results[0]);
    setSelected({ lat, lng });
  };

  return (
    <Combobox onSelect={handleSelect} style={{ width: '95%' }}>
      <ComboboxInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        className="combobox-input"
        placeholder="Search an address"
        style={{ width: 'inherit' }}
      />
      <ComboboxPopover>
        <ComboboxList>
          {status === 'OK' &&
            data.map(({ place_id, description }) => (
              <ComboboxOption key={place_id} value={description} />
            ))}
        </ComboboxList>
      </ComboboxPopover>
    </Combobox>
  );
};

PlacesAutocomplete.propTypes = {
  setSelected: PropTypes.func.isRequired,
};
let googleMapAPI;
Meteor.call('getGoogleAPI', (error, result) => {
  googleMapAPI = result;
});
const libraries = ['places'];
const PlaceForm = ({ setPlacesSearch }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: googleMapAPI,
    libraries,
  });

  return (
    !isLoaded ? '' : (
      <div className="places-container">
        <PlacesAutocomplete setSelected={setPlacesSearch} />
      </div>
    )
  );
};
PlaceForm.propTypes = {
  setPlacesSearch: PropTypes.func.isRequired,
};

export default PlaceForm;
