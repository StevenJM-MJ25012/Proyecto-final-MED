//  SIMULACION CONCEPTUAL: ARBOL B+ PARA UN MINI SISTEMA DE ARCHIVOS
//  Opcion C - Manejo de Estructura de Datos
//
//  Orden del arbol: m = 4   ->   maximo 3 claves y 4 hijos por nodo
//  Minimo de claves por nodo (no raiz): 1
//
//  El arbol se representa con arreglos paralelos que funcionan como una
//  "memoria" de nodos (un nodo = una posicion de los arreglos). Cada nodo
//  guarda: cuantas claves tiene, sus claves, si es hoja, sus hijos (indices
//  a otros nodos) y, si es hoja, el indice de la hoja siguiente (lista
//  enlazada propia del Arbol B+, usada para recorrer todos los archivos en
//  orden sin volver a subir por el arbol).

Proceso SimulacionArbolBMas
	
    Definir MAX_NODOS, MAX_CLAVES, MAX_HIJOS, MIN_CLAVES Como Entero
    MAX_NODOS  <- 30
    MAX_CLAVES <- 3
    MAX_HIJOS  <- 4
    MIN_CLAVES <- 1
	
    // ---- "Memoria" del arbol (arreglos = pool de nodos) ----
    Definir numClaves Como Entero
    Dimension numClaves[30]
    Definir claves Como Cadena
    Dimension claves[30,4]
    Definir hijos Como Entero
    Dimension hijos[30,5]
    Definir esHoja Como Logico
    Dimension esHoja[30]
    Definir siguienteHoja Como Entero
    Dimension siguienteHoja[30]
    Definir enUso Como Logico
    Dimension enUso[30]
	
    Definir nodoRaiz Como Entero
    Definir i Como Entero
    Definir encontrada Como Logico
	
    Para i <- 1 Hasta MAX_NODOS Hacer
        enUso[i] <- Falso
    FinPara
	
    // El arbol arranca con una unica hoja vacia que actua como raiz
    nodoRaiz <- CrearNodo(enUso, esHoja, numClaves, siguienteHoja, hijos, MAX_NODOS, MAX_HIJOS, Verdadero)
	
    Escribir "===================================================="
    Escribir " SIMULACION: insercion de 6 archivos (orden m = 4)"
    Escribir "===================================================="
	
    // ---- Misma secuencia usada en el informe tecnico (seccion 2) ----
    Insertar(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, nodoRaiz, MAX_CLAVES, MAX_HIJOS, MAX_NODOS, "main.py")
    Insertar(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, nodoRaiz, MAX_CLAVES, MAX_HIJOS, MAX_NODOS, "utils.py")
    Insertar(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, nodoRaiz, MAX_CLAVES, MAX_HIJOS, MAX_NODOS, "config.json")
    Insertar(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, nodoRaiz, MAX_CLAVES, MAX_HIJOS, MAX_NODOS, "index.html")   // provoca division de la hoja raiz
    Insertar(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, nodoRaiz, MAX_CLAVES, MAX_HIJOS, MAX_NODOS, "readme.md")
    Insertar(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, nodoRaiz, MAX_CLAVES, MAX_HIJOS, MAX_NODOS, "app.js")
	
    Escribir ""
    Escribir "---- Busquedas ----"
	
    encontrada <- Buscar(claves, hijos, numClaves, esHoja, nodoRaiz, MAX_CLAVES, MAX_HIJOS, "config.json")
    Si encontrada Entonces
        Escribir "config.json -> SI existe en el sistema de archivos"
    SiNo
        Escribir "config.json -> NO existe en el sistema de archivos"
    FinSi
	
    encontrada <- Buscar(claves, hijos, numClaves, esHoja, nodoRaiz, MAX_CLAVES, MAX_HIJOS, "audio.mp3")
    Si encontrada Entonces
        Escribir "audio.mp3 -> SI existe en el sistema de archivos"
    SiNo
        Escribir "audio.mp3 -> NO existe en el sistema de archivos"
    FinSi
	
    Escribir ""
    Escribir "---- Eliminaciones (la ultima provoca un prestamo entre hojas) ----"
	
    Eliminar(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, nodoRaiz, MAX_CLAVES, MIN_CLAVES, MAX_HIJOS, MAX_NODOS, "main.py")
    Eliminar(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, nodoRaiz, MAX_CLAVES, MIN_CLAVES, MAX_HIJOS, MAX_NODOS, "utils.py")
    Eliminar(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, nodoRaiz, MAX_CLAVES, MIN_CLAVES, MAX_HIJOS, MAX_NODOS, "readme.md")
    Eliminar(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, nodoRaiz, MAX_CLAVES, MIN_CLAVES, MAX_HIJOS, MAX_NODOS, "app.js")
	
    Escribir ""
    Escribir "Simulacion finalizada. Claves restantes en la raiz: " , numClaves[nodoRaiz]
	
