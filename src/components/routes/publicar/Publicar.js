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
import { useVerifyMeliToken } from "./useVerifyMeliUser";
import { compressImage } from "../../../utils/imageOptim";

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
  const { meliUser, valid, error } = useVerifyMeliToken(mlToken);

  // Check if required fields are filled
  const requiredFieldsFilled = state.title && state.price.value && state.location.addressLine;

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };
  useEffect(() => {
    if (editing) {
      firestore
        .collection("estates")
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const data = { ...CF.initialState, ...doc.data() };
            dispatch({ type: "setAll", value: data });
            if (Array.isArray(data.images)) {
              setFilesArrayRaw(data.images);
            }
          }
        });
    }
  }, [editing, id]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files) => setFilesArrayRaw((prevFiles) => [...prevFiles, ...files]),
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

  // ************* MercadoLibre Image Fetching *************
  
  const fetchMercadoLibreImages = async (pictures, switchImage) => {
    if (!pictures || pictures.length === 0) return;

    // Show loading toast
    const loadingToast = toast.info(`Cargando ${pictures.length} imágenes de MercadoLibre...`, {
      position: "top-right",
      autoClose: false,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: false,
    });

    const MAX_SIZE_MB = 5;
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    // Create parallel promises for all images
    const imagePromises = pictures.map(async (picture, index) => {
      try {
        // Fetch image with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(picture.secure_url, {
          signal: controller.signal,
          headers: {
            'Accept': 'image/*',
          }
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        
        // Validate image type
        if (!ALLOWED_TYPES.includes(blob.type)) {
          console.warn(`Imagen ${index + 1}: Tipo no soportado (${blob.type})`);
          return null;
        }

        // Validate size
        const sizeMB = blob.size / (1024 * 1024);
        if (sizeMB > MAX_SIZE_MB * 2) { // Allow 2x size before compression
          console.warn(`Imagen ${index + 1}: Demasiado grande (${sizeMB.toFixed(1)}MB)`);
          return null;
        }

        // Create file with proper name
        let file = new File([blob], `ml-image-${index + 1}.jpg`, { 
          type: blob.type,
          lastModified: Date.now()
        });

        // Compress if needed
        if (sizeMB > MAX_SIZE_MB) {
          try {
            file = await compressImage(file, {
              maxSizeMB: MAX_SIZE_MB,
              maxWidthOrHeight: 1280,
              useWebWorker: true,
            });
          } catch (compressionError) {
            console.warn(`Error comprimiendo imagen ${index + 1}:`, compressionError);
            // Use original file if compression fails
          }
        }

        return { file, index, originalIndex: index };
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn(`Imagen ${index + 1}: Timeout al cargar`);
        } else {
          console.warn(`Error cargando imagen ${index + 1}:`, error.message);
        }
        return null;
      }
    });

    try {
      // Wait for all images (successful and failed)
      const results = await Promise.allSettled(imagePromises);
      
      // Filter successful results and maintain order
      const successfulImages = results
        .map((result, index) => ({
          success: result.status === 'fulfilled' && result.value !== null,
          data: result.value,
          originalIndex: index
        }))
        .filter(item => item.success)
        .map(item => item.data);

      const failedCount = pictures.length - successfulImages.length;

      // Update files array in correct order
      if (successfulImages.length > 0) {
        // Sort by original index to maintain MercadoLibre order
        successfulImages.sort((a, b) => a.originalIndex - b.originalIndex);
        
        // Build new files array with switchImage logic
        let newFiles = [];
        successfulImages.forEach(({ file, originalIndex }) => {
          if (originalIndex === switchImage) {
            newFiles.unshift(file); // Add to beginning
          } else {
            newFiles.push(file);
          }
        });

        // Single state update
        setFilesArrayRaw(prevFiles => [...newFiles, ...prevFiles]);

        // Success message
        toast.dismiss(loadingToast);
        toast.success(
          `${successfulImages.length} imagen${successfulImages.length !== 1 ? 'es' : ''} cargada${successfulImages.length !== 1 ? 's' : ''} correctamente` +
          (failedCount > 0 ? ` (${failedCount} fallaron)` : ''), 
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      } else {
        // All images failed
        toast.dismiss(loadingToast);
        toast.error('No se pudieron cargar las imágenes de MercadoLibre. Verifica tu conexión.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error inesperado al procesar las imágenes', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error('Error in fetchMercadoLibreImages:', error);
    }
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

      CF.fetchEffect(itemIdurl, mlToken)
        .then((estate) => {
          if (isSubscribed) {
            dispatch({
              type: "fullfilWithML",
              value: CF.mlFullfil(estate, CF.attributes),
            });
            // Improved parallel image fetching with error handling
            fetchMercadoLibreImages(estate.info.data.pictures, switchImage);
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
      <PageTitle title={editing ? "Editar Propiedad" : "Publicar Nueva Propiedad"} />
      {redirect && <Redirect to={PROPIEDAD + redirect} />}
      {user ? (
        <div className="publish-form">
          <ToastContainer />
          
          {/* Progress Navigator */}
          <div className="progress-navigator">
            <button 
              className={`progress-step ${state.title ? 'completed' : 'active'}`}
              onClick={() => scrollToSection('basic-info-section')}
            >
              <span className="step-icon">📝</span>
              <span className="step-text">Información Básica</span>
            </button>
            <button 
              className={`progress-step ${state.location.addressLine ? 'completed' : state.title ? 'active' : ''}`}
              onClick={() => scrollToSection('location-section')}
            >
              <span className="step-icon">📍</span>
              <span className="step-text">Ubicación</span>
            </button>
            <button 
              className={`progress-step ${Object.values(state.characteristics).some(val => val) ? 'completed' : state.location.addressLine ? 'active' : ''}`}
              onClick={() => scrollToSection('characteristics-section')}
            >
              <span className="step-icon">🏠</span>
              <span className="step-text">Características</span>
            </button>
            <button 
              className={`progress-step ${filesArrayRaw.length > 0 ? 'completed' : Object.values(state.characteristics).some(val => val) ? 'active' : ''}`}
              onClick={() => scrollToSection('images-section')}
            >
              <span className="step-icon">📸</span>
              <span className="step-text">Imágenes</span>
            </button>
          </div>

          {/* MercadoLibre Integration Card */}
          <div className="meli-integration-card">
            <div className="meli-header">
              <div className="meli-brand">
                <div className="meli-logo">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  MercadoLibre
                </div>
                <div className={`meli-status-badge ${mlToken ? 'connected' : 'disconnected'}`}>
                  {mlToken ? 'Conectado' : 'No conectado'}
                </div>
              </div>
              <p className="meli-description">
                Importa automáticamente los datos de tu publicación existente en MercadoLibre
              </p>
            </div>

            {checkingMeli ? (
              <div className="meli-loading">
                <div className="meli-spinner"></div>
                <p>Verificando conexión...</p>
              </div>
            ) : !mlToken ? (
              <div className="meli-login-section">
                <div className="meli-benefits">
                  <h4>¿Por qué conectar con MercadoLibre?</h4>
                  <ul>
                    <li>✨ Autocompletar todos los datos de tu propiedad</li>
                    <li>🏠 Importar características y atributos</li>
                    <li>📍 Copiar ubicación exacta</li>
                    <li>🖼️ Descargar todas las imágenes</li>
                  </ul>
                </div>
                <LoginMeli />
              </div>
            ) : (
              <div className="meli-connected-section">
                {meliUser && (
                  <div className="meli-user-card">
                    <div className="meli-user-avatar">
                      {meliUser.nickname?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="meli-user-details">
                      <h4>{meliUser.nickname}</h4>
                      <p>ID: {meliUser.id}</p>
                    </div>
                  </div>
                )}

                <div className="meli-import-section">
                  <div className="meli-toggle">
                    <input
                      id="autofill"
                      className="meli-switch"
                      type="checkbox"
                      checked={autofill}
                      onChange={(e) => setAutofill(e.target.checked)}
                    />
                    <label htmlFor="autofill" className="meli-switch-label">
                      <span className="meli-switch-text">
                        Activar importación automática
                      </span>
                    </label>
                  </div>
                  
                  {autofill && (
                    <div className="meli-url-input-section">
                      <div className="meli-input-group">
                        <input
                          className="meli-url-input"
                          type="text"
                          placeholder="https://articulo.mercadolibre.com.ar/MLA-xxxxxxxxx-..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                        />
                        <div className="meli-input-icon">
                          {input && input.match(/([A-Z]{3})-(\d+)/) ? '✅' : '📋'}
                        </div>
                      </div>
                      <div className="meli-help-text">
                        Pega la URL de tu publicación y verás los datos completarse automáticamente
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <form encType="multipart/form-data" className="publish-form-form">
            
            {/* Basic Information Section */}
            <div id="basic-info-section" className="publish-section">
              <h2 className="publish-section-title">Información Básica</h2>
              
              <div className="form-group">
                <label className="form-label" htmlFor="title">
                  Título de la propiedad *
                </label>
                <input
                  required={true}
                  className="publish-form-input"
                  name="title"
                  type="text"
                  placeholder="Ej: Hermoso departamento 2 ambientes en Palermo"
                  value={state.title}
                  onChange={(e) => dispatch({ type: "field", field: "title", value: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Descripción
                </label>
                <textarea
                  className="publish-form-input"
                  name="description"
                  rows="6"
                  placeholder="Describe tu propiedad en detalle: características, ubicación, servicios incluidos..."
                  value={state.description}
                  onChange={(e) => dispatch({ type: "field", field: "description", value: e.target.value })}
                />
              </div>

              <div className="price-row">
                <div className="price-input-container">
                  <label className="form-label">Precio *</label>
                  <input
                    className="publish-form-input"
                    type="number"
                    name="price"
                    placeholder="0"
                    value={state.price.value}
                    onChange={(e) =>
                      dispatch({
                        type: "setPrice",
                        field: "value",
                        value: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="currency-container">
                  <label className="form-label">Moneda</label>
                  <Dropdown
                    className="currency-dropdown"
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

              <div className="form-row">
                <div className="form-col">
                  <label className="form-label">Tipo de Propiedad</label>
                  <Dropdown
                    className="publish-form-dropdown"
                    options={CF.dropdownVariables.type}
                    value={state.type}
                    onChange={(e) => dispatch({ type: "field", field: "type", value: e.value })}
                  />
                </div>
                <div className="form-col">
                  <label className="form-label">Operación</label>
                  <Dropdown
                    className="publish-form-dropdown"
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
            </div>
            {/* Location Section */}
            <div id="location-section" className="publish-section">
              <h2 className="publish-section-title">Ubicación</h2>
              <div className="form-row">
                {CF.ubicationFields.map((fieldObj) => (
                  <div className="form-col" key={fieldObj.dispatchField}>
                    <label className="form-label">
                      {fieldObj.name}
                    </label>
                    <input
                      className="publish-form-input"
                      type="text"
                      name={fieldObj.dispatchField}
                      placeholder={`Ingresa ${fieldObj.name.toLowerCase()}`}
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
            </div>

            {/* Characteristics Section */}
            <div id="characteristics-section" className="publish-section">
              <h2 className="publish-section-title">Características</h2>
              <div className="characteristics-grid">
                {CF.characteristics.map((title) => {
                  return (
                    <div className="form-group" key={title}>
                      <label className="form-label">{title}</label>
                      <input
                        className="publish-form-input"
                        value={state.characteristics[title]}
                        onChange={(e) =>
                          dispatch({
                            type: "charact",
                            value: e.target.value,
                            field: title,
                          })
                        }
                        type="text"
                        placeholder={title.includes('m²') || title.includes('Superficie') ? 'Ej: 50 m²' : 
                                   title.includes('Horario') ? 'Ej: 14:00' :
                                   title.includes('Estadía') ? 'Ej: 2' : 
                                   'Cantidad'}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attributes Section */}
            <div className="publish-section">
              <h2 className="publish-section-title">Comodidades y Servicios</h2>
              <div className="attributes-grid">
                {CF.attributes.map((title) => {
                  return (
                    <div 
                      className={`attribute-item ${state.attributes[title] ? 'selected' : ''}`} 
                      key={title}
                      onClick={() => {
                        dispatch({
                          type: "feature",
                          value: !state.attributes[title],
                          field: title,
                        });
                      }}
                    >
                      <input
                        className="attribute-checkbox"
                        onChange={() => {}} // Controlled by parent div onClick
                        type="checkbox"
                        checked={state.attributes[title]}
                        readOnly
                      />
                      <span className="attribute-text">{title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Images and Media Section */}
            <div id="images-section" className="publish-section">
              <h2 className="publish-section-title">Imágenes y Videos</h2>
              
              <div {...getRootProps({ className: "images-dropzone" })}>
                <input {...getInputProps()} />
                <p>📸 Arrastra las imágenes aquí o haz click para seleccionar archivos</p>
                <small>Formatos aceptados: JPG, PNG, WebP (máximo 5MB por imagen)</small>
              </div>
              
              {filesArrayRaw.length > 0 && (
                <div className="images-grid">
                  {filesArrayRaw.map((file, index) => {
                    if (!file) return null;
                    const src = typeof file === "string" ? file : (window.URL || window.webkitURL).createObjectURL(file);
                    return (
                      <div className="image-item" key={file.name || index}>
                        <img className="image-preview" src={src} alt={`Imagen ${index + 1}`} />
                        <button 
                          type="button" 
                          className="image-remove-btn" 
                          onClick={() => handleRemoveImage(index)}
                          title="Eliminar imagen"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Video de YouTube (opcional)</label>
                <input
                  className="publish-form-input"
                  type="text"
                  placeholder="Ej: https://www.youtube.com/watch?v=abc123..."
                  value={state.video_id || ""}
                  onChange={(e) =>
                    dispatch({ type: "field", field: "video_id", value: e.target.value.match(/(?<=watch\?v=)[\w-]+/) })
                  }
                />
                {state.video_id && (
                  <div style={{ marginTop: "15px" }}>
                    <iframe
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${state.video_id}`}
                      frameBorder="0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title="Video de la propiedad"
                      style={{ borderRadius: "8px" }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Options Section */}
            <div className="publish-section">
              <h2 className="publish-section-title">Opciones de Publicación</h2>
              <div className="options-grid">
                <div className="option-item">
                  <label className="option-label">
                    <input
                      checked={state.featured}
                      onChange={(e) => dispatch({ type: "field", field: "featured", value: e.target.checked })}
                      type="checkbox"
                      className="option-checkbox"
                    />
                    <span className="option-text">
                      <strong>⭐ Propiedad Destacada</strong>
                      <small>Mayor visibilidad en listados generales</small>
                    </span>
                  </label>
                </div>

                <div className="option-item">
                  <label className="option-label">
                    <input
                      checked={state.rentalFeatured}
                      onChange={(e) => dispatch({ type: "field", field: "rentalFeatured", value: e.target.checked })}
                      type="checkbox"
                      className="option-checkbox"
                    />
                    <span className="option-text">
                      <strong>🏖️ Destacada en Alquiler Temporal</strong>
                      <small>Aparece en la sección de alquileres vacacionales</small>
                    </span>
                  </label>
                </div>

                <div className="option-item">
                  <label className="option-label">
                    <input
                      checked={state.slider}
                      onChange={(e) => dispatch({ type: "field", field: "slider", value: e.target.checked })}
                      type="checkbox"
                      className="option-checkbox"
                    />
                    <span className="option-text">
                      <strong>🎯 Visible en Slider Principal</strong>
                      <small>Aparece en el carrusel de la página principal</small>
                    </span>
                  </label>
                </div>
              </div>
            </div>

          </form>

          {/* Fixed Submit Button */}
          {requiredFieldsFilled && (
            <div className="fixed-submit-container">
              <button 
                className="fixed-submit-btn" 
                onClick={handleSubmit} 
                type="submit"
              >
                {editing ? "Guardar Cambios" : "Publicar Propiedad"}
              </button>
            </div>
          )}
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
