// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Tooltip,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import 'leaflet/dist/leaflet.css';

const initialMenuItemsConfig = [
  { key: 'cover', label: 'Home' },
  { key: 'catchment', label: 'Catchment View', subItems: [] },
  { key: 'data', label: 'Data View' },
  { key: 'experimental', label: 'Experimental View' },
];

// Helpers to convert GeoJSON [lng,lat] → Leaflet [lat,lng]
const flipCoordinates = coords => coords.map(([lng, lat]) => [lat, lng]);
const flipPolygonCoordinates = geom =>
  geom.coordinates.map(ring => flipCoordinates(ring));

// A little component inside your Catchment map to handle zooming
function CatchmentLayers({ areas, activeAreaId }) {
  const map = useMap();

  useEffect(() => {
    if (activeAreaId) {
      const area = areas.find(a => a.id === activeAreaId);
      if (area?.geom?.coordinates) {
        // flatten all rings into one array of points
        const allRings = flipPolygonCoordinates(area.geom);
        const flat = allRings.flat();
        const bounds = L.latLngBounds(flat);
        map.fitBounds(bounds.pad(0.2));
      }
    }
  }, [activeAreaId, areas, map]);

  return (
    <>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {areas.map(area =>
        area.geom?.coordinates ? (
          <Polygon
            key={area.id}
            positions={flipPolygonCoordinates(area.geom)}
            pathOptions={{ fillOpacity: 0.25, color: '#3388ff' }}
          >
            <Tooltip permanent>{area.name}</Tooltip>
          </Polygon>
        ) : null
      )}
    </>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('cover');
  const [activeAreaId, setActiveAreaId] = useState(null);
  const sectionsRef = useRef([]);
  const [menuItems, setMenuItems] = useState(initialMenuItemsConfig);
  const [areas, setAreas] = useState([]);

  // Fetch areas + build submenu
  useEffect(() => {
    fetch('/api/public/areas')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setAreas(data);

        const subItems = data.map(area => ({
          key: area.id,
          label: area.name
        }));

        setMenuItems(curr =>
          curr.map(item =>
            item.key === 'catchment'
              ? { ...item, subItems }
              : item
          )
        );
      })
      .catch(err => console.error('Error fetching areas:', err));
  }, []);

  // IntersectionObserver to highlight sidebar
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setActiveSection(e.target.dataset.section);
          }
        });
      },
      { threshold: 0.6 }
    );
    sectionsRef.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (activeSection !== 'cover') setSidebarOpen(true);
  }, [activeSection]);

  const scrollToSection = key => {
    const idx = menuItems.findIndex(i => i.key === key);
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
          {sidebarOpen
            ? <ChevronLeftIcon fontSize="large" />
            : <ChevronRightIcon fontSize="large" />
          }
        </button>
        <nav>
          <ul>
            {menuItems.map(item => (
              <li
                key={item.key}
                className={activeSection === item.key ? 'active' : ''}
              >
                <button
                  onClick={() => scrollToSection(item.key)}
                  className="menu-btn"
                >
                  {item.label}
                </button>
                {item.subItems && activeSection === item.key && (
                  <ul className="sub-menu">
                    {item.subItems.map(sub => (
                      <li key={sub.key}>
                        <button
                          onClick={() => {
                            setActiveAreaId(sub.key);
                            scrollToSection('catchment');
                          }}
                          className="submenu-btn"
                        >
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
        <section
          className="section cover"
          data-section="cover"
          ref={el => (sectionsRef.current[0] = el)}
        >
          <div className="cover-content">
            <h1>
              Soil organic carbon<br/>
              in Swiss Alpine environments
            </h1>
          </div>
          <button
            className="down-arrow"
            onClick={() => scrollToSection('catchment')}
            aria-label="Scroll down"
          >
            ↓
          </button>
          <p className="attribution">EPFL SNSF</p>
        </section>

        {/* CATCHMENT */}
        <section
          className="section"
          data-section="catchment"
          ref={el => (sectionsRef.current[1] = el)}
        >
          <h2>Catchment View</h2>
          <div className="map-wrapper">
            <MapContainer
              center={[46.326, 7.808]}
              zoom={8}
              scrollWheelZoom
              className="leaflet-container"
            >
              <CatchmentLayers
                areas={areas}
                activeAreaId={activeAreaId}
              />
            </MapContainer>
          </div>
          <button
            className="down-arrow"
            onClick={() => scrollToSection('data')}
            aria-label="Scroll down"
          >
            ↓
          </button>
        </section>

        {/* DATA */}
        <section
          className="section"
          data-section="data"
          ref={el => (sectionsRef.current[2] = el)}
        >
          <h2>Data View</h2>
          <div className="map-wrapper">
            <MapContainer
              center={[46.326, 7.808]}
              zoom={10}
              scrollWheelZoom
              className="leaflet-container"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {areas.map(area =>
                area.geom?.coordinates ? (
                  <Polygon
                    key={area.id}
                    positions={flipPolygonCoordinates(area.geom)}
                    pathOptions={{ fillOpacity: 0.25, color: '#3388ff' }}
                  >
                    <Tooltip permanent>{area.name}</Tooltip>
                  </Polygon>
                ) : null
              )}
            </MapContainer>
          </div>
          <button
            className="down-arrow"
            onClick={() => scrollToSection('experimental')}
            aria-label="Scroll down"
          >
            ↓
          </button>
        </section>

        {/* EXPERIMENTAL */}
        <section
          className="section"
          data-section="experimental"
          ref={el => (sectionsRef.current[3] = el)}
        >
          <h2>Experimental View</h2>
          <div className="map-wrapper">
            <MapContainer
              center={[46.326, 7.808]}
              zoom={12}
              scrollWheelZoom
              className="leaflet-container"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {areas.map(area =>
                area.geom?.coordinates ? (
                  <Polygon
                    key={area.id}
                    positions={flipPolygonCoordinates(area.geom)}
                    pathOptions={{ fillOpacity: 0.25, color: '#3388ff' }}
                  >
                    <Tooltip permanent>{area.name}</Tooltip>
                  </Polygon>
                ) : null
              )}
            </MapContainer>
          </div>
        </section>
      </main>
    </div>
  );
}
