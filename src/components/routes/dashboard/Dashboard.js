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
// import { useAuthState } from "react-firebase-hooks/auth";
const Dashboard = () => {
  const [propieties, setPropieties] = useState([]);
  const [pausedPropieties, setPausedPropieties] = useState([]);
  const [filter, setFilter] = useState({
    venta: true,
    anual: true,
    temporal: true,
    casa: true,
    departamento: true,
    lote: true,
    featured: true,
    rentalFeatured: true,
    slider: true,
    noFeatured: true,
  });

  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      setPropieties([]);
      firestore
        .collection("estates")
        .where("agent.email", "==", user.email)
        .get()
        .then((e) => {
          e.docs.forEach((doc) => {
            setPropieties((sl) => [...sl, doc]);
          });
        });
      firestore
        .collection("pausedEstates")
        .where("agent.email", "==", user.email)
        .get()
        .then((e) => {
          e.docs.forEach((doc) => {
            setPausedPropieties((sl) => [...sl, doc]);
          });
        });
    }
  }, [user]);

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
            <label htmlFor="casa" className="db-aside-label">
              <input
                type="checkbox"
                name="casa"
                checked={filter.casa}
                onChange={(e) => setFilter((prev) => ({ ...prev, casa: e.target.checked }))}
              />
              Casa
            </label>
            <label htmlFor="departamento" className="db-aside-label">
              <input
                type="checkbox"
                name="departamento"
                checked={filter.departamento}
                onChange={(e) => setFilter((prev) => ({ ...prev, departamento: e.target.checked }))}
              />
              Departamento
            </label>
            <label htmlFor="lote" className="db-aside-label">
              <input
                type="checkbox"
                name="lote"
                checked={filter.lote}
                onChange={(e) => setFilter((prev) => ({ ...prev, lote: e.target.checked }))}
              />
              Terreno y lote
            </label>
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
          {propieties[0] &&
            propieties
              .filter((e) => {
                const status = e.data().comercialStatus;
                if (filter.venta && status === "Venta") return true;
                if (filter.temporal && status === "Alquiler temporal") return true;
                if (filter.anual && status === "Alquiler") return true;
                return false;
              })
              .filter((e) => {
                const status = e.data().type;
                if (filter.casa && status === "Casa") return true;
                if (filter.departamento && status === "Departamento") return true;
                if (filter.lote && status === "Terreno y lote") return true;
                return false;
              })
              .filter((e) => {
                const data = e.data();
                if (filter.featured && data.featured) return true;
                if (filter.rentalFeatured && data.rentalFeatured) return true;
                if (filter.slider && data.slider) return true;
                if (filter.noFeatured && !data.slider && !data.rentalFeatured && !data.featured) return true;
                return false;
              })
              .map((p) => <HorizontalCard propiedad={p} key={p.id} />)}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
