import React, { useState, useEffect, useReducer } from "react";
import { PageTitle } from "./../../pageTitle/PageTitle";
import Dropdown from "react-dropdown";
import { useDropzone } from "react-dropzone";
import "react-dropdown/style.css";
import "./publicar.css";
import * as CF from "./const_funct"; //all the constants and functions, the component started to see a little bit too load
import { reducer } from "./reducer";

/*
 ***************************           ******************************
 *************************** Component ******************************
 ***************************           ******************************
 */

export const Publicar = () => {
  //basic states of publish conponent
  let [input, setInput] = useState("");
  let [autofill, setAutofill] = useState(false);
  const [state, dispatch] = useReducer(reducer, CF.initialState);

  //images Dropzone
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

  useEffect(() => {
    if (acceptedFiles) {
      dispatch({ type: "addImagesArray", value: CF.urlFromFilesArray(acceptedFiles) });
    }
  }, [acceptedFiles]);

  useEffect(() => {
    let isSubscribed = true;
    const regexMLurl = /([A-Z]{3})-(\d+)/;
    let [itemIdurl] = input.match(regexMLurl) || [""];
    itemIdurl = itemIdurl.replace("-", "");
    if (itemIdurl) {
      CF.fetchEffect(itemIdurl).then((estate) => {
        if (isSubscribed) {
          dispatch({
            type: "fullfilWithML",
            value: CF.mlFullfil(estate.data, CF.attributes),
          });
          estate.data.pictures.map(async (e) => {
            let response = await fetch(e.url);
            let blob = await response.blob();
            const file = new File([blob], "image.jpg", { type: blob.type });
            dispatch({type: "addImage", value: URL.createObjectURL(file)})
          });
        }
      });
    }
    return () => (isSubscribed = false);
  }, [input]);

  return (
    <div className="publish-div">
      <PageTitle title="Publicar"></PageTitle>
      <div className="publish-form">
        <div className="publish-form-mercadolibre">
          <label htmlFor="autofill">AutoFill con Mercado libre</label>
          <input
            className="publish-form-mercadolibre-in"
            type="checkbox"
            value={autofill}
            onChange={(e) => setAutofill(e.target.checked)}
            name="autofill"
          />

          {autofill ? (
            <div>
              <input
                className="publish-form-mercadolibre-url"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                name="mlurl"
              />
            </div>
          ) : null}
        </div>
        <form encType="multipart/form-data" className="publish-form-form">
          <div className="publish-form-title-price-div">
            <label className="publish-form-title-label" htmlFor="title">
              Título de la propiedad
            </label>
            <div className="publish-form-title-div">
              <input
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
                  Precio :
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
              <p>Tipo</p>
              <Dropdown
                options={CF.dropdownVariables.type}
                value={state.type}
                onChange={(e) => dispatch({ type: "field", field: "type", value: e.value })}
              />
            </div>
            <div className="publish-form-dropdown-type">
              <p>Estado</p>
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
            <h2 className="publish-candf-title">Ubicación</h2>
            {[
              { dispatchField: "addressLine", name: "Dirección" },
              { dispatchField: "neighborhood", name: "Barrio " },
              { dispatchField: "city", name: "Ciudad " },
              { dispatchField: "state", name: "Provincia" },
              { dispatchField: "country", name: "País" },
            ].map((fieldObj) => {
              return (
                <div className="publish-form-location-div" key={fieldObj.dispatchField}>
                  <label htmlFor={fieldObj.dispatchField} className="publish-form-location-label publish-form-label">
                    {fieldObj.name} :
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
              );
            })}
          </div>
          <div className="publish-form-char">
            <h2 className="publish-candf-title">Características y atributos</h2>
            {CF.characteristics.map((title) => {
              let formatTitle = CF.camelizeText(title);
              return (
                <div className="publish-form-char-div" key={formatTitle}>
                  <label className="publish-form-char-label" htmlFor={formatTitle}>
                    {title} :{" "}
                  </label>
                  <input
                    className="publish-form-input publish-form-char-input"
                    value={state.characteristics[formatTitle]}
                    onChange={(e) =>
                      dispatch({
                        type: "charact",
                        value: e.target.value,
                        field: formatTitle,
                      })
                    }
                    name={formatTitle}
                    type="text"
                  />
                </div>
              );
            })}
          </div>
          <div className="publish-form-att">
            {CF.attributes.map((title) => {
              let formatRef = CF.camelizeText(title);
              return (
                <div className="publish-form-att-div" key={formatRef}>
                  <label
                    onClick={(e) => {
                      dispatch({
                        type: "feature",
                        value: !state.attributes[formatRef],
                        field: formatRef,
                      });
                    }}
                    className="publish-form-att-label"
                    htmlFor={formatRef}
                  >
                    {title}
                  </label>
                  <input
                    className="publish-form-att-input"
                    onChange={(e) => {
                      dispatch({
                        type: "feature",
                        value: e.target.checked,
                        field: formatRef,
                      });
                    }}
                    name={formatRef}
                    type="checkbox"
                    checked={state.attributes[formatRef]}
                  />
                </div>
              );
            })}
          </div>
          <div className="publish-form-images-div">
            <h2 className="publish-form-images-title">Imagenes</h2>
            <div {...getRootProps({ className: "publish-form-images-dropzone" })}>
              <input {...getInputProps()} />
              <p>Arrastra las imagenes aqui, o has click para seleccionar los archivos</p>
            </div>
            <aside>
              <ul className="publish-form-images-ul">
                <p className="publish-form-images-display-info">display de imagenes</p>
                {CF.doImageList(state.images)}
              </ul>
            </aside>
          </div>
          <div>
            <input
              value={state.featured}
              onChange={(e) => dispatch({ type: "field", field: "featured", value: e.target.checked })}
              name="terms"
              type="checkbox"
            />
            <label htmlFor="terms">Propiedad destacada</label>
          </div>
          <div>
            <input name="terms" type="checkbox" />
            <label htmlFor="terms">Acepte los términos y condiciones antes de enviar la propiedad. (???)</label>
          </div>
          <button className="publish-form-submit" type="submit">
            Enviar Propiedad
          </button>
          <input type="file" name="asd" onChange={(e) => console.log(e.target.value)} />
        </form>
      </div>
    </div>
  );
};

export default Publicar;



