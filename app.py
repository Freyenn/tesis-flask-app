

from flask import Flask, render_template,request,flash, session,redirect
from flask_mysqldb import MySQL
from flask.json import jsonify
from flask_session import Session
import mysql.connector
#Funcion Para generar y checar hash de contraseña
from werkzeug.security import generate_password_hash as genph
from werkzeug.security import check_password_hash as checkph


app = Flask(__name__)
##Configuracion DB
#app.config['MYSQL_HOST']='localhost'
#app.config['MYSQL_USER']='root'
#app.config['MYSQL_PASSWORD']=''
#app.config['MYSQL_DB']='prueba1'


db = mysql.connector.connect(
   host="localhost",
   user="root",
   passwd="",
   database='prueba1'
)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
#Investigar para mantener sesion abierta aun que el navegador se cierre

Session(app)
mysql =MySQL(app)

# settings
app.secret_key = "mysecretkey"

@app.route("/")
def home():
    #Validación de sesion iniciada, si no se tiene sesion iniciada manda a iniciar sesion
    if "name" in session:
        return render_template("dashboard.html",message="Bienvenido %s"%session["name"],nivel=session["nivel"])
    return render_template("home.html")


@app.route("/login", methods=["POST"])
def login():
    if "name" in session:
        return redirect("/")

    if request.method == "POST":
        request_data = request.get_json()
        #Obtención y validación de usuario 
        cur = db.cursor()
        cur.execute("SELECT * FROM usuarios WHERE usuario = '%s'" %request_data.get('usuario'))
        data_u = cur.fetchall()
        #Si el usuario no se encuentra en la base de datos
        if len(data_u)==0:
            return jsonify({"respuesta":"Usuario Incorrecto"})
        #Si el usuario existe se evaluan las contraseñas a traves de hash
        db_usuario = data_u[0][2]
        db_hash = data_u[0][4]
        db_serial = data_u[0][5]
        db_nivel = data_u[0][6]
        if checkph(db_hash,request_data.get('contrasena')):
            session["name"]= db_usuario
            session["serial"] = db_serial
            session["nivel"] = db_nivel
            return jsonify({"respuesta":"Login Exitoso"})

        else:
            return jsonify({"respuesta":"Contrasena Incorrecta"})

@app.route("/logout")
def logut():
    #Si se encuentra una sesión activa se cierra
    if "name" in session:
        session.pop("name",None)
        return render_template("home.html")
    return redirect("/")

@app.route("/crear_cuenta")
def crear_cuenta():
    if "name" in session:
        return redirect("/")

    return render_template("crear_cuenta.html")

@app.route("/registro", methods=['POST'])
def registro():
    if "name" in session:
        return redirect("/")
    if request.method == 'POST':
        ##Se obtiene el JSON enviado
        request_data = request.get_json()
        nombre = request_data.get('nombre')
        usuario = request_data.get('usuario')
        correo = request_data.get('correo')
        contrasena = request_data.get('contrasena')
        serial = request_data.get('serial')
        #print(nombre,usuario,correo,contrasena,serial)

        hash_clave = genph(contrasena)

        #cur = mysql.connection.cursor()
        cur = db.cursor()
        cur.execute("SELECT * FROM usuarios WHERE correo = '%s'" %correo)
        data_c = cur.fetchall()
        cur.execute("SELECT * FROM usuarios WHERE usuario = '%s'" %usuario)
        data_u = cur.fetchall()
        cur.close()

        if len(data_c) != 0:
            return jsonify({"respuesta":"Correo Existente"})

        if len(data_u) != 0:
            return jsonify({"respuesta":"Usuario Existente"})

        else:
            #cur = mysql.connection.cursor()
            cur = db.cursor()
            cur.execute("INSERT INTO usuarios (nombre,usuario,correo,contrasena,serial) VALUES (%s,%s,%s,%s,%s)", (nombre, usuario, correo,hash_clave,serial))
            #mysql.connection.commit()
            cur.close()
            return jsonify({"respuesta":"Registro Exitoso"})


@app.route("/perfil")
def perfil():
    #Validación de sesion iniciada, si no se tiene sesion iniciada manda a iniciar sesion
    if "name" in session:
        #Se carga la pagina de perfil y se pasan los datos para mostrar
        return render_template("perfil.html",usuario="%s"%session["name"],dispositivo="%s"%session["serial"],nivel=session["nivel"])
    return redirect("/")   

@app.route("/admin", methods=['POST','GET'])
def admin():
    #Validación de sesion iniciada, si no se tiene sesion iniciada manda a iniciar sesion
    if "name" in session and session["nivel"] == 1:
        
        return render_template("add_disp.html",usuario="%s"%session["name"],dispositivo="%s"%session["serial"],nivel=session["nivel"])
    return redirect("/")  

@app.route("/add_disp", methods=['POST','GET'])
def agregar_disp():
    #Validación de sesion iniciada, si no se tiene sesion iniciada manda a iniciar sesion
    if "name" in session and session["nivel"] == 1:
        serial = request.form.get("serial")
        contrasena = request.form.get("contrasena")
        hash_clave = genph(contrasena)
        #cur = mysql.connection.cursor()
        cur = db.cursor()
        cur.execute("INSERT INTO dispositivos (serial,contrasena) VALUES (%s,%s)", (serial, hash_clave))
        
        cur.close()
        return render_template("add_disp.html",message="Agregado con Exito",usuario="%s"%session["name"],dispositivo="%s"%session["serial"],nivel=session["nivel"])
    return redirect("/") 

@app.route("/dashboard", methods=['POST'])       
def dashboard():
    #Validación de sesion iniciada, si no se tiene sesion iniciada manda a iniciar sesion
    if "name" in session:
        if request.method == 'POST':
            ph=[]
            ce=[]
            temperatura_a=[]
            humedad_a=[]
            temperatura_s=[]
            nivel_s=[]
            fecha=[]

            request_data = request.get_json()
            cantidad = request_data.get('cantidad')
            #cur = mysql.connection.cursor()
            cur = db.cursor()
            cur.execute("SELECT * FROM (SELECT * FROM `datos` WHERE serial = '%s' order by fecha desc LIMIT %s) t ORDER BY fecha asc"%(session["serial"],cantidad))
            #mysql.connection.commit()
        
            data_c = cur.fetchall()
            cur.close()

            for i in range(len(data_c)):
                ph.append(data_c[i][2])
                ce.append(data_c[i][3])
                temperatura_a.append(data_c[i][4])
                humedad_a.append(data_c[i][5])
                temperatura_s.append(data_c[i][6])
                nivel_s.append(data_c[i][7])
                fecha.append(data_c[i][8])

            return jsonify({"ph":ph,"ce":ce,"temperatura_a":temperatura_a,
                "humedad_a":humedad_a,"temperatura_s":temperatura_s,"nivel_s":nivel_s,"fecha":fecha})
       
        

@app.route("/prueba")
def prueba():
    try:
        serial = "a0002"
        contrasena="1234"
        #cur = mysql.connection.cursor()
        cur = db.cursor()
        cur.execute("SELECT * FROM dispositivos WHERE serial = '%s'" %serial)
        #mysql.connection.commit()
    
        data_c = cur.fetchall()
        cur.close()
        print(data_c[0][2])
        print(checkph(data_c[0][2],contrasena))
        
        return 'Si jalo'
    except:   
        return 'No jalo'

##Incio del servidor
if __name__ == '__main__':
    app.run(debug = True)   