FinProceso


//  CrearNodo: reserva la primera posicion libre del pool y la inicializa
Funcion indice <- CrearNodo(enUso Por Referencia, esHoja Por Referencia, numClaves Por Referencia, siguienteHoja Por Referencia, hijos Por Referencia, MAX_NODOS Por Valor, MAX_HIJOS Por Valor, hoja Por Valor)
	
    Definir i, j Como Entero
    Definir libre Como Logico
	
    libre <- Falso
    i <- 1
    Mientras i <= MAX_NODOS Y NO libre Hacer
        Si NO enUso[i] Entonces
            libre <- Verdadero
            indice <- i
        FinSi
        i <- i + 1
    FinMientras
	
    enUso[indice]         <- Verdadero
    esHoja[indice]        <- hoja
    numClaves[indice]     <- 0
    siguienteHoja[indice] <- 0
    Para j <- 1 Hasta MAX_HIJOS Hacer
        hijos[indice, j] <- 0
    FinPara
	
FinFuncion


//  Buscar: desciende desde un nodo comparando la clave con las claves guia
//  hasta llegar a la hoja correcta, donde confirma si la clave existe.
Funcion encontrada <- Buscar(claves Por Referencia, hijos Por Referencia, numClaves Por Referencia, esHoja Por Referencia, nodo Por Valor, MAX_CLAVES Por Valor, MAX_HIJOS Por Valor, clave Por Valor)
	
    Definir i, hijoElegido Como Entero
	
    Si esHoja[nodo] Entonces
        encontrada <- Falso
        Para i <- 1 Hasta numClaves[nodo] Hacer
            Si claves[nodo, i] = clave Entonces
                encontrada <- Verdadero
            FinSi
        FinPara
    SiNo
        hijoElegido <- 1
        Mientras hijoElegido <= numClaves[nodo] Y clave >= claves[nodo, hijoElegido] Hacer
            hijoElegido <- hijoElegido + 1
        FinMientras
        encontrada <- Buscar(claves, hijos, numClaves, esHoja, hijos[nodo, hijoElegido], MAX_CLAVES, MAX_HIJOS, clave)
    FinSi
	
FinFuncion


//  Insertar: punto de entrada publico. Inserta la clave de forma recursiva
//  y, si la raiz se divide, crea una nueva raiz (el arbol crece en altura).
SubProceso Insertar(claves Por Referencia, hijos Por Referencia, numClaves Por Referencia, esHoja Por Referencia, siguienteHoja Por Referencia, enUso Por Referencia, nodoRaiz Por Referencia, MAX_CLAVES Por Valor, MAX_HIJOS Por Valor, MAX_NODOS Por Valor, clave Por Valor)
	
    Definir subio Como Logico
    Definir claveSubida Como Cadena
    Definir nuevoHijoDer, nuevaRaiz Como Entero
	
    subio <- InsertarEnNodo(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, MAX_CLAVES, MAX_HIJOS, MAX_NODOS, nodoRaiz, clave, claveSubida, nuevoHijoDer)
	
    Si subio Entonces
        nuevaRaiz <- CrearNodo(enUso, esHoja, numClaves, siguienteHoja, hijos, MAX_NODOS, MAX_HIJOS, Falso)
        claves[nuevaRaiz, 1] <- claveSubida
        numClaves[nuevaRaiz] <- 1
        hijos[nuevaRaiz, 1]  <- nodoRaiz
        hijos[nuevaRaiz, 2]  <- nuevoHijoDer
        nodoRaiz <- nuevaRaiz
    FinSi
	
