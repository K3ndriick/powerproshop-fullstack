/// <reference types="@types/google.maps" />
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useState, useEffect } from "react";


export function useAddressAutocomplete(inputRef: React.RefObject<HTMLInputElement>) {
  const [address, setAddress] = useState({ address_line1: "", city: "", state: "", postal_code: "", country: "" });

  // listener
  useEffect(() => {
    if (!inputRef.current) return;

    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
      v: 'weekly'
    });

    let ac : google.maps.places.Autocomplete;

    async function init() {
      const { Autocomplete } = await importLibrary('places');

      // re-checked after await - component may have unmounted while importLibrary was loading
      if (!inputRef.current) return;

      ac = new Autocomplete(inputRef.current!, {
        types: ['address'],
        componentRestrictions: { country: 'au' },
        fields: ['address_components']
      });
      
      ac.addListener('place_changed', () => {
        const location = ac.getPlace();

        let streetNumber = '', route = '', city = '', state = '', postalCode = '', country = '';

        for (const component of location.address_components ?? []) {
          const type = component.types[0]
          if (type === 'street_number') streetNumber = component.short_name
          if (type === 'route') route = component.long_name
          if (type === 'locality' || type === 'administrative_area_level_2') city = component.long_name
          if (type === 'administrative_area_level_1') state = component.short_name
          if (type === 'postal_code') postalCode = component.long_name
          if (type === 'country') country = component.short_name
        }

        setAddress({
          address_line1: `${streetNumber} ${route}`.trim(),
          city,
          state,
          postal_code: postalCode,
          country
        })
      });
    }
    init();
    return () => {
      // ac may be unassigned if init() hadn't finished before unmount
      if(ac) window.google.maps.event.clearInstanceListeners(ac)
    }
  }, [])

  return address;
}
