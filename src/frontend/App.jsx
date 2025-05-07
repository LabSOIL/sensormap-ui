// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import 'leaflet/dist/leaflet.css';

const RECHY = { lat: 46.261, lng: 7.559 };
const BINN = { lat: 46.391, lng: 8.058 };

const menuItems = [
  { key: 'cover', label: 'Home' },
  {
    key: 'catchment',
    label: 'Catchment View',
    subItems: [
      { key: 'rechy', label: 'Réchy', coords: RECHY },
      { key: 'binn', label: 'Binn', coords: BINN },
    ],
  },
  { key: 'data', label: 'Data View' },
  { key: 'experimental', label: 'Experimental View' },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('cover');
  const sectionsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) setActiveSection(entry.target.dataset.section);
      }),
      { threshold: 0.6 }
    );
    sectionsRef.current.forEach(sec => sec && observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (activeSection !== 'cover') setSidebarOpen(true);
  }, [activeSection]);

  const scrollToSection = key => {
    const idx = menuItems.findIndex(item => item.key === key);
    sectionsRef.current[idx]?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="App">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>        
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(o => !o)}
          aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? <ChevronLeftIcon fontSize="large" /> : <ChevronRightIcon fontSize="large" />}
        </button>
        <nav>
          <ul>
            {menuItems.map(item => (
              <li key={item.key} className={activeSection === item.key ? 'active' : ''}>
                <button onClick={() => scrollToSection(item.key)} className="menu-btn">
                  {item.label}
                </button>
                {item.subItems && activeSection === item.key && (
                  <ul className="sub-menu">
                    {item.subItems.map(sub => (
                      <li key={sub.key}>
                        <button onClick={() => scrollToSection(item.key)} className="submenu-btn">
                          {sub.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="sections">
        {/* COVER */}
        <section className="section cover" data-section="cover" ref={el => (sectionsRef.current[0] = el)}>
          <div className="cover-content">
            <h1>Soil organic carbon<br/>in Swiss Alpine environments</h1>
          </div>
          <button className="down-arrow" onClick={() => scrollToSection('catchment')} aria-label="Scroll down">
            ↓
          </button>
          <p className="attribution">EPFL SNSF</p>
        </section>

        {/* CATCHMENT */}
        <section className="section" data-section="catchment" ref={el => (sectionsRef.current[1] = el)}>
          <h2>Catchment View</h2>
          <div className="map-wrapper">
            <MapContainer center={[46.326, 7.808]} zoom={8} scrollWheelZoom className="leaflet-container">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[RECHY.lat, RECHY.lng]} />
              <Marker position={[BINN.lat, BINN.lng]} />
            </MapContainer>
          </div>
          <button className="down-arrow" onClick={() => scrollToSection('data')} aria-label="Scroll down">
            ↓
          </button>
        </section>

        {/* DATA */}
        <section className="section" data-section="data" ref={el => (sectionsRef.current[2] = el)}>
          <h2>Data View</h2>
          <div className="map-wrapper">
            <MapContainer center={[46.326, 7.808]} zoom={10} scrollWheelZoom className="leaflet-container">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </MapContainer>
          </div>
            <button className="down-arrow" onClick={() => scrollToSection('experimental')} aria-label="Scroll down">
                ↓
            </button>
        </section>

        {/* EXPERIMENTAL */}
        <section className="section" data-section="experimental" ref={el => (sectionsRef.current[3] = el)}>
          <h2>Experimental View</h2>
          <div className="map-wrapper">
            <MapContainer center={[46.326, 7.808]} zoom={12} scrollWheelZoom className="leaflet-container">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </MapContainer>
          </div>
        </section>
      </main>
    </div>
  );
}