FinSubProceso


//  InsertarEnNodo: insercion recursiva. Devuelve Verdadero si el nodo se
//  dividio, y en ese caso entrega (por referencia) la clave que sube al
//  padre y el indice del nuevo nodo hermano derecho.
Funcion subio <- InsertarEnNodo(claves Por Referencia, hijos Por Referencia, numClaves Por Referencia, esHoja Por Referencia, siguienteHoja Por Referencia, enUso Por Referencia, MAX_CLAVES Por Valor, MAX_HIJOS Por Valor, MAX_NODOS Por Valor, nodo Por Valor, clave Por Valor, claveSubida Por Referencia, nuevoHijoDer Por Referencia)
	
    Definir pos, hijoElegido Como Entero
    Definir subioHijo Como Logico
    Definir claveHijo Como Cadena
    Definir hijoDerHijo Como Entero
	
    subio <- Falso
	
    Si esHoja[nodo] Entonces
		
        // ---- Caso base: insertar ordenado dentro de la hoja ----
        pos <- numClaves[nodo] + 1
        Mientras pos > 1 Y claves[nodo, pos - 1] > clave Hacer
            claves[nodo, pos] <- claves[nodo, pos - 1]
            pos <- pos - 1
        FinMientras
        claves[nodo, pos] <- clave
        numClaves[nodo] <- numClaves[nodo] + 1
		
        Si numClaves[nodo] > MAX_CLAVES Entonces
            DividirHoja(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, MAX_CLAVES, MAX_HIJOS, MAX_NODOS, nodo, claveSubida, nuevoHijoDer)
            subio <- Verdadero
        FinSi
		
    SiNo
		
        // ---- Caso recursivo: bajar por el hijo correcto ----
        hijoElegido <- 1
        Mientras hijoElegido <= numClaves[nodo] Y clave >= claves[nodo, hijoElegido] Hacer
            hijoElegido <- hijoElegido + 1
        FinMientras
		
        subioHijo <- InsertarEnNodo(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, MAX_CLAVES, MAX_HIJOS, MAX_NODOS, hijos[nodo, hijoElegido], clave, claveHijo, hijoDerHijo)
		
        Si subioHijo Entonces
            // Abrir espacio e insertar la clave promovida y el nuevo hijo derecho
            pos <- numClaves[nodo] + 1
            Mientras pos > hijoElegido Hacer
                claves[nodo, pos]     <- claves[nodo, pos - 1]
                hijos[nodo, pos + 1]  <- hijos[nodo, pos]
                pos <- pos - 1
            FinMientras
            claves[nodo, hijoElegido]    <- claveHijo
            hijos[nodo, hijoElegido + 1] <- hijoDerHijo
            numClaves[nodo] <- numClaves[nodo] + 1
			
            Si numClaves[nodo] > MAX_CLAVES Entonces
                DividirInterno(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, MAX_CLAVES, MAX_HIJOS, MAX_NODOS, nodo, claveSubida, nuevoHijoDer)
                subio <- Verdadero
            FinSi
        FinSi
		
    FinSi
	
FinFuncion


//  DividirHoja: reparte las claves de una hoja desbordada entre la hoja
//  original y una nueva hoja derecha, y mantiene el enlace "siguiente"
//  entre hojas. La clave que sube al padre es una COPIA de la primera
//  clave de la hoja derecha (caracteristica propia del Arbol B+).
SubProceso DividirHoja(claves Por Referencia, hijos Por Referencia, numClaves Por Referencia, esHoja Por Referencia, siguienteHoja Por Referencia, enUso Por Referencia, MAX_CLAVES Por Valor, MAX_HIJOS Por Valor, MAX_NODOS Por Valor, nodo Por Valor, claveSubida Por Referencia, nuevoNodo Por Referencia)
	
    Definir mitad, i, j Como Entero
	
    nuevoNodo <- CrearNodo(enUso, esHoja, numClaves, siguienteHoja, hijos, MAX_NODOS, MAX_HIJOS, Verdadero)
    mitad <- (MAX_CLAVES + 1) / 2          // con MAX_CLAVES = 3 -> mitad = 2
	
    j <- 1
    Para i <- mitad + 1 Hasta numClaves[nodo] Hacer
        claves[nuevoNodo, j] <- claves[nodo, i]
        j <- j + 1
    FinPara
    numClaves[nuevoNodo] <- numClaves[nodo] - mitad
    numClaves[nodo]      <- mitad
	
    siguienteHoja[nuevoNodo] <- siguienteHoja[nodo]
    siguienteHoja[nodo]      <- nuevoNodo
	
    claveSubida <- claves[nuevoNodo, 1]
	
