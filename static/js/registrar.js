//Variables globales en JS(similar a un self de python)
window.vpass = false;
window.vpass1 = false;
window.vemail = false;
window.vemail1 = false;
window.vserial = false;
window.r_servidor = "";


//Funcion encargada de generar un delay entrada en ms
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//Validar que el correo ingresado es un correo
function validarEmail(elemento) {
    var texto = document.getElementById(elemento.id).value;
    var regex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;

    if (!regex.test(texto)) {
        window.vemail1 = false;
        document.getElementById("resultado-correo").innerHTML = " Invalido";
    } else {
        window.vemail1 = true;
        document.getElementById("resultado-correo").innerHTML = " ✓";
        
    }

}

//Validar que la contraseña tenga el tamaño y formato correcto
function validarContra(elemento){
    var espacios = false;
    var cont = 0;
    var p1 = document.getElementById("contrasena").value;
    while (!espacios && (cont < p1.length)) {
      if (p1.charAt(cont) == " ")
        espacios = true;
      cont++;
    }
       
    if (espacios) {
      document.getElementById("resultado-contrasena").innerHTML = " ";
      alert ("La contraseña no puede contener espacios en blanco");
      return false;
    }else{
        
        if(p1.length <=6 ){
            window.vpass1 = false;
            document.getElementById("resultado-contrasena").innerHTML = " Min 6 Caracteres";
        }
        else{
            window.vpass1 = true;
            document.getElementById("resultado-contrasena").innerHTML = " ✓";}} 
}



//Atencion a respuesta del servidor
function respuestaServidor(respuesta){
    if(respuesta=="Correo Existente"){
        document.getElementById("resultado-correo").innerHTML = " Existente"
        
        }

    if(respuesta=="Usuario Existente"){
        document.getElementById("resultado-usuario").innerHTML = " Existente"
        
        }


    if(respuesta=="Registro Exitoso"){
        
        if(confirm("Registro Exitoso. ¿Desea iniciar Sesión?")==true){
            window.open("http://127.0.0.1:5000/", "_self");
        }
    }
}


/////////////////////////////////////////////Funciones onload/////////////////////////////////////////////////////////////////////////


window.onload = function () {

    btn_crear = document.getElementById("btn_crear");

    txt_nombre = document.getElementById("nombre");
    txt_usuario = document.getElementById("usuario");
    txt_correo = document.getElementById("email");
    txt_c_correo = document.getElementById("c-email");
    txt_contrasena = document.getElementById("contrasena");
    txt_c_contrasena = document.getElementById("c-contrasena");
    txt_serial = document.getElementById("serial");
    txt_c_serial = document.getElementById("c-serial");
    
//Validar que los correos escritos son iguales    
    txt_c_correo.addEventListener('input',validar_correo);
    function validar_correo(e) {
        if (txt_c_correo.value == txt_correo.value){
            txt_c_correo.style.color="green"
            document.getElementById("resultado-c-correo").innerHTML = " ✓";
            window.vemail = true;
        }
        else{
            txt_c_correo.style.color="black"
            document.getElementById("resultado-c-correo").innerHTML = "";
            window.vemail = false;
        }
    }
//Validar que las contraseñas escritas son iguales   
    txt_c_contrasena.addEventListener('input',validar_contrasena);
    function validar_contrasena(e) {
        if (txt_c_contrasena.value == txt_contrasena.value){
            txt_c_contrasena.style.color="green"
              document.getElementById("resultado-c-contrasena").innerHTML = " ✓";
              window.vpass = true;
        }
        else{
            txt_c_contrasena.style.color="black"
            document.getElementById("resultado-c-contrasena").innerHTML = " ";
            window.vpass = false;
        }
    }  

//Validar que los seriales sean iguales  
    txt_c_serial.addEventListener('input',validar_serial);
    function validar_serial(e) {
        if (txt_c_serial.value == txt_serial.value){
            txt_c_serial.style.color="green"
            document.getElementById("resultado-serial").innerHTML = " ✓";
            window.vserial = true;
        }
        else{
            txt_c_serial.style.color="black"
            document.getElementById("resultado-serial").innerHTML = " ";
            window.vserial = false;
        }
    } 
    

    btn_crear.onclick = async function () {
       // Preguntar por entradas vacías 
        if (txt_nombre.value == 0 
        || txt_usuario.value == 0 
        || txt_correo.value == 0 || txt_c_correo.value == 0 || txt_contrasena.value == 0 || txt_c_contrasena.value == 0
        || txt_serial.value == 0 || txt_c_serial.value == 0) 
        {
        alert("Faltan llenar algunos campos")
        } 
        else{
            if(window.vserial == false || window.vemail == false || window.vpass == false){
                alert("Valida los datos") 
            }
            else{
                if( window.vemail1 == false || window.vpass1 == false){
                    alert("Correo o contraseña no validos, verifica que sean correctos") 
                }else{
                   
                    // Proceso de encoding para datos
                    var datos = {
                        nombre: txt_nombre.value,
                        usuario: txt_usuario.value,
                        correo: txt_correo.value,
                        contrasena: txt_contrasena.value,
                        serial : txt_serial.value,
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
                    url = "/registro";
                    //Conexión http a traves de fetch
                    let response = await fetch(url, init);

                    //Se espera la respuesta del servidor y se almacena en data; se recibe un JSON
                    data = await response.json();  
                    respuesta= data.respuesta;
                    respuestaServidor(respuesta);
                    


                
                }
            }
            
        }

    }
}