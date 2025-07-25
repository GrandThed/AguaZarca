import React, { useState } from "react";
import { IconContext } from "react-icons";
import { BiCamera } from "react-icons/bi";
import { AiOutlineDelete, AiOutlinePauseCircle, AiOutlinePlayCircle, AiOutlineEdit } from "react-icons/ai";
import { FaImages, FaMapMarkerAlt, FaStar, FaHome } from "react-icons/fa";
import "./card.css";
import { icons } from "../slider/Slider";
import { Link } from "react-router-dom";
import { PROPIEDAD, EDITAR_PROPIEDAD } from "../../routes";
import { firestore, auth } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { isAdmin } from "../../utils/auth";
import { toast } from "react-toastify";
import { createPropertyUrl } from "../../utils/slugify";

const Card = ({ propiedad }) => {
  const data = propiedad ? propiedad.data() : false;
  return (
    <article className="card-div">
      {data ? (
        <div>
          <Link className="card-link" to={createPropertyUrl(data, propiedad.id)} aria-label={`Ver detalles de ${data.title} en ${data.location?.city}`}>
            <div 
              className="card-image" 
              style={{ backgroundImage: `url(${data.images[0]})` }}
              role="img"
              aria-label={`Imagen de ${data.title} - ${data.type} en ${data.location?.city}`}
            >
              <p className="card-image-counter" aria-label={`${data.images.length} fotos disponibles`}>
                <IconContext.Provider value={{ className: "card-image-icon" }}>
                  <BiCamera />
                </IconContext.Provider>
                {data.images.length}
              </p>
              <p className="card-image-type">{data.type}</p>
            </div>
            <div className="card-content"></div>
            <CardContent propiedad={data}></CardContent>
          </Link>
        </div>
      ) : (
        <div className="card-null">
          <div className="loading">
            <div className="dot dot-1"></div>
            <div className="dot dot-2"></div>
            <div className="dot dot-3"></div>
            <div className="dot dot-4"></div>
          </div>
        </div>
      )}
    </article>
  );
};

const selectCharacteristics = {
  Casa: ["Dormitorios", "Baños", "Superficie cubierta"],
  Departamento: ["Dormitorios", "Baños", "Superficie cubierta"],
  "Terreno y lote": ["Superficie total"],
  Local: ["Superficie cubierta", "Baños"],
  "Otro inmueble": ["Superficie cubierta"],
};

