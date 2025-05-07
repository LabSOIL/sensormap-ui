import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.css';
import 'leaflet.awesome-markers/dist/leaflet.awesome-markers.js';

const Legend = ({ layers, toggleLayer }) => {
    const map = useMap(); // Get the map instance

    if (!layers) {
        return null;
    }

    useEffect(() => {
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = `
                <div style="
                    background: rgba(255, 255, 255, 0.9);
                    padding: 10px;
                    border: 2px solid black;
                    border-radius: 5px;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
                    color: black;
                ">
                    <h4 style="margin-top: 0;">Legend</h4>
                    <div id="sensor-profiles-layer" style="display: flex; align-items: center; margin-bottom: 5px; cursor: pointer; ${!layers.sensor_profiles.visible ? 'opacity: 0.5;' : ''
                }">
                        <i class="fa fa-temperature-low" style="color: yellow; background: blue; width: 18px; height: 18px; display: inline-block; margin-right: 5px; text-align: center; line-height: 18px;"></i>
                        <span>Sensor</span>
                    </div>
                    <div id="plot-layer" style="display: flex; align-items: center; margin-bottom: 5px; cursor: pointer; ${!layers.plots.visible ? 'opacity: 0.5;' : ''
                }">
                        <i class="fa fa-trowel" style="color: black; background: green; width: 18px; height: 18px; display: inline-block; margin-right: 5px; text-align: center; line-height: 18px;"></i>
                        <span>Plot</span>
                    </div>
                    <div id="soil-profile-layer" style="display: flex; align-items: center; cursor: pointer; ${!layers.soil_profiles.visible ? 'opacity: 0.5;' : ''
                }">
                        <i class="fa fa-clipboard" style="color: yellow; background: red; width: 18px; height: 18px; display: inline-block; margin-right: 5px; text-align: center; line-height: 18px;"></i>
                        <span>Soil Profile</span>
                    </div>
                    <div id="transect-layer" style="display: flex; align-items: center; cursor: pointer; ${!layers.transects.visible ? 'opacity: 0.5;' : ''
                }">
                        <i class="fa fa-road" style="color: white; background: black; width: 18px; height: 18px; display: inline-block; margin-right: 5px; text-align: center; line-height: 18px;"></i>
                        <span>Transect</span>
                    </div>
                </div>
            `;
            return div;
        };

        legend.addTo(map);

        // Add event listeners to handle clicking
        const sensorProfileLayer = document.getElementById('sensor-profiles-layer');
        const plotLayer = document.getElementById('plot-layer');
        const soilProfileLayer = document.getElementById('soil-profile-layer');
        const transectLayer = document.getElementById('transect-layer');

        sensorProfileLayer.addEventListener('click', () => toggleLayer('sensor_profiles'));
        plotLayer.addEventListener('click', () => toggleLayer('plots'));
        soilProfileLayer.addEventListener('click', () => toggleLayer('soil_profiles'));
        transectLayer.addEventListener('click', () => toggleLayer('transects'));

        return () => {
            legend.remove();
        };
    }, [map, layers, toggleLayer]);

    return null;
};

export default Legend;