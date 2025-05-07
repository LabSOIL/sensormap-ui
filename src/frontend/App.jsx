// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const RECHY = { lat: 46.261, lng: 7.559 };
const BINN = { lat: 46.391, lng: 8.058 };

export default function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sectionsRef = useRef([]);

    // scroll listener → auto-open sidebar after cover
    useEffect(() => {
        const onScroll = () => {
            setSidebarOpen(window.scrollY > window.innerHeight * 0.5);
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // initialize all 5 maps once
    useEffect(() => {
        const configs = [
            {
                id: 'map-catchment',
                center: [46.326, 7.808],
                zoom: 8,
                markers: [RECHY, BINN],
            },
            {
                id: 'map-data',
                center: [46.326, 7.808],
                zoom: 10,
            },
            {
                id: 'map-experimental',
                center: [46.326, 7.808],
                zoom: 12,
            },
            {
                id: 'map-experimental-actions',
                center: [46.326, 7.808],
                zoom: 12,
            },
            {
                id: 'map-model',
                center: [46.326, 7.808],
                zoom: 8,
            },
        ];

        configs.forEach(({ id, center, zoom, markers }) => {
            const container = document.getElementById(id);
            // only init once
            if (!container || container._leaflet_id) return;

            const map = L.map(id).setView(center, zoom);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
            }).addTo(map);

            if (markers) {
                markers.forEach(({ lat, lng }) => {
                    L.marker([lat, lng]).addTo(map);
                });
            }
        });
    }, []);

    const scrollTo = (i) =>
        sectionsRef.current[i]?.scrollIntoView({ behavior: 'smooth' });

    return (
        <div className="App">
            {/* ☰ Toggle button */}
            <button
                className="menu-toggle"
                onClick={() => setSidebarOpen((v) => !v)}
                aria-label="Toggle menu"
            >
                ☰
            </button>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'visible' : ''}`}>
                <h2>Sites</h2>
                <ul>
                    <li onClick={() => scrollTo(1)}>Réchy</li>
                    <li onClick={() => scrollTo(1)}>Binn</li>
                </ul>
            </aside>

            <div className="sections">
                {/* 1) COVER */}
                <section
                    className="section cover"
                    ref={(el) => (sectionsRef.current[0] = el)}
                >
                    <h1 className="title">
                        Soil organic carbon in Swiss Alpine environments
                    </h1>
                    <p className="attribution">EPFL  SNSF</p>
                    <button
                        className="down-arrow"
                        onClick={() => scrollTo(1)}
                        aria-label="Scroll down"
                    >
                        ↓
                    </button>
                </section>

                {/* 2) CATCHMENT VIEW */}
                <section
                    className="section"
                    ref={(el) => (sectionsRef.current[1] = el)}
                >
                    <h2 className="section-title">Catchment View</h2>
                    <div id="map-catchment" className="leaflet-container"></div>
                </section>

                {/* 3) DATA VIEW */}
                <section
                    className="section"
                    ref={(el) => (sectionsRef.current[2] = el)}
                >
                    <h2 className="section-title">Data View</h2>
                    <div id="map-data" className="leaflet-container"></div>
                </section>

                {/* 4) EXPERIMENTAL DATA (MAP) */}
                <section
                    className="section"
                    ref={(el) => (sectionsRef.current[3] = el)}
                >
                    <h2 className="section-title">Experimental Data (Map)</h2>
                    <div id="map-experimental" className="leaflet-container"></div>
                </section>

                {/* 4b) EXPERIMENTAL DATA (ACTIONS) */}
                <section
                    className="section"
                    ref={(el) => (sectionsRef.current[4] = el)}
                >
                    <h2 className="section-title">Experimental Data (Actions)</h2>
                    <div className="actions-panel">
                        <label>
                            Attribute:
                            <select>
                                <option value="oc">Organic carbon</option>
                                <option value="ph">pH</option>
                                <option value="moisture">Moisture</option>
                            </select>
                        </label>
                        <button>Download CSV</button>
                        <button>Toggle Layer</button>
                    </div>
                    <div
                        id="map-experimental-actions"
                        className="leaflet-container"
                        style={{ height: '70%' }}
                    ></div>
                </section>

                {/* 5) MODEL DATA */}
                <section
                    className="section"
                    ref={(el) => (sectionsRef.current[5] = el)}
                >
                    <h2 className="section-title">Model Data</h2>
                    <div id="map-model" className="leaflet-container"></div>
                </section>
            </div>
        </div>
    );
}