const CardContent = ({ propiedad }) => {
  let { title, location, characteristics, comercialStatus, price, type } = propiedad;
  const currencyFormat = new Intl.NumberFormat("es-ES", { style: "decimal" });

  return (
    <div className="card-content-div">
      <div className="card-cont-div">
        <div className="card-cont-container-filler"></div>
        <div className="card-cont-container">
          <IconContext.Provider value={{ className: "card-cont-icons" }}>
            <header className="card-header">
              <h2 className="card-cont-title">{title}</h2>
              <address className="card-cont-ubication">{`${location.city}, ${location.state}`}</address>
            </header>
            <div className="card-cont-features">
              {(selectCharacteristics[type] || []).map((key) => {
                return (
                  <div className="card-cont-feat-icons-div" key={key}>
                    <h5 className="card-cont-feat-title">{key}</h5>
                    <p className="card-cont-feat-p">
                      {icons[key]}{" "}
                      <span
                        className={`image-text-span${
                          key === "Superficie cubierta" || key === "Superficie total" ? " m2 m2card" : ""
                        }`}
                      >
                        {parseInt(characteristics[key]) || 0}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
            <h3 className="card-cont-price-title">{comercialStatus}</h3>
            <p className="card-cont-price">
              {Number(price.value) > 0 ? (
                <>
                  {currencyFormat.format(price.value)} <span className="card-currency">{price.currency}</span>
                </>
              ) : (
                "--"
              )}
            </p>
          </IconContext.Provider>
        </div>
      </div>
    </div>
  );
};

export const HorizontalCard = ({ propiedad, paused }) => {
  const {
    images,
    comercialStatus,
    created,
    location,
    price,
    featured,
    rentalFeatured,
    slider,
    title,
    type,
  } = propiedad.data() || {};

  const [whereFreat, setWhereFreat] = useState({
    featured,
    rentalFeatured,
    slider,
  });
  const [deleted, setDeleted] = useState(false);
  const [user] = useAuthState(auth);

  const date = new Date(created.seconds * 1000);

  const handleFirebaseUpdate = (updateTerm, value) => {
    firestore
      .collection("estates")
      .doc(propiedad.id)
      .update({ [updateTerm]: value })
      .then((e) => {
        setWhereFreat((e) => ({ ...e, [updateTerm]: value }));
        toast.success("Propiedad actualizada correctamente", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      });
  };

  const handleDelete = (collection) => {
    if (window.confirm("Estas seguro de que quieres borrar esta propiedad")) {
      firestore
        .collection(collection)
        .doc(propiedad.id)
        .delete()
        .then((e) => {
          setDeleted(true);
          toast.success("Propiedad borrada correctamente", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        })
        .catch((e) => window.alert("Hubo un error con el servidor " + e.error));
    }
  };

  const handlePause = (state) => {
    const isPaused = state === "pause";
    firestore
      .collection(isPaused ? "pausedEstates" : "estates")
      .doc(propiedad.id)
      .set(propiedad.data())
      .then(() => {
        firestore
          .collection(isPaused ? "estates" : "pausedEstates")
          .doc(propiedad.id)
          .delete()
          .then((e) => {
            setDeleted(true);
            toast.success("Propiedad pausada correctamente", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          });
      });
  };


  const formatPrice = (price) => {
    if (!price || Number(price.value) <= 0) return "--";
    return new Intl.NumberFormat("es-ES").format(price.value);
  };

  return (
    <>
      {!deleted && (
        <div className={`hc-modern ${paused ? "hc-paused" : "hc-active"}`}>
          {/* Status Indicator */}
          <div className={`hc-status-indicator ${paused ? "paused" : "active"}`}>
            <span className="hc-status-text">{paused ? "Pausada" : "Activa"}</span>
          </div>

          {/* Property Image */}
          <div className="hc-image-container">
            <div 
              className="hc-image-modern" 
              style={{ backgroundImage: `url(${images[0]})` }}
              role="img"
              aria-label={`Imagen de ${title}`}
            >
              <div className="hc-image-overlay">
                <span className="hc-property-type">{type}</span>
                {images.length > 1 && (
                  <span className="hc-image-count">
                    <FaImages /> {images.length}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Property Information */}
          <div className="hc-content">
            <div className="hc-main-info">
              <div className="hc-header">
                <h3 className="hc-title-modern">{title}</h3>
                <div className="hc-meta">
                  <span className="hc-commercial-status">{comercialStatus}</span>
                  <span className="hc-date-created">{date.toLocaleDateString()}</span>
                </div>
              </div>

              <div className="hc-location">
                <FaMapMarkerAlt className="hc-location-icon" />
                <span>{location.city}, {location.state}</span>
              </div>

              <div className="hc-price-container">
                <span className="hc-price-modern">
                  {formatPrice(price)}
                  {price && price.currency && Number(price.value) > 0 && (
                    <span className="hc-currency"> {price.currency}</span>
                  )}
                </span>
              </div>
            </div>

            {/* Featured Options */}
            <div className="hc-featured-section">
              <div className="hc-featured-options">
                <label className="hc-featured-option" title="Destacada General">
                  <input
                    type="checkbox"
                    checked={whereFreat.featured}
                    onChange={(e) => handleFirebaseUpdate("featured", e.target.checked)}
                    className="hc-checkbox"
                  />
                  <div className="hc-checkbox-custom">
                    <FaStar className="hc-checkbox-icon" />
                  </div>
                </label>

                <label className="hc-featured-option" title="Destacada Alquiler">
                  <input
                    type="checkbox"
                    checked={whereFreat.rentalFeatured}
                    onChange={(e) => handleFirebaseUpdate("rentalFeatured", e.target.checked)}
                    className="hc-checkbox"
                  />
                  <div className="hc-checkbox-custom">
                    <FaHome className="hc-checkbox-icon" />
                  </div>
                </label>

                <label className="hc-featured-option" title="Slider Principal">
                  <input
                    type="checkbox"
                    checked={whereFreat.slider}
                    onChange={(e) => handleFirebaseUpdate("slider", e.target.checked)}
                    className="hc-checkbox"
                  />
                  <div className="hc-checkbox-custom">
                    <FaImages className="hc-checkbox-icon" />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="hc-actions">
            <div className="hc-actions-group">
              <button 
                className="hc-action-btn hc-pause-btn"
                onClick={() => handlePause(paused ? false : "pause")}
                title={paused ? "Reactivar propiedad" : "Pausar propiedad"}
              >
                {paused ? <AiOutlinePlayCircle /> : <AiOutlinePauseCircle />}
                <span>{paused ? "Reactivar" : "Pausar"}</span>
              </button>


              {isAdmin(user) && (
                <Link 
                  className="hc-action-btn hc-edit-btn"
                  to={EDITAR_PROPIEDAD.replace(":id", propiedad.id)}
                  title="Editar propiedad"
                >
                  <AiOutlineEdit />
                  <span>Editar</span>
                </Link>
              )}

              <button 
                className="hc-action-btn hc-delete-btn"
                onClick={() => handleDelete(paused ? "pausedEstates" : "estates")}
                title="Eliminar propiedad"
              >
                <AiOutlineDelete />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;

// featured rentalFeatured slider
