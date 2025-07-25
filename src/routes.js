const prefix = "";

export const HOME = prefix + "/";
export const VENTA = prefix + "/venta";
export const ALQUILER_TEMPORAL = prefix + "/alquiler-temporario";
export const ALQUILER_ANUAL = prefix + "/alquiler-anual";
export const NOTICIAS = prefix + "/noticias";
export const CONTACTO = prefix + "/contacto";
export const PUBLICAR = prefix + "/publicar-propiedad";
export const PROPIEDAD = prefix + "/propiedad/";
export const PRODUCTO = prefix + "/propiedad/:id/:slug?"; // Support both old and new URL formats
export const TIPO_DE_PROPIEDAD_SIMPLE_URL = prefix + "/tipo/";
export const TIPO_DE_PROPIEDAD = prefix + "/tipo/:type";
export const BUSQUEDA_GLOBAL = prefix + "/busqueda";
export const BLOG_CREATE = prefix + "/crear-blog";
export const BLOG_EDIT = prefix + "/editar-blog/:id";

export const BLOG_VIEW = prefix + "/blog/:slug";

export const EDITAR_PROPIEDAD = prefix + "/editar-propiedad/:id";
export const DASHBOARD = prefix + "/dashboard/";
export const REGISTRO = prefix + process.env.REACT_APP_SUPERSECRETEREGISTERROUTE;
export const BLOGS = prefix + "/blog";
