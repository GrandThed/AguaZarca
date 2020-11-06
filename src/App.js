import React from 'react'
import {BrowserRouter  as Router, Route} from 'react-router-dom'


import {Menu} from './components/menu/menu'
import AlquilerAnual from './components/routes/alquiler-anual/AlquilerAnual'
import AlquilerTemporal from './components/routes/alquiler-temporal/AlquilerTemporal'
import Contacto from './components/routes/contacto/Contacto'
import Home from './components/routes/home/Home'
import Noticias from './components/routes/noticias/Noticias'
import Publicar from './components/routes/publicar/Publicar'
import Venta from './components/routes/venta/Venta'
import Footer from './components/footer/Footer'

const App = () =>{
  return (
    <div className="App">
      <Router>
        <Menu />
        <Route path="/AguaZarca/" exact component={Home}></Route>
        <Route path="/AguaZarca/venta" component={Venta}></Route>
        <Route path="/AguaZarca/alquiler-temporario" component={AlquilerTemporal}></Route>
        <Route path="/AguaZarca/alquiler-anual" component={AlquilerAnual}></Route>
        <Route path="/AguaZarca/noticias" component={Noticias}></Route>
        <Route path="/AguaZarca/contacto" component={Contacto}></Route>
        <Route path="/AguaZarca/publicar-propiedad" component={Publicar}></Route>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
