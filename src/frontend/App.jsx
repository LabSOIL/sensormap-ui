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
const dataAccessors = {
  SOC: plot => plot.socStock,
  pH: plot => plot.pH,
  T: plot => plot.temperature,
  'Soil moisture': plot => plot.soilMoisture,
};

const flipCoordinates = coords => coords.map(([lng, lat]) => [lat, lng]);
const flipPolygonCoordinates = geom =>
  geom.coordinates.map(ring => flipCoordinates(ring));

function Legend({ selectedData, areas, activeAreaId }) {
  const map = useMap();


  const getColorOnScale = (value, min, max) => {
    const ratio = (value - min) / (max - min);
    const hue = (1 - ratio) * 120;
    return `hsl(${hue}, 100%, 50%)`;
  };

  useEffect(() => {
    // clear old legend
    document.querySelectorAll('.info.legend').forEach(el => el.remove());
    if (!selectedData) return;

    // pull out the right accessor
    const accessor = dataAccessors[selectedData];
    if (!accessor) return;

    // gather plot values
    let plots = [];
    if (activeAreaId) {
      const area = areas.find(a => a.id === activeAreaId);
      plots = area?.plots || [];
    } else {
      plots = areas.flatMap(a => a.plots);
    }
    const values = plots.map(accessor).filter(v => typeof v === 'number');
    if (!values.length) return;

    // integer min, mid, max
    const minVal = Math.floor(Math.min(...values));
    const maxVal = Math.ceil(Math.max(...values));
    const midVal = Math.round((minVal + maxVal) / 2);

    // colour endpoints
    const staticColor = dataOptions.find(o => o.key === selectedData)?.color;
    let gradientStyle;
    if (selectedData === 'SOC') {
      const start = getColorOnScale(minVal, minVal, maxVal);
      const end = getColorOnScale(maxVal, minVal, maxVal);
      gradientStyle = `background: linear-gradient(to top, ${start}, ${end});`;
    } else {
      gradientStyle = `background: linear-gradient(to top, #ffffff, ${staticColor});`;
    }

    // build and add the Leaflet control
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = `
        <h4>${selectedData}</h4>
        <div style="display:flex; align-items:center;">
          <div class="legend-scale"
               style="${gradientStyle} width:1rem; height:6rem; margin-right:0.5rem;"></div>
          <div class="legend-labels"
               style="display:flex; flex-direction:column; justify-content:space-between; height:6rem;">
            <span>${maxVal}</span>
            <span>${midVal}</span>
            <span>${minVal}</span>
          </div>
        </div>
      `;
      return div;
    };
    legend.addTo(map);

    return () => map.removeControl(legend);
  }, [map, selectedData, areas, activeAreaId]);

  return null;
}
function CatchmentLayers({
  areas,
  activeAreaId,
  dataOption,
  stockRange,
  onAreaClick,
  recenterSignal,
  onRecenterHandled
}) {
  const map = useMap();
  const defaultColor = '#3388ff';
  const markerStatic = dataOption
    ? dataOptions.find(o => o.key === dataOption).color
    : defaultColor;

  const [minStock, maxStock] = stockRange;
  const getColor = value => {
    const ratio = (value - minStock) / (maxStock - minStock);
    const hue = (1 - ratio) * 120;
    return `hsl(${hue}, 100%, 50%)`;
  };

  useEffect(() => {
    if (!areas.length || !recenterSignal) return;

    // build your coords array as before
    let coords = [];
    if (activeAreaId) {
      const a = areas.find(x => x.id === activeAreaId);
      if (a?.geom?.coordinates) coords = flipPolygonCoordinates(a.geom).flat();
    } else {
      areas.forEach(a => {
        if (a.geom?.coordinates) coords.push(...flipPolygonCoordinates(a.geom).flat());
      });
    }

    const doFly = () => {
      if (coords.length) {
        map.flyToBounds(
          L.latLngBounds(coords).pad(0.2),
          { duration: 1 }
        );
      }
      onRecenterHandled();
    };

    // if the map is already loaded, fly immediately; otherwise wait for load
    if (map._loaded) {
      doFly();
    } else {
      map.once('load', doFly);
    }
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

            {area.id === activeAreaId &&
              area.plots.map(plot => {
                const coord = plot.geom?.['4326'];
                if (!coord) return null;
                const { x: lon, y: lat } = coord;
                const socValue = plot.socStock;
                const color = dataOption === 'SOC' ? getColor(socValue) : markerStatic;

                return (
                  <CircleMarker
                    key={plot.id}
                    center={[lat, lon]}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 1
                    }}
                    radius={Math.sqrt(socValue)}
                  >
                    <Popup>
                      <strong>{plot.name}</strong><br />
                      SOC stock: {socValue.toFixed(1)} Mg ha⁻¹
                    </Popup>
                  </CircleMarker>
                );
              })}
          </React.Fragment>
        ) : null
      )}
      <Legend
        selectedData={dataOption}
        areas={areas}
        activeAreaId={activeAreaId}
      />
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
  const [stockRange, setStockRange] = useState([0, 0]);

  useEffect(() => {
    fetch('/api/public/areas')
      .then(r => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(data => {
        const enriched = data.map(area => ({
          ...area,
          plots: area.plots.map(plot => ({
            ...plot,
            socStock: plot.aggregated_samples['1'].soc_stock_megag_per_hectare
          }))
        }));

        // compute global min & max
        const allStocks = enriched.flatMap(a => a.plots.map(p => p.socStock));
        const minStock = Math.min(...allStocks);
        const maxStock = Math.max(...allStocks);

        setAreas(enriched);
        setStockRange([minStock, maxStock]);

        const subs = enriched.map(a => ({ key: a.id, label: a.name }));
        setMenuItems(m =>
          m.map(i =>
            i.key === 'catchment' ? { ...i, subItems: subs } : i
          )
        );
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
            <MapContainer
              center={[46.326, 7.808]}
              zoom={10}
              scrollWheelZoom
              className="leaflet-container"
            >
              <CatchmentLayers
                areas={areas}
                activeAreaId={activeAreaId}
                dataOption={selectedData}
                stockRange={stockRange}
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
