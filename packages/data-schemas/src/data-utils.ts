export function stringToHex( str: string ): string {
  const buf = new TextEncoder().encode(str);

  return [...buf]
    .map (b => b.toString (16).padStart (2, "0"))
    .join ("");
}

export function numToHex( n: number, digits?: number ): string {
  const hex = n.toString(16).toUpperCase();

  if ( digits ) {
    return ("0".repeat( digits ) + hex).slice( -digits );
  }

  return ( hex.length % 2 == 0) ? hex : "0" + hex;
}

export function valueIn<type>( setof: type[], value: type ): boolean {
  return setof.indexOf( value ) >= 0;
}
