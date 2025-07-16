import React, { useEffect, useState } from "react";
import "./dashboard.css";
import { PageTitle } from "../../pageTitle/PageTitle";
// import  from '../../../routes'
import { HorizontalCard } from "../../card/Card";
import { firestore, auth } from "../../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import * as ROUTES from "../../../routes";
import { PROPERTY_TYPES } from "../../../constants/propertyTypes";
// import { useAuthState } from "react-firebase-hooks/auth";
const Dashboard = () => {
  const [propieties, setPropieties] = useState([]);
  const [pausedPropieties, setPausedPropieties] = useState([]);
  const [lastActive, setLastActive] = useState(null);
  const [hasMoreActive, setHasMoreActive] = useState(false);
  const [lastPaused, setLastPaused] = useState(null);
  const [hasMorePaused, setHasMorePaused] = useState(false);
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

  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      setPropieties([]);
      setPausedPropieties([]);
      const activeQuery = firestore
        .collection("estates")
        .where("agent.email", "==", user.email)
        .limit(10);
      activeQuery.get().then((e) => {
        e.docs.forEach((doc) => {
          setPropieties((sl) => [...sl, doc]);
        });
        setLastActive(e.docs[e.docs.length - 1]);
        setHasMoreActive(e.docs.length === 10);
      });

      const pausedQuery = firestore
        .collection("pausedEstates")
        .where("agent.email", "==", user.email)
        .limit(10);
      pausedQuery.get().then((e) => {
        e.docs.forEach((doc) => {
          setPausedPropieties((sl) => [...sl, doc]);
        });
        setLastPaused(e.docs[e.docs.length - 1]);
        setHasMorePaused(e.docs.length === 10);
      });
    }
  }, [user]);

  const loadMoreActive = () => {
    if (!lastActive) return;
    firestore
      .collection("estates")
      .where("agent.email", "==", user.email)
      .startAfter(lastActive)
      .limit(10)
      .get()
      .then((e) => {
        e.docs.forEach((doc) => {
          setPropieties((sl) => [...sl, doc]);
        });
        setLastActive(e.docs[e.docs.length - 1]);
        setHasMoreActive(e.docs.length === 10);
      });
  };

  const loadMorePaused = () => {
    if (!lastPaused) return;
    firestore
      .collection("pausedEstates")
      .where("agent.email", "==", user.email)
      .startAfter(lastPaused)
      .limit(10)
      .get()
      .then((e) => {
        e.docs.forEach((doc) => {
          setPausedPropieties((sl) => [...sl, doc]);
        });
        setLastPaused(e.docs[e.docs.length - 1]);
        setHasMorePaused(e.docs.length === 10);
      });
  };

  return (
    <div>
      <PageTitle title="Dashboard"></PageTitle>
      <div className="db-blog-create-link">
        <Link to={ROUTES.BLOG_CREATE}>Crear Blog</Link>
      </div>
      <ToastContainer />
      <div className="db-div">
        <aside className="db-aside">
          <h1 className="db-aside-h1">Filtros</h1>
          <div className="db-aside-filter">
            <h2 className="db-aside-h2">Status comercial</h2>
            <label htmlFor="Venta" className="db-aside-label">
              <input
                type="checkbox"
                name="venta"
                checked={filter.venta}
                onChange={(e) => setFilter((prev) => ({ ...prev, venta: e.target.checked }))}
              />
              Venta
            </label>
            <label htmlFor="alquiler-anual" className="db-aside-label">
              <input
                type="checkbox"
                name="alquiler-anual"
                checked={filter.anual}
                onChange={(e) => setFilter((prev) => ({ ...prev, anual: e.target.checked }))}
              />
              Alquiler Anual
            </label>
            <label htmlFor="alquiler-temporal" className="db-aside-label">
              <input
                type="checkbox"
                name="alquiler-temporal"
                checked={filter.temporal}
                onChange={(e) => setFilter((prev) => ({ ...prev, temporal: e.target.checked }))}
              />
              Alquiler Temporal
            </label>
          </div>
          <div className="db-aside-filter">
            <h2 className="db-aside-h2">Tipo de propiedad</h2>
            {PROPERTY_TYPES.map((type) => (
              <label key={type} className="db-aside-label">
                <input
                  type="checkbox"
                  name={type}
                  checked={filter.types[type]}
                  onChange={(e) =>
                    setFilter((prev) => ({
                      ...prev,
                      types: { ...prev.types, [type]: e.target.checked },
                    }))
                  }
                />
                {type}
              </label>
            ))}
          </div>
          <div className="db-aside-filter">
            <h2 className="db-aside-h2">
              <input
                type="checkbox"
                name="all-destacada"
                checked={filter.featured || filter.rentalFeatured || filter.slider}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    featured: !prev.featured,
                    rentalFeatured: !prev.rentalFeatured,
                    slider: !prev.slider,
                  }))
                }
              />
              Destacada
            </h2>
            <label htmlFor="destacada" className="db-aside-label">
              <input
                type="checkbox"
                name="destacada"
                checked={filter.featured}
                onChange={(e) => setFilter((prev) => ({ ...prev, featured: e.target.checked }))}
              />
              Destacada
            </label>
            <label htmlFor="slider" className="db-aside-label">
              <input
                type="checkbox"
                name="Slider"
                checked={filter.slider}
                onChange={(e) => setFilter((prev) => ({ ...prev, slider: e.target.checked }))}
              />
              Slider
            </label>
            <label htmlFor="alquiler" className="db-aside-label">
              <input
                type="checkbox"
                name="alquiler"
                checked={filter.rentalFeatured}
                onChange={(e) => setFilter((prev) => ({ ...prev, rentalFeatured: e.target.checked }))}
              />
              Alquiler
            </label>
            <label htmlFor="lote" className="db-aside-label">
              <input
                type="checkbox"
                name="no-destacada"
                checked={filter.noFeatured}
                onChange={(e) => setFilter((prev) => ({ ...prev, noFeatured: e.target.checked }))}
              />
              No destacada
            </label>
          </div>
        </aside>
        <div className="db-body">
          {pausedPropieties[0] && pausedPropieties.map((p) => <HorizontalCard propiedad={p} key={p.id} paused />)}
          {hasMorePaused && (
            <button className="db-load-more" onClick={loadMorePaused}>
              Cargar más
            </button>
          )}
          {propieties[0] &&
            propieties
              .filter((e) => {
                const status = e.data().comercialStatus;
                if (filter.venta && status === "Venta") return true;
                if (filter.temporal && status === "Alquiler temporal") return true;
                if (filter.anual && status === "Alquiler") return true;
                return false;
              })
              .filter((e) => filter.types[e.data().type])
              .filter((e) => {
                const data = e.data();
                if (filter.featured && data.featured) return true;
                if (filter.rentalFeatured && data.rentalFeatured) return true;
                if (filter.slider && data.slider) return true;
                if (filter.noFeatured && !data.slider && !data.rentalFeatured && !data.featured) return true;
                return false;
              })
              .map((p) => <HorizontalCard propiedad={p} key={p.id} />)}
          {hasMoreActive && (
            <button className="db-load-more" onClick={loadMoreActive}>
              Cargar más
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
