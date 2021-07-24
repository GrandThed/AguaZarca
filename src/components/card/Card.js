import React, { useState } from "react";
import { IconContext } from "react-icons";
import { BiCamera } from "react-icons/bi";
import { AiOutlineDelete, AiOutlinePauseCircle, AiOutlinePlayCircle } from "react-icons/ai";
import { MdSystemUpdateAlt } from "react-icons/md";
import "./card.css";
import { icons } from "../Slider/Slider";
import { Link } from "react-router-dom";
import { PROPIEDAD } from "../../routes";
import { firestore } from "../../firebase";
import { fetchEffect, mlFullfil } from "../routes/publicar/const_funct";
import { toast } from "react-toastify";

const Card = ({ propiedad }) => {
  const data = propiedad ? propiedad.data() : false;
  return (
    <article className="card-div">
      {data ? (
        <div>
          <Link className="card-link" to={PROPIEDAD + propiedad.id}>
            <div className="card-image" style={{ backgroundImage: `url(${data.images[0]})` }}>
              <p className="card-image-counter">
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
            <h2 className="card-cont-title">{title}</h2>
            <h4 className="card-cont-ubication">{`${location.city}, ${location.state}`}</h4>
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
                        {parseInt(characteristics[key])}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>
            <h3 className="card-cont-price-title">{comercialStatus}</h3>
            <p className="card-cont-price">
              ${currencyFormat.format(price.value)} <span className="card-currency">{price.currency}</span>
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
    mercadolibre,
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

  const handleUpdate = (collection) => {
    if (mercadolibre.id) {
      fetchEffect(mercadolibre.id).then((estate) => {
        firestore
          .collection(collection)
          .doc(propiedad.id)
          .update(mlFullfil(estate))
          .then(() => {
            toast.success("Propiedad actializada correctamente", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          })
          .catch((e) => console.log(e));
      });
    }
  };

  return (
    <>
      {!deleted && (
        <div className={`hc-main${paused ? " hc-main-paused" : ""}`}>
          <div className="hc-image" style={{ backgroundImage: `url(${images[0]})` }} />
          <IconContext.Provider value={{ className: "hc-control-icons" }}>
            <div className="hc-control">
              <button className="hc-control-button" onClick={() => handleDelete(paused ? "pausedEstates" : "estates")}>
                <AiOutlineDelete />
              </button>
              <button className="hc-control-button" onClick={() => handlePause(paused ? false : "pause")}>
                {paused ? <AiOutlinePlayCircle /> : <AiOutlinePauseCircle />}
              </button>
              <button className="hc-control-button" onClick={() => handleUpdate(paused ? "pausedEstates" : "estates")}>
                <MdSystemUpdateAlt />
              </button>
            </div>
          </IconContext.Provider>
          <div className="hc-body">
            <div className="hc-info">
              <div className="hc-title-div">
                <h2 className="hc-title">{title}</h2>
              </div>
              <div className="hc-status">
                <p className="hc-status-p">
                  <span className="hc-status-span">{comercialStatus}</span>
                  <span className="hc-status-span">{type}</span>
                </p>
              </div>
              <div className="hc-price">
                <p className="hc-price-p">
                  <span className="hc-price-span">{price.value}</span>
                  <span className="hc-price-span">{price.currency}</span>
                  <span className="hc-date">{date.toLocaleDateString()}</span>
                </p>
              </div>
              <div className="hc-price">
                <p className="hc-price-p">
                  {`${location.addressLine}, ${location.neighborhood}, ${location.city}, ${location.state}, ${location.country}`}
                </p>
              </div>
            </div>
            <div className="hc-tracks">
              <div className="hc-track-item">
                <abbr title="Destacado Slider" >SL</abbr>
                <input
                  type="checkbox"
                  checked={whereFreat.slider}
                  onChange={(e) => handleFirebaseUpdate("slider", e.target.checked)}
                />
              </div>
              <div className="hc-track-item">
                <abbr title="Destacado en alquiler" >RF</abbr>
                <input
                  type="checkbox"
                  checked={whereFreat.rentalFeatured}
                  onChange={(e) => handleFirebaseUpdate("rentalFeatured", e.target.checked)}
                />
              </div>
              <div className="hc-track-item">
                <abbr title="Destacado general" >FR</abbr>
                <input
                  type="checkbox"
                  checked={whereFreat.featured}
                  onChange={(e) => handleFirebaseUpdate("featured", e.target.checked)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Card;

// featured rentalFeatured slider
