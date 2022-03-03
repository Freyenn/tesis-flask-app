//Atencion a respuesta del servidor
function respuestaServidor(respuesta){
    if(respuesta=="Login Exitoso"){
        
            window.open("http://127.0.0.1:5000/", "_self");
        }
    if(respuesta=="Contrasena Incorrecta"){
        document.getElementById("alerta").innerHTML = "Contraseña Incorrecta";
    }
    if(respuesta=="Usuario Incorrecto"){
        document.getElementById("alerta").innerHTML = "Usuario Incorrecto";
    }

    
}
window.onload =  function () {
    txt_usuario = document.getElementById("usuario");
    txt_contra = document.getElementById("contra")
    btn_iniciar = document.getElementById("btn_iniciar");

    btn_iniciar.onclick = async function(){

        if(txt_usuario.value==0 || txt_contra.value == 0){
            alert("Usuario y Contraseña requeridos")
        }else{
            // Proceso de encoding para datos
            var datos = {
                usuario: txt_usuario.value,
                contrasena: txt_contra.value,
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
            url = "/login";
            //Conexión http a traves de fetch
            let response = await fetch(url, init);

            //Se espera la respuesta del servidor y se almacena en data; se recibe un JSON
            data = await response.json();  
            respuesta= data.respuesta;
            respuestaServidor(respuesta);

        }





        /* window.open("http://127.0.0.1:5000/dashboard", "_self"); */
    }


}