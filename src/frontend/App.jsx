// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {
  MapContainer,
  Popup,
  Polygon,
  CircleMarker,
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
  { key: 'catchment', label: 'Catchment', subItems: [] },
  { key: 'data', label: 'Data', subItems: [] },
  { key: 'experimental', label: 'Experimental View' },
];

const dataOptions = [
  { key: 'SOC', color: '#e41a1c' },
  { key: 'pH', color: '#377eb8' },
  { key: 'T', color: '#4daf4a' },
  { key: 'Soil moisture', color: '#984ea3' },
];

const flipCoordinates = coords => coords.map(([lng, lat]) => [lat, lng]);
const flipPolygonCoordinates = geom =>
  geom.coordinates.map(ring => flipCoordinates(ring));

function Legend({ selectedData }) {
  const map = useMap();
  const rangeMap = {
    'pH': [0, 14],
    'SOC Stocks': [0, 100],
    'T': [0, 100],
    'Soil moisture': [0, 100],
  };

  useEffect(() => {
    // remove old legend
    document.querySelectorAll('.info.legend').forEach(el => el.remove());
    if (!selectedData) return;

    const { color } = dataOptions.find(o => o.key === selectedData);
    const [min, max] = rangeMap[selectedData] || [0, 100];
    const mid = Math.round((min + max) / 2);

    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = `
        <h4>${selectedData}</h4>
        <div style="display:flex; align-items:center;">
          <div class="legend-scale" style="
            background: linear-gradient(to top, #ffffff, ${color});
          "></div>
          <div class="legend-labels">
            <span>${max}</span>
            <span>${mid}</span>
            <span>${min}</span>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);
    return () => map.removeControl(legend);
  }, [map, selectedData]);

  return null;
}

function CatchmentLayers({
  areas,
  activeAreaId,
  dataOption,
  onAreaClick,
  recenterSignal,
  onRecenterHandled
}) {
  const map = useMap();

  useEffect(() => {
    if (!areas.length || !recenterSignal) return;
    let coords = [];

    if (activeAreaId) {
      const a = areas.find(x => x.id === activeAreaId);
      if (a?.geom?.coordinates) coords = flipPolygonCoordinates(a.geom).flat();
    } else {
      areas.forEach(a => {
        if (a.geom?.coordinates) coords.push(...flipPolygonCoordinates(a.geom).flat());
      });
    }

    if (coords.length) map.fitBounds(L.latLngBounds(coords).pad(0.2));
    onRecenterHandled();
  }, [areas, activeAreaId, map, recenterSignal, onRecenterHandled]);

  useEffect(() => {
    const onZoom = () => {
      if (map.getZoom() < 10) return;
      const c = map.getCenter();
      const near = areas.find(a => {
        if (!a.geom?.coordinates) return false;
        return L.latLngBounds(flipPolygonCoordinates(a.geom).flat())
          .contains([c.lat, c.lng]);
      });
      if (near && near.id !== activeAreaId) onAreaClick(near.id);
    };
    map.on('zoomend', onZoom);
    return () => map.off('zoomend', onZoom);
  }, [map, areas, activeAreaId, onAreaClick]);

  const defaultColor = '#3388ff';
  const markerColor = dataOption
    ? dataOptions.find(o => o.key === dataOption).color
    : defaultColor;

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
                color: area.id === activeAreaId ? '#2b8cbe' : defaultColor,
              }}
              eventHandlers={{ click: () => onAreaClick(area.id, true) }}
            >
              {area.id !== activeAreaId && (
                <Tooltip
                  permanent
                  interactive
                  eventHandlers={{ click: () => onAreaClick(area.id, true) }}
                >
                  {area.name}
                </Tooltip>
              )}
            </Polygon>

            {area.id === activeAreaId && area.plots?.map(plot => {
              const coord = plot.geom?.['4326'];
              if (!coord) return null;
              const { x: lon, y: lat } = coord;
              return (
                <CircleMarker
                  key={plot.id}
                  center={[lat, lon]}
                  pathOptions={{
                    color: markerColor,
                    fillColor: markerColor,
                    fillOpacity: 1
                  }}
                  radius={8}
                >
                  <Popup>{plot.name}</Popup>
                </CircleMarker>
              );
            })}
          </React.Fragment>
        ) : null
      )}
      <Legend selectedData={dataOption} />
    </>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('cover');
  const [activeAreaId, setActiveAreaId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [menuItems, setMenuItems] = useState(initialMenuItemsConfig);
  const [areas, setAreas] = useState([]);
  const [shouldRecenter, setShouldRecenter] = useState(false);
  const sectionsRef = useRef([]);

  const scrollTo = key => {
    const idx = menuItems.findIndex(i => i.key === key);
    sectionsRef.current[idx]?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetch('/api/public/areas')
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(data => {
        setAreas(data);
        const subs = data.map(a => ({ key: a.id, label: a.name }));
        setMenuItems(m => m.map(i => i.key === 'catchment' ? { ...i, subItems: subs } : i));
        setShouldRecenter(true);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setMenuItems(m => m.map(i =>
      i.key === 'data'
        ? {
          ...i,
          subItems: activeAreaId
            ? dataOptions.map(o => ({ key: o.key, label: o.key }))
            : []
        }
        : i
    ));
  }, [activeAreaId]);

  useEffect(() => {
    const io = new IntersectionObserver(es => {
      es.forEach(e => e.isIntersecting && setActiveSection(e.target.dataset.section));
    }, { threshold: 0.6 });
    sectionsRef.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (activeSection !== 'cover') setSidebarOpen(true);
  }, [activeSection]);

  const selectArea = (id, recenter = false) => {
    if (recenter) setShouldRecenter(true);
    setActiveAreaId(id);
    setSelectedData(dataOptions[0].key);
  };
  const clearArea = () => {
    setActiveAreaId(null);
    setSelectedData(null);
    setShouldRecenter(true);
    scrollTo('catchment');
  };
  const selectData = key => setSelectedData(key);

  const activeArea = areas.find(a => a.id === activeAreaId);

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
            : <ChevronRightIcon fontSize="large" />}
        </button>
        <nav>
          <ul>
            {menuItems.map(item => (
              <li key={item.key} className={activeSection === item.key ? 'active' : ''}>
                <button
                  className="menu-btn"
                  onClick={() => item.key !== 'data' && scrollTo(item.key)}
                >{item.label}</button>

                {item.key === 'catchment' && (
                  <ul className="sub-menu">
                    {activeAreaId
                      ? <li className="active-area">
                        <span className="selected-area">
                          {activeArea?.name}
                          <button
                            className="remove-selected"
                            onClick={clearArea}
                          >✕</button>
                        </span>
                      </li>
                      : item.subItems.map(s => (
                        <li key={s.key}>
                          <button
                            className="submenu-btn"
                            onClick={() => selectArea(s.key, true)}
                          >{s.label}</button>
                        </li>
                      ))
                    }
                  </ul>
                )}

                {item.key === 'data' && activeAreaId && (
                  <ul className="sub-menu">
                    {item.subItems.map(s => (
                      <li key={s.key}>
                        <button
                          className={`submenu-btn ${selectedData === s.key ? 'active-data' : ''}`}
                          onClick={() => selectData(s.key)}
                        >{s.label}</button>
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
          ref={el => sectionsRef.current[0] = el}
        >
          <div className="cover-content">
            <h1>
              Soil organic carbon<br />
              in Swiss alpine environments
            </h1>
          </div>
          <button
            className="down-arrow"
            onClick={() => scrollTo('catchment')}
            aria-label="Scroll down"
          >↓</button>
          <div className="attribution">
            <a href="https://www.epfl.ch" target="_blank" rel="noopener noreferrer">
              <img src="/epfl.png" alt="EPFL Logo" style={{ height: '2rem', marginRight: '1rem' }} />
            </a>
            <a href="https://www.snf.ch" target="_blank" rel="noopener noreferrer">
              <img src="/snsf.svg" alt="SNSF Logo" style={{ height: '2rem' }} />
            </a>
          </div>
        </section>

        {/* CATCHMENT */}
        <section
          className="section"
          data-section="catchment"
          ref={el => sectionsRef.current[1] = el}
        >
          <h2>{activeArea ? activeArea.name : 'Catchment'}</h2>
          <div className="map-wrapper">
            <MapContainer scrollWheelZoom className="leaflet-container">
              <CatchmentLayers
                areas={areas}
                activeAreaId={activeAreaId}
                dataOption={selectedData}
                onAreaClick={selectArea}
                recenterSignal={shouldRecenter}
                onRecenterHandled={() => setShouldRecenter(false)}
              />
            </MapContainer>
          </div>
        </section>

        {/* EXPERIMENTAL */}
        <section
          className="section"
          data-section="experimental"
          ref={el => sectionsRef.current[2] = el}
        >
          <h2>Experimental View</h2>
          <div className="map-wrapper">
            <MapContainer center={[46.326, 7.808]} zoom={12} scrollWheelZoom className="leaflet-container">
              <BaseLayers />
              {areas.map(a => a.geom?.coordinates && (
                <Polygon
                  key={a.id}
                  positions={flipPolygonCoordinates(a.geom)}
                  pathOptions={{ fillOpacity: 0.25, color: '#3388ff' }}
                />
              ))}
            </MapContainer>
          </div>
        </section>
      </main>
    </div>
  );
}
