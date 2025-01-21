"use dom";
import { Map, Marker } from "pigeon-maps";
import React from "react";

export default function DomMapView() {
  return (
    <Map height={800} defaultCenter={[50.879, 4.6997]} defaultZoom={11}>
      <Marker width={50} anchor={[50.879, 4.6997]} />
    </Map>
  );
}
