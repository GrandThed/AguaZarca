const prefix = ""

export const HOME = prefix + "/"
export const VENTA = prefix + "/venta"
export const ALQUILER_TEMPORAL = prefix + "/alquiler-temporario"
export const ALQUILER_ANUAL = prefix + "/alquiler-anual"
export const NOTICIAS = prefix + "/noticias"
export const CONTACTO = prefix + "/contacto"
export const PUBLICAR = prefix + "/publicar-propiedad"
export const PROPIEDAD = prefix + "/producto/"
export const PRODUCTO = prefix + "/producto/:id"  //reminder: change the name of the routes
export const TIPO_DE_PROPIEDAD_SIMPLE_URL = prefix + "/tipo/"
export const TIPO_DE_PROPIEDAD = prefix + "/tipo/:type"
export const BUSQUEDA_GLOBAL = prefix + "/busqueda"
export const DASHBOARD = prefix + "/dashboard/"
export const REGISTRO = prefix + process.env.REACT_APP_SUPERSECRETEREGISTERROUTE

export const BLOGS = prefix + "/blog"
export const BLOG_CREATE = prefix + "/dashboard/crear-blog"

export const EDITAR_PROPIEDAD = prefix + "/dashboard/editar-propiedad/:id"

 