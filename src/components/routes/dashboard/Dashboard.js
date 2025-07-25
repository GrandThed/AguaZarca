import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuthState } from "react-firebase-hooks/auth";
import { IconContext } from "react-icons";
import {
  FaPlus,
  FaSearch,
  FaFilter,
  FaTimes,
  FaHome,
  FaPause,
  FaPlay,
  FaEye,
  FaCalendar,
  FaDollarSign,
  FaMapMarkerAlt,
  FaChartLine,
  FaBlog,
  FaCog,
  FaStar,
  FaImages,
} from "react-icons/fa";
import "./dashboard.css";
import { PageTitle } from "../../pageTitle/PageTitle";
import { HorizontalCard } from "../../card/Card";
import { firestore, auth } from "../../../firebase";
import { ToastContainer } from "react-toastify";
import * as ROUTES from "../../../routes";
import { PROPERTY_TYPES } from "../../../constants/propertyTypes";
const Dashboard = () => {
  const [user] = useAuthState(auth);

  // State
  const [propieties, setPropieties] = useState([]);
  const [pausedPropieties, setPausedPropieties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedView, setSelectedView] = useState("all"); // 'all', 'active', 'paused'
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // 'recent', 'price', 'featured'
  const [lastActive, setLastActive] = useState(null);
  const [hasMoreActive, setHasMoreActive] = useState(false);
  const [lastPaused, setLastPaused] = useState(null);
  const [hasMorePaused, setHasMorePaused] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    featured: 0,
    views: 0,
  });
  const [filter, setFilter] = useState({
    venta: true,
    anual: true,
    temporal: true,
    types: PROPERTY_TYPES.reduce((acc, type) => ({ ...acc, [type]: true }), {}),
    featured: true,
    rentalFeatured: true,
    slider: true,
    noFeatured: true,
  });

  // Load properties function
  const loadProperties = useCallback(
    async (reset = false) => {
      if (!user) return;

      try {
        if (reset) {
          setLoading(true);
          setPropieties([]);
          setPausedPropieties([]);
          setLastActive(null);
          setLastPaused(null);
        }

        // Load active properties - increased to 50 for better initial display
        const activeQuery = firestore.collection("estates").where("agent.email", "==", user.email).limit(50);

        const activeSnapshot = await activeQuery.get();
        const activeProps = activeSnapshot.docs;

        console.log("Active properties loaded:", activeProps.length);
        console.log(
          "Active properties:",
          activeProps.map((p) => p.data().title)
        );

        if (reset) {
          setPropieties(activeProps);
        } else {
          setPropieties((prev) => [...prev, ...activeProps]);
        }

        setLastActive(activeProps[activeProps.length - 1]);
        setHasMoreActive(activeProps.length === 50);

        // Load paused properties - increased to 50 for better initial display
        const pausedQuery = firestore.collection("pausedEstates").where("agent.email", "==", user.email).limit(50);

        const pausedSnapshot = await pausedQuery.get();
        const pausedProps = pausedSnapshot.docs;

        console.log("Paused properties loaded:", pausedProps.length);

        if (reset) {
          setPausedPropieties(pausedProps);
        } else {
          setPausedPropieties((prev) => [...prev, ...pausedProps]);
        }

        setLastPaused(pausedProps[pausedProps.length - 1]);
        setHasMorePaused(pausedProps.length === 50);

        // Calculate stats
        if (reset) {
          const totalActive = activeProps.length;
          const totalPaused = pausedProps.length;
          const featuredCount = activeProps.filter((p) => {
            const data = p.data();
            return data.featured || data.rentalFeatured || data.slider;
          }).length;

          setStats({
            total: totalActive + totalPaused,
            active: totalActive,
            paused: totalPaused,
            featured: featuredCount,
            views: activeProps.reduce((acc, p) => acc + (p.data().views || 0), 0),
          });
        }
      } catch (error) {
        console.error("Error loading properties:", error);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Load initial properties
  useEffect(() => {
    if (user) {
      console.log("Loading properties for user:", user.email);
      loadProperties(true);
    } else {
      console.log("No user logged in");
      setLoading(false);
    }
  }, [user, loadProperties]);

  // Load more functions
  const loadMoreActive = async () => {
    if (!lastActive || !hasMoreActive) return;

    try {
      const query = firestore
        .collection("estates")
        .where("agent.email", "==", user.email)
        .startAfter(lastActive)
        .limit(25);

      const snapshot = await query.get();
      const newProps = snapshot.docs;

      setPropieties((prev) => [...prev, ...newProps]);
      setLastActive(newProps[newProps.length - 1]);
      setHasMoreActive(newProps.length === 25);
    } catch (error) {
      console.error("Error loading more active properties:", error);
    }
  };

  const loadMorePaused = async () => {
    if (!lastPaused || !hasMorePaused) return;

    try {
      const query = firestore
        .collection("pausedEstates")
        .where("agent.email", "==", user.email)
        .startAfter(lastPaused)
        .limit(25);

      const snapshot = await query.get();
      const newProps = snapshot.docs;

      setPausedPropieties((prev) => [...prev, ...newProps]);
      setLastPaused(newProps[newProps.length - 1]);
      setHasMorePaused(newProps.length === 25);
    } catch (error) {
      console.error("Error loading more paused properties:", error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search logic here
    console.log("Searching for:", searchTerm);
  };

  // Filter properties based on current filters
  const getFilteredProperties = () => {
    let properties = [];

    if (selectedView === "active" || selectedView === "all") {
      properties = [...properties, ...propieties];
    }
    if (selectedView === "paused" || selectedView === "all") {
      // Keep paused properties as Firestore documents but add a flag
      const pausedWithFlag = pausedPropieties.map((p) => {
        // Create a new object that maintains the .data() method but adds isPaused flag
        const newP = Object.create(p);
        newP.isPaused = true;
        return newP;
      });
      properties = [...properties, ...pausedWithFlag];
    }

    // Apply filters
    return properties
      .filter((e) => {
        const data = e.data();
        if (!data) return false;

        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          return (
            data.title?.toLowerCase().includes(searchLower) ||
            data.location?.city?.toLowerCase().includes(searchLower) ||
            data.location?.neighborhood?.toLowerCase().includes(searchLower)
          );
        }

        return true; // No search term, show all
      })
      .filter((e) => {
        const data = e.data();
        // Type filter
        if (selectedType && data.type !== selectedType) return false;
        return true;
      })
      .filter((e) => {
        const data = e.data();
        // Status filter
        if (selectedStatus && data.comercialStatus !== selectedStatus) return false;
        return true;
      })
      .filter((e) => {
        const data = e.data();
        // Only apply original filters if no new filters are active
        if (!searchTerm && !selectedType && !selectedStatus) {
          const status = data.comercialStatus;
          if (filter.venta && status === "Venta") return true;
          if (filter.temporal && status === "Alquiler temporal") return true;
          if (filter.anual && status === "Alquiler") return true;
          return false;
        }
        return true;
      })
      .filter((e) => {
        const data = e.data();
        // Only apply type filter from original filters if no new type filter
        if (!selectedType && !filter.types[data.type]) return false;
        return true;
      })
      .filter((e) => {
        const data = e.data();
        // Only apply featured filter from original filters if no search/type/status filters
        if (!searchTerm && !selectedType && !selectedStatus) {
          if (filter.featured && data.featured) return true;
          if (filter.rentalFeatured && data.rentalFeatured) return true;
          if (filter.slider && data.slider) return true;
          if (filter.noFeatured && !data.slider && !data.rentalFeatured && !data.featured) return true;
          return false;
        }
        return true;
      });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
    setSelectedStatus("");
    setSelectedView("all");
  };

  const filteredProperties = getFilteredProperties();
  console.log("Total properties:", propieties.length + pausedPropieties.length);
  console.log("Filtered properties:", filteredProperties.length);
  console.log("Filter state:", filter);
  console.log("Selected view:", selectedView);

  return (
    <div className="dashboard-page">
      <Helmet>
        <title>Dashboard - Gestión de Propiedades | AguaZarca</title>
        <meta name="description" content="Panel de control para gestionar tus propiedades inmobiliarias" />
      </Helmet>

      {/* Hero Section with Stats */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-text">
            <h1 className="dashboard-hero-title">Panel de Control</h1>
            <p className="dashboard-hero-subtitle">Gestiona todas tus propiedades desde un solo lugar</p>
          </div>
          <div className="dashboard-stats">
            <div className="dashboard-stat">
              <div className="dashboard-stat-icon">
                <FaHome />
              </div>
              <div className="dashboard-stat-content">
                <span className="dashboard-stat-number">{stats.total}</span>
                <span className="dashboard-stat-label">Total</span>
              </div>
            </div>
            <div className="dashboard-stat active">
              <div className="dashboard-stat-icon">
                <FaPlay />
              </div>
              <div className="dashboard-stat-content">
                <span className="dashboard-stat-number">{stats.active}</span>
                <span className="dashboard-stat-label">Activas</span>
              </div>
            </div>
            <div className="dashboard-stat paused">
              <div className="dashboard-stat-icon">
                <FaPause />
              </div>
              <div className="dashboard-stat-content">
                <span className="dashboard-stat-number">{stats.paused}</span>
                <span className="dashboard-stat-label">Pausadas</span>
              </div>
            </div>
            <div className="dashboard-stat featured">
              <div className="dashboard-stat-icon">
                <FaStar />
              </div>
              <div className="dashboard-stat-content">
                <span className="dashboard-stat-number">{stats.featured}</span>
                <span className="dashboard-stat-label">Destacadas</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Header with Search and Actions */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="dashboard-search-form">
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar por título, ciudad o barrio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button type="button" onClick={() => setSearchTerm("")} className="clear-search">
                  <FaTimes />
                </button>
              )}
            </div>
            <button type="submit" className="search-button">
              Buscar
            </button>
          </form>

          {/* Action Buttons */}
          <div className="dashboard-actions">
            <Link to={ROUTES.PUBLICAR} className="action-btn primary">
              <FaPlus /> Nueva Propiedad
            </Link>
            <Link to={ROUTES.BLOG_CREATE} className="action-btn secondary">
              <FaBlog /> Crear Blog
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="dashboard-filters">
          <div className="filter-section">
            <FaFilter className="filter-icon" />
            <span className="filter-label">Filtros:</span>

            {/* View Toggle */}
            <div className="view-toggle">
              <button
                onClick={() => setSelectedView("all")}
                className={`view-btn ${selectedView === "all" ? "active" : ""}`}
              >
                Todas
              </button>
              <button
                onClick={() => setSelectedView("active")}
                className={`view-btn ${selectedView === "active" ? "active" : ""}`}
              >
                Activas
              </button>
              <button
                onClick={() => setSelectedView("paused")}
                className={`view-btn ${selectedView === "paused" ? "active" : ""}`}
              >
                Pausadas
              </button>
            </div>

            {/* Type Filter */}
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="filter-select">
              <option value="">Todos los tipos</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="Venta">Venta</option>
              <option value="Alquiler">Alquiler Anual</option>
              <option value="Alquiler temporal">Alquiler Temporal</option>
            </select>

            {/* Sort */}
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
              <option value="recent">Más recientes</option>
              <option value="price">Por precio</option>
              <option value="featured">Destacadas</option>
            </select>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedType || selectedStatus || selectedView !== "all") && (
            <div className="active-filters">
              <span>Filtros activos:</span>
              {searchTerm && <span className="active-filter">Búsqueda: "{searchTerm}"</span>}
              {selectedType && <span className="active-filter">Tipo: {selectedType}</span>}
              {selectedStatus && <span className="active-filter">Estado: {selectedStatus}</span>}
              {selectedView !== "all" && (
                <span className="active-filter">Vista: {selectedView === "active" ? "Activas" : "Pausadas"}</span>
              )}
              <button onClick={clearFilters} className="clear-filters">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <ToastContainer />

      {/* Loading State */}
      {loading && (
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Cargando propiedades...</p>
        </div>
      )}

      {/* Properties List */}
      {!loading && (
        <div className="dashboard-content">
          {filteredProperties.length === 0 ? (
            <div className="no-properties">
              <div className="no-properties-icon">
                <FaHome />
              </div>
              <h3>No se encontraron propiedades</h3>
              {searchTerm || selectedType || selectedStatus ? (
                <p>Intenta cambiar los filtros de búsqueda.</p>
              ) : (
                <p>Aún no has publicado ninguna propiedad.</p>
              )}
              <Link to={ROUTES.PUBLICAR} className="btn-primary">
                <FaPlus /> Publicar primera propiedad
              </Link>
            </div>
          ) : (
            <div className="properties-list">
              <div className="properties-header">
                <div className="properties-header-left">
                  <h2>Propiedades ({filteredProperties.length})</h2>
                  <p className="properties-subtitle">
                    {stats.active} activas • {stats.paused} pausadas • {stats.featured} destacadas
                  </p>
                </div>
                <div className="properties-header-right">
                  <div className="view-options">
                    <button
                      className={`view-option-btn ${selectedView === "all" ? "active" : ""}`}
                      onClick={() => setSelectedView("all")}
                      title="Ver todas las propiedades"
                    >
                      Todas
                    </button>
                    <button
                      className={`view-option-btn ${selectedView === "active" ? "active" : ""}`}
                      onClick={() => setSelectedView("active")}
                      title="Solo propiedades activas"
                    >
                      Activas
                    </button>
                    <button
                      className={`view-option-btn ${selectedView === "paused" ? "active" : ""}`}
                      onClick={() => setSelectedView("paused")}
                      title="Solo propiedades pausadas"
                    >
                      Pausadas
                    </button>
                  </div>
                </div>
              </div>

              <div className="properties-grid">
                {filteredProperties.map((p) => (
                  <div key={p.id} className={`property-item ${p.isPaused ? "paused" : "active"}`}>
                    <HorizontalCard propiedad={p} paused={!!p.isPaused} />
                  </div>
                ))}

                {/* Load More Buttons */}
                {(hasMoreActive && selectedView !== "paused") || (hasMorePaused && selectedView !== "active") ? (
                  <div className="load-more-section">
                    {hasMoreActive && selectedView !== "paused" && (
                      <button className="load-more-btn" onClick={loadMoreActive}>
                        <FaPlay /> Cargar más activas (25+)
                      </button>
                    )}
                    {hasMorePaused && selectedView !== "active" && (
                      <button className="load-more-btn" onClick={loadMorePaused}>
                        <FaPause /> Cargar más pausadas (25+)
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
