import React, { useState, useEffect, useReducer } from "react";
import { PageTitle } from "./../../pageTitle/PageTitle";
import Dropdown from "react-dropdown";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDropzone } from "react-dropzone";
import "react-dropdown/style.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./publicar.css";
import * as CF from "./const_funct"; //all the constants and functions, the component started to be a little bit too load
import { auth, firestore } from "../../../firebase";
import { reducer } from "./reducer";
import { Redirect, Link, useParams } from "react-router-dom";
import LogInForm from "../../logInform/LogInForm";
import { PROPIEDAD, CONTACTO } from "../../../routes";
import LoginMeli from "./meli_login";

const TOKEN_LIFETIME = 6 * 60 * 60 * 1000; // 6 horas
/*
 *************************** Component ******************************
 */

export const Publicar = () => {
  // ************* hooks *************
  const { id } = useParams();
  const editing = Boolean(id);
  const [input, setInput] = useState("");
  const [autofill, setAutofill] = useState(false);
  const [filesArrayRaw, setFilesArrayRaw] = useState([]);
  const [user] = useAuthState(auth);
  const [state, dispatch] = useReducer(reducer, CF.initialState);
  const [redirect, setRedirect] = useState("");
  const [switchImage, setSwitchImage] = useState(0);
  const [mlToken, setMLToken] = useState(null);
  const [token, setToken] = useState(null);
  const [checkingMeli, setCheckingMeli] = useState(true);
  useEffect(() => {
    if (editing) {
      firestore
        .collection("estates")
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            dispatch({ type: "setAll", value: doc.data() });
          }
        });
    }
  }, [editing, id]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files) =>
      setFilesArrayRaw((prevFiles) => [...prevFiles, ...files]),
  });

  const handleRemoveImage = (index) => {
    setFilesArrayRaw((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      firestore
        .collection("estates")
        .doc(id)
        .update(state)
        .then(() => {
          setRedirect(id);
          toast.success("Propiedad actualizada correctamente", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        })
        .catch(() =>
          toast.warn("Error", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          })
        );
      return;
    }
    const nameShorcut = state.title.slice(0, 21).replace(/\W/, "-");
    Promise.all(CF.addImagesToFirebaseAndReturnUrl(filesArrayRaw, nameShorcut)).then((imageUrlArray) => {
      firestore
        .collection("usersInfo")
        .where("email", "==", auth.currentUser.email)
        .get()
        .then((e) =>
          firestore
            .collection("estates")
            .add({ ...state, created: new Date(), images: imageUrlArray, agent: { ...e.docs[0].data() } })
            .then((prop) => {
              setRedirect(prop.id);
              toast.success("Propiedad subida correctamente", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
              setTimeout(() => window.location.reload(), 200);
            })
            .catch(() =>
              toast.warn("Error", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              })
            )
        );
    });
  };

  // ************* effects *************

  // useEfect for Mercado Libre input
  useEffect(() => {
    dispatch({ type: "field", field: "images", value: [] });
    let isSubscribed = true;
    const regexMLurl = /([A-Z]{3})-(\d+)/;
    let [itemIdurl] = input.match(regexMLurl) || [""];
    itemIdurl = itemIdurl.replace("-", "");
    if (itemIdurl) {
      const stored = localStorage.getItem("meli_token");
      if (!mlToken || !stored) {
        toast.warn("No hay token de MercadoLibre, por favor ingrese con su cuenta de MercadoLibre", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }
      try {
        const { expiresAt } = JSON.parse(stored);
        if (expiresAt && Date.now() > expiresAt) {
          localStorage.removeItem("meli_token");
          setMLToken(null);
          setAutofill(false);
          toast.warn("Token expirado, por favor inicie sesión nuevamente.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          return;
        }
      } catch {}

      CF.fetchEffect(itemIdurl, token)
        .then((estate) => {
          if (isSubscribed) {
            dispatch({
              type: "fullfilWithML",
              value: CF.mlFullfil(estate, CF.attributes),
            });
            estate.info.data.pictures.forEach((e, index) => {
              fetch(e.secure_url)
                .then((e) => e.blob())
                .then((b) => new File([b], `${b.size}`, { type: b.type }))
                .then((file) =>
                  setFilesArrayRaw((prefiles) =>
                    index === switchImage ? [file, ...prefiles] : [...prefiles, file]
                  )
                );
            });
          }
        })
        .catch((err) => {
          if (err.response && err.response.status === 403) {
            toast.warn("Sesión de MercadoLibre expirada, inicie sesión nuevamente", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            localStorage.removeItem("meli_token");
            setToken(null);
            setAutofill(false);
          } else {
            toast.warn("Error al obtener datos de MercadoLibre", {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
          }
        });
    }
    return () => (isSubscribed = false);
  }, [input, switchImage, mlToken, token]);

  useEffect(() => {
    const queryToken = getTokenFromHash();

    if (queryToken) {
      setMLToken(queryToken);
      setAutofill(true);
      const info = { token: queryToken, expiresAt: Date.now() + TOKEN_LIFETIME };
      localStorage.setItem("meli_token", JSON.stringify(info));
      window.history.replaceState({}, "", "/");
      setCheckingMeli(false);
      return;
    }

    const stored = localStorage.getItem("meli_token");
    if (stored) {
      try {
        const { token: savedToken, expiresAt } = JSON.parse(stored);
        if (expiresAt && Date.now() > expiresAt) {
          localStorage.removeItem("meli_token");
          setAutofill(false);
        } else {
          setMLToken(savedToken || stored);
          setAutofill(true);
        }
      } catch {
        setMLToken(stored);
        setAutofill(true);
      }
    } else {
      setAutofill(false);
    }
    setCheckingMeli(false);
  }, []);

  function getTokenFromHash() {
    const hash = window.location.hash; // ejemplo: "#/publicar-propiedad?token=abc123"
    const queryStart = hash.indexOf("?");
    if (queryStart === -1) return null;

    const queryString = hash.substring(queryStart + 1);
    const params = new URLSearchParams(queryString);
    return params.get("token");
  }

  return (
    <div className="publish-div">
      <PageTitle title={editing ? "Editar" : "Publicar"} />
      <p>token: {mlToken}</p>
      {redirect && <Redirect to={PROPIEDAD + redirect} />}
      {user ? (
        <div className="publish-form">
          <ToastContainer />
          {checkingMeli ? (
            <div className="c-loader" />
          ) : (
            !token && <LoginMeli />
          )}
          <div className="publish-form-mercadolibre">
            <input
              id="autofill"
              className="publish-form-mercadolibre-in"
              type="checkbox"
              checked={autofill}
              disabled={!mlToken}
              onChange={(e) => setAutofill(e.target.checked)}
              name="autofill"
            />
            <label htmlFor="autofill" className="publish-form-mercadolibre-label">
              Autocompletar con MercadoLibre
            </label>
          </div>
          {autofill && (
            <div className="publish-form-mercadolibre-url-div">
              <input
                className="publish-form-mercadolibre-url"
                type="text"
                placeholder="Pega aquí la URL de la publicación de MercadoLibre"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                name="mlurl"
              />
              <small className="publish-form-mercadolibre-help">
                Se completarán automáticamente los datos si la URL es válida
              </small>
            </div>
          )}
          <form encType="multipart/form-data" className="publish-form-form">
            <div className="publish-form-title-price-div">
              <label className="publish-form-title-label" htmlFor="title">
                Título de la propiedad{" "}
              </label>{" "}
              <div className="publish-form-title-div">
                <input
                  required={true}
                  className="publish-form-title-input publish-form-input"
                  name="title"
                  type="text"
                  value={state.title}
                  onChange={(e) => dispatch({ type: "field", field: "title", value: e.target.value })}
                />
              </div>
              <div className="publish-form-price-div">
                <div className="publish-form-price-il-div">
                  <label className="publish-form-price-label" htmlFor="price">
                    Precio:
                  </label>
                  <input
                    className="publish-form-price-input publish-form-input"
                    type="number"
                    name="price"
                    value={state.price.value}
                    onChange={(e) =>
                      dispatch({
                        type: "setPrice",
                        field: "value",
                        value: e.value,
                      })
                    }
                  />
                </div>
                <Dropdown
                  className="publish-form-dropdow-currency"
                  options={CF.dropdownVariables.correncyOptions}
                  value={state.price.currency}
                  onChange={(e) =>
                    dispatch({
                      type: "setPrice",
                      field: "currency",
                      value: e.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="publish-form-description-div">
              <label className="publish-form-description-label publish-form-title-label" htmlFor="description">
                Descripcion
              </label>
              <textarea
                className="publish-form-description-div-textarea publish-form-input"
                name="description"
                type="text"
                value={state.description}
                onChange={(e) => dispatch({ type: "field", field: "description", value: e.target.value })}
              />
            </div>
            <div className="publish-form-dropdown-div">
              <div className="publish-form-dropdown-type">
                <p> Tipo </p>
                <Dropdown
                  options={CF.dropdownVariables.type}
                  value={state.type}
                  onChange={(e) => dispatch({ type: "field", field: "type", value: e.value })}
                />
              </div>
              <div className="publish-form-dropdown-type">
                <p> Estado </p>
                <Dropdown
                  options={CF.dropdownVariables.status}
                  value={state.comercialStatus}
                  onChange={(e) =>
                    dispatch({
                      type: "field",
                      field: "comercialStatus",
                      value: e.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="publish-form-location">
              <h2 className="publish-candf-title"> Ubicación </h2>
              {CF.ubicationFields.map((fieldObj) => (
                <div className="publish-form-location-div" key={fieldObj.dispatchField}>
                  <label htmlFor={fieldObj.dispatchField} className="publish-form-location-label publish-form-label">
                    {fieldObj.name}:
                  </label>
                  <input
                    className="publish-form-input publish-form-location-input"
                    type="text"
                    name={fieldObj.dispatchField}
                    value={state.location[fieldObj.dispatchField]}
                    onChange={(e) =>
                      dispatch({
                        type: "setLocation",
                        field: fieldObj.dispatchField,
                        value: e.target.value,
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="publish-form-char">
              <h2 className="publish-candf-title"> Características y atributos</h2>
              {CF.characteristics.map((title) => {
                return (
                  <div className="publish-form-char-div" key={title}>
                    <label className="publish-form-char-label"> {title}: </label>
                    <input
                      className="publish-form-input publish-form-char-input"
                      value={state.characteristics[title]}
                      onChange={(e) =>
                        dispatch({
                          type: "charact",
                          value: e.target.value,
                          field: title,
                        })
                      }
                      type="text"
                    />
                  </div>
                );
              })}
            </div>
            <div className="publish-form-att">
              {CF.attributes.map((title) => {
                return (
                  <div className="publish-form-att-div" key={title}>
                    <label
                      onClick={(e) => {
                        dispatch({
                          type: "feature",
                          value: !state.attributes[title],
                          field: title,
                        });
                      }}
                      className="publish-form-att-label"
                    >
                      {title}
                    </label>
                    <input
                      className="publish-form-att-input"
                      onChange={(e) => {
                        dispatch({
                          type: "feature",
                          value: e.target.checked,
                          field: title,
                        });
                      }}
                      type="checkbox"
                      checked={state.attributes[title]}
                    />
                  </div>
                );
              })}
            </div>
            <div className="publish-form-images-div">
              <h2 className="publish-form-images-title"> Imagenes y videos</h2>
              <p
                onClick={() => {
                  setSwitchImage((e) => (e ? 0 : 1));
                }}
              >
                asd
              </p>
              <div {...getRootProps({ className: "publish-form-images-dropzone" })}>
                <input {...getInputProps()} />
                <p> Arrastra las imagenes aqui, o has click para seleccionar los archivos </p>
              </div>
              <aside>
                <ul className="publish-form-images-ul"> {CF.doImageListFromFiles(filesArrayRaw, handleRemoveImage)} </ul>
              </aside>
            </div>
            <div className="publish-form-video-div">
              <input
                className="publish-form-video-input"
                type="text"
                placeholder="Enlace video YouTube..."
                onChange={(e) =>
                  dispatch({ type: "field", field: "video_id", value: e.target.value.match(/(?<=watch\?v=)[\w-]+/) })
                }
              />
              {state.video_id && (
                <iframe
                  className="publish-form-video-iframe"
                  src={`https://www.youtube.com/embed/${state.video_id}`}
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  title="video"
                />
              )}
            </div>
            <div>
              <input
                value={state.featured}
                onChange={(e) => dispatch({ type: "field", field: "featured", value: e.target.checked })}
                type="checkbox"
              />
              <label> Propiedad destacada </label>
              <br />
              <input
                value={state.rentalFeatured}
                onChange={(e) => dispatch({ type: "field", field: "rentalFeatured", value: e.target.checked })}
                type="checkbox"
              />
              <label> Propiedad destacada en Alquiler Temporal </label>
              <br />
              <input
                value={state.featured}
                onChange={(e) => dispatch({ type: "field", field: "slider", value: e.target.checked })}
                name="terms"
                type="checkbox"
              />
              <label> Propiedad visible en el slider </label>
            </div>
            <div>
              <input name="terms" type="checkbox" />
              <label htmlFor="terms"> Acepte los términos y condiciones antes de enviar la propiedad. ( ? ? ? ) </label>
            </div>
            <button className="publish-form-submit" onClick={handleSubmit}>
              {editing ? "Guardar Cambios" : "Enviar Propiedad"}
            </button>{" "}
            <br />
          </form>
        </div>
      ) : (
        <div className="publish-not-logged">
          {false && <Redirect to={PROPIEDAD + redirect} />}
          <p className="publish-sorry-not-alowed">
            Tienes que ingresar en una cuenta para poder publicar una propiedad
          </p>
          <div className="publish-login-wrapper">
            <LogInForm />
            <p className="publish-contact-text">
              ¿No tienes cuenta? <Link to={CONTACTO}>Contáctanos para publicar</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Publicar;
