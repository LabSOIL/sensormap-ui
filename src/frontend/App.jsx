// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {
  MapContainer,
  Popup,
  Marker,
  Polygon,
  Tooltip,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import 'leaflet/dist/leaflet.css';
import { BaseLayers } from './maps/Layers';

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
// Component to handle fitting map to all areas or the active one
function CatchmentLayers({ areas, activeAreaId, onAreaClick }) {
    const map = useMap();

    useEffect(() => {
        if (!areas.length) return;

        let coords = [];

        if (activeAreaId) {
            const area = areas.find(a => a.id === activeAreaId);
            if (area?.geom?.coordinates) {
                const rings = flipPolygonCoordinates(area.geom);
                coords = rings.flat();
            }
        } else {
            areas.forEach(a => {
                if (a.geom?.coordinates) {
                    const rings = flipPolygonCoordinates(a.geom);
                    coords.push(...rings.flat());
                }
            });
        }

        if (coords.length) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds.pad(0.2));
        }
    }, [activeAreaId, areas, map]);

    useEffect(() => {
        const handleZoomEnd = () => {
            const zoomLevel = map.getZoom();
            if (zoomLevel >= 12) { // Adjusted zoom level threshold from 14 to 12
                const center = map.getCenter();
                const lat = center.lat;
                const lng = center.lng;

                const nearbyArea = areas.find(area => {
                    if (!area.geom?.coordinates) return false;
                    const bounds = L.latLngBounds(flipPolygonCoordinates(area.geom).flat());
                    return bounds.contains([lat, lng]);
                });

                if (nearbyArea && nearbyArea.id !== activeAreaId) {
                    onAreaClick(nearbyArea.id);
                }
            }
        };

        map.on('zoomend', handleZoomEnd);
        return () => {
            map.off('zoomend', handleZoomEnd);
        };
    }, [map, areas, activeAreaId, onAreaClick]);

    return (
        <>
            <BaseLayers />

            {areas.map(area =>
                area.geom?.coordinates ? (
                    <React.Fragment key={area.id}>
                        <Polygon
                            positions={flipPolygonCoordinates(area.geom)}
                            pathOptions={{
                                fillOpacity: area.id === activeAreaId ? 0.5 : 0.25,
                                color: area.id === activeAreaId ? '#2b8cbe' : '#3388ff',
                            }}
                            eventHandlers={{
                                click: () => onAreaClick(area.id),
                            }}
                        >
                            <Tooltip
                                permanent
                                interactive
                                eventHandlers={{ click: () => onAreaClick(area.id) }}
                            >
                                {area.name}
                            </Tooltip>
                        </Polygon>

                        {area.id === activeAreaId &&
                            area.plots?.map(plot => {
                                const coord = plot.geom?.['4326'];
                                if (!coord) return null;
                                const { x: lon, y: lat } = coord;
                                return (
                                    <Marker key={plot.id} position={[lat, lon]}>
                                        <Popup>
                                            {plot.name}
                                        </Popup>
                                    </Marker>
                                );
                            })}
                    </React.Fragment>
                ) : null
            )}
        </>
    );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('cover');
  const [activeAreaId, setActiveAreaId] = useState(null);
  const [menuItems, setMenuItems] = useState(initialMenuItemsConfig);
  const [areas, setAreas] = useState([]);
  const sectionsRef = useRef([]);

  const scrollToSection = key => {
    const idx = menuItems.findIndex(i => i.key === key);
    sectionsRef.current[idx]?.scrollIntoView({ behavior: 'smooth' });
  };

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

  // IntersectionObserver to highlight sidebar sections
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

  // Open sidebar when not on cover
  useEffect(() => {
    if (activeSection !== 'cover') setSidebarOpen(true);
  }, [activeSection]);

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
              <li
                key={item.key}
                className={activeSection === item.key ? 'active' : ''}
              >
                <button
                  onClick={() => {
                    if (item.key === 'catchment' && activeSection === 'catchment') {
                      setActiveAreaId(null);
                    }
                    scrollToSection(item.key);
                  }}
                  className="menu-btn"
                >
                  {item.label}
                </button>
                {item.subItems && activeSection === item.key && (
                  <ul className="sub-menu">
                    {item.subItems.map(sub => (
                      <li
                        key={sub.key}
                        className={sub.key === activeAreaId ? 'active-area' : ''}
                      >
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
              scrollWheelZoom
              className="leaflet-container"
            >
              <CatchmentLayers
                areas={areas}
                activeAreaId={activeAreaId}
                onAreaClick={id => {
                  setActiveAreaId(id);
                  scrollToSection('catchment');
                }}
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
              <BaseLayers />
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
              <BaseLayers />
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