FinSubProceso


//  DividirInterno: reparte claves e hijos de un nodo interno desbordado.
//  A diferencia de la hoja, aqui la clave central SUBE (no se copia).
SubProceso DividirInterno(claves Por Referencia, hijos Por Referencia, numClaves Por Referencia, esHoja Por Referencia, siguienteHoja Por Referencia, enUso Por Referencia, MAX_CLAVES Por Valor, MAX_HIJOS Por Valor, MAX_NODOS Por Valor, nodo Por Valor, claveSubida Por Referencia, nuevoNodo Por Referencia)
	
    Definir mitad, i, j Como Entero
	
    nuevoNodo <- CrearNodo(enUso, esHoja, numClaves, siguienteHoja, hijos, MAX_NODOS, MAX_HIJOS, Falso)
    mitad <- (MAX_CLAVES + 1) / 2          // = 2 con MAX_CLAVES = 3
	
    claveSubida <- claves[nodo, mitad]
	
    j <- 1
    Para i <- mitad + 1 Hasta numClaves[nodo] Hacer
        claves[nuevoNodo, j] <- claves[nodo, i]
        j <- j + 1
    FinPara
	
    j <- 1
    Para i <- mitad + 1 Hasta numClaves[nodo] + 1 Hacer
        hijos[nuevoNodo, j] <- hijos[nodo, i]
        j <- j + 1
    FinPara
	
    numClaves[nuevoNodo] <- numClaves[nodo] - mitad
    numClaves[nodo]      <- mitad - 1
	
FinSubProceso

//  Eliminar: punto de entrada publico. Elimina la clave de forma recursiva
//  y, si la raiz interna se queda sin claves, baja la altura del arbol.
SubProceso Eliminar(claves Por Referencia, hijos Por Referencia, numClaves Por Referencia, esHoja Por Referencia, siguienteHoja Por Referencia, enUso Por Referencia, nodoRaiz Por Referencia, MAX_CLAVES Por Valor, MIN_CLAVES Por Valor, MAX_HIJOS Por Valor, MAX_NODOS Por Valor, clave Por Valor)
	
    EliminarEnNodo(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, MAX_CLAVES, MIN_CLAVES, MAX_HIJOS, MAX_NODOS, nodoRaiz, clave)
	
    Si NO esHoja[nodoRaiz] Y numClaves[nodoRaiz] = 0 Entonces
        enUso[nodoRaiz] <- Falso
        nodoRaiz <- hijos[nodoRaiz, 1]
    FinSi
	
FinSubProceso

//  EliminarEnNodo: eliminacion recursiva. Al volver de la recursion, revisa
//  si el hijo visitado quedo por debajo del minimo y, de ser asi, corrige
//  el descalce (prestamo o fusion) antes de continuar subiendo
SubProceso EliminarEnNodo(claves Por Referencia, hijos Por Referencia, numClaves Por Referencia, esHoja Por Referencia, siguienteHoja Por Referencia, enUso Por Referencia, MAX_CLAVES Por Valor, MIN_CLAVES Por Valor, MAX_HIJOS Por Valor, MAX_NODOS Por Valor, nodo Por Valor, clave Por Valor)
	
    Definir i, pos, hijoElegido Como Entero
	
    Si esHoja[nodo] Entonces
		
        pos <- 0
        Para i <- 1 Hasta numClaves[nodo] Hacer
            Si claves[nodo, i] = clave Entonces
                pos <- i
            FinSi
        FinPara
		
        Si pos > 0 Entonces
            Para i <- pos Hasta numClaves[nodo] - 1 Hacer
                claves[nodo, i] <- claves[nodo, i + 1]
            FinPara
            numClaves[nodo] <- numClaves[nodo] - 1
        FinSi
		
    SiNo
		
        hijoElegido <- 1
        Mientras hijoElegido <= numClaves[nodo] Y clave >= claves[nodo, hijoElegido] Hacer
            hijoElegido <- hijoElegido + 1
        FinMientras
		
        EliminarEnNodo(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, MAX_CLAVES, MIN_CLAVES, MAX_HIJOS, MAX_NODOS, hijos[nodo, hijoElegido], clave)
		
        Si numClaves[hijos[nodo, hijoElegido]] < MIN_CLAVES Entonces
            CorregirDescalce(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, MAX_CLAVES, MIN_CLAVES, MAX_HIJOS, MAX_NODOS, nodo, hijoElegido)
        FinSi
		
    FinSi
	
