
//Funcion encargada de generar un delay entrada en ms
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

loop = async function(){
  while (true){
    cantidad = combo.options[combo.selectedIndex].text;
    var datos = {
      mensaje: "Actualiza Datos",
      cantidad:cantidad

    };
    var init = {
      // el método de envío de la información será POST
      method: "POST",
      headers: {
        // cabeceras HTTP
        // vamos a enviar los datos en formato JSON
        "Content-Type": "application/json",
      },
      // el cuerpo de la petición es una cadena de texto
      // con los datos en formato JSON
      body: JSON.stringify(datos), // convertimos el objeto a texto
    };
    //url la ruta en la que se realizara la peticion POST
    url = "/dashboard";
    //Conexión http a traves de fetch
    let response = await fetch(url, init);

    //Se espera la respuesta del servidor y se almacena en data; se recibe un JSON
    datos = await response.json();
    //Se recuperan los valores enviados por el servidor
    ph=datos.ph;
    ce=datos.ce;
    temperatura_a=datos.temperatura_a;
    humedad_a=datos.humedad_a;
    temperatura_s=datos.temperatura_s;
    nivel_s=datos.nivel_s;
    fecha=datos.fecha;

    
    actualizarGrafica(ph,fecha,"pH",ph_graf);
    actualizarGrafica(ce,fecha,"CE",ec_graf);
    actualizarGrafica(temperatura_a,fecha,"Temperatura ambiental",temperatura_a_graf);
    actualizarGrafica(humedad_a,fecha,"Humedad ambiental",humedad_a_graf);
    actualizarGrafica(temperatura_s,fecha,"Temperatura Solución",temperatura_sol_graf);
    actualizarGrafica(nivel_s,fecha,"Nivel de Solución",nivel_sol_graf);
    
    
    //Se genera un delay de 200ms entre cada iteración
    await delay(5000);
  }
}

function actualizarGrafica(dato,fecha,nombre,grafica){
  grafica.updateOptions({
    series:[{
      name:nombre,
      data:dato
    }],
    xaxis: {
      type: 'datetime',
      categories: fecha
    }
  })
  
}

function crearGrafica(nombre){
  
  var options = {
      series: [],
      chart: {
      height: 350,
      type: 'area'
    },
    dataLabels: {
      enabled: true
    },
    title:{
      text:nombre
    },
    stroke: {
      curve: 'smooth'
    },
    xaxis: {
      type: 'datetime',
    },
    noData: {
      text: 'Loading...'
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm'
      },
    },
  };

  var chart = new ApexCharts(document.querySelector("#"+nombre+"-chart"), options);
  chart.render();
  return chart;
}


window.onload = function (){
  ph_graf= crearGrafica('ph');
  ec_graf= crearGrafica('ec');
  temperatura_a_graf= crearGrafica('temperatura-a');
  humedad_a_graf= crearGrafica('humedad-a');
  temperatura_sol_graf= crearGrafica('temperatura-sol');
  nivel_sol_graf= crearGrafica('nivel-sol');

  combo = document.getElementById("cantidad");
  

  loop();
    


}