FinSubProceso


//  CorregirDescalce: decide como resolver un nodo con menos claves que el
//  minimo permitido. Orden de preferencia: 1) prestar del hermano izquierdo,
//  2) prestar del hermano derecho, 3) fusionar con un hermano.
SubProceso CorregirDescalce(claves Por Referencia, hijos Por Referencia, numClaves Por Referencia, esHoja Por Referencia, siguienteHoja Por Referencia, enUso Por Referencia, MAX_CLAVES Por Valor, MIN_CLAVES Por Valor, MAX_HIJOS Por Valor, MAX_NODOS Por Valor, padre Por Valor, posHijo Por Valor)
	
    Definir hijoActual, hermanoIzq, hermanoDer Como Entero
	
    hijoActual <- hijos[padre, posHijo]
	
    Si posHijo > 1 Entonces
        hermanoIzq <- hijos[padre, posHijo - 1]
    SiNo
        hermanoIzq <- 0
    FinSi
	
    Si posHijo < numClaves[padre] + 1 Entonces
        hermanoDer <- hijos[padre, posHijo + 1]
    SiNo
        hermanoDer <- 0
    FinSi
	
    Si hermanoIzq <> 0 Y numClaves[hermanoIzq] > MIN_CLAVES Entonces
		
        PrestarDeIzquierda(claves, hijos, numClaves, esHoja, padre, posHijo, hermanoIzq, hijoActual)
		
    SiNo
		
        Si hermanoDer <> 0 Y numClaves[hermanoDer] > MIN_CLAVES Entonces
			
            PrestarDeDerecha(claves, hijos, numClaves, esHoja, padre, posHijo, hermanoDer, hijoActual)
			
        SiNo
			
            Si hermanoIzq <> 0 Entonces
                Fusionar(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, padre, posHijo - 1, hermanoIzq, hijoActual)
            SiNo
                Fusionar(claves, hijos, numClaves, esHoja, siguienteHoja, enUso, padre, posHijo, hijoActual, hermanoDer)
            FinSi
			
        FinSi
		
    FinSi
	
FinSubProceso


//  PrestarDeIzquierda: el nodo con deficit toma una clave del hermano
//  izquierdo (que tiene de sobra) y se actualiza la clave guia del padre.
SubProceso PrestarDeIzquierda(claves Por Referencia, hijos Por Referencia, numClaves Por Referencia, esHoja Por Referencia, padre Por Valor, posHijo Por Valor, hermanoIzq Por Valor, hijoActual Por Valor)
	
    Definir i Como Entero
	
    Para i <- numClaves[hijoActual] Hasta 1 Con Paso -1 Hacer
        claves[hijoActual, i + 1] <- claves[hijoActual, i]
    FinPara
	
    Si esHoja[hijoActual] Entonces
		
        // Hoja: se mueve directamente la ultima clave del hermano izquierdo
        claves[hijoActual, 1] <- claves[hermanoIzq, numClaves[hermanoIzq]]
        numClaves[hijoActual] <- numClaves[hijoActual] + 1
        numClaves[hermanoIzq] <- numClaves[hermanoIzq] - 1
        claves[padre, posHijo - 1] <- claves[hijoActual, 1]
		
    SiNo
		
        // Nodo interno: la clave del padre baja; la ultima clave del hermano sube
        claves[hijoActual, 1]      <- claves[padre, posHijo - 1]
        claves[padre, posHijo - 1] <- claves[hermanoIzq, numClaves[hermanoIzq]]
        numClaves[hijoActual] <- numClaves[hijoActual] + 1
		
        Para i <- numClaves[hijoActual] Hasta 1 Con Paso -1 Hacer
            hijos[hijoActual, i + 1] <- hijos[hijoActual, i]
        FinPara
        hijos[hijoActual, 1] <- hijos[hermanoIzq, numClaves[hermanoIzq] + 1]
        numClaves[hermanoIzq] <- numClaves[hermanoIzq] - 1
		
    FinSi
	
FinSubProceso


//  PrestarDeDerecha: analogo al anterior, tomando una clave del hermano
//  derecho.
SubProceso PrestarDeDerecha(claves Por Referencia, hijos Por Referencia, numClaves Por Referencia, esHoja Por Referencia, padre Por Valor, posHijo Por Valor, hermanoDer Por Valor, hijoActual Por Valor)
	
    Definir i Como Entero
	
    Si esHoja[hijoActual] Entonces
		
        claves[hijoActual, numClaves[hijoActual] + 1] <- claves[hermanoDer, 1]
        numClaves[hijoActual] <- numClaves[hijoActual] + 1
		
        Para i <- 1 Hasta numClaves[hermanoDer] - 1 Hacer
            claves[hermanoDer, i] <- claves[hermanoDer, i + 1]
        FinPara
        numClaves[hermanoDer] <- numClaves[hermanoDer] - 1
        claves[padre, posHijo] <- claves[hermanoDer, 1]
		
    SiNo
		
        claves[hijoActual, numClaves[hijoActual] + 1] <- claves[padre, posHijo]
        claves[padre, posHijo] <- claves[hermanoDer, 1]
        hijos[hijoActual, numClaves[hijoActual] + 2] <- hijos[hermanoDer, 1]
        numClaves[hijoActual] <- numClaves[hijoActual] + 1
		
        Para i <- 1 Hasta numClaves[hermanoDer] - 1 Hacer
            claves[hermanoDer, i] <- claves[hermanoDer, i + 1]
        FinPara
        Para i <- 1 Hasta numClaves[hermanoDer] Hacer
            hijos[hermanoDer, i] <- hijos[hermanoDer, i + 1]
        FinPara
        numClaves[hermanoDer] <- numClaves[hermanoDer] - 1
		
    FinSi
	
FinSubProceso


//  Fusionar: cuando ningun hermano tiene claves de sobra, el nodo "izquierdo"
//  absorbe al nodo "derecho" (y, si son internos, tambien baja la clave
//  separadora del padre). Despues se elimina esa clave y el puntero al hijo
//  derecho en el padre.
SubProceso Fusionar(claves Por Referencia, hijos Por Referencia, numClaves Por Referencia, esHoja Por Referencia, siguienteHoja Por Referencia, enUso Por Referencia, padre Por Valor, posIzq Por Valor, izquierdo Por Valor, derecho Por Valor)
	
    Definir i, base Como Entero
	
    Si esHoja[izquierdo] Entonces
		
        base <- numClaves[izquierdo]
        Para i <- 1 Hasta numClaves[derecho] Hacer
            claves[izquierdo, base + i] <- claves[derecho, i]
        FinPara
        numClaves[izquierdo] <- numClaves[izquierdo] + numClaves[derecho]
        siguienteHoja[izquierdo] <- siguienteHoja[derecho]
		
    SiNo
		
        base <- numClaves[izquierdo]
        claves[izquierdo, base + 1] <- claves[padre, posIzq]
        Para i <- 1 Hasta numClaves[derecho] Hacer
            claves[izquierdo, base + 1 + i] <- claves[derecho, i]
        FinPara
        Para i <- 1 Hasta numClaves[derecho] + 1 Hacer
            hijos[izquierdo, base + 1 + i] <- hijos[derecho, i]
        FinPara
        numClaves[izquierdo] <- numClaves[izquierdo] + numClaves[derecho] + 1
		
    FinSi
	
    Para i <- posIzq Hasta numClaves[padre] - 1 Hacer
        claves[padre, i] <- claves[padre, i + 1]
        hijos[padre, i + 1] <- hijos[padre, i + 2]
    FinPara
    numClaves[padre] <- numClaves[padre] - 1
    enUso[derecho] <- Falso
	
FinSubProceso
