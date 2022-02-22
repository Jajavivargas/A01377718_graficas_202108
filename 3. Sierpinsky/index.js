// Tarea Triángulo Sierpinsky
// Javier Alexandro Vargas Sanchez
// A01377718
function main()
{
    let canvas = document.getElementById("htmlCanvas");
    var slider = document.getElementById("myRange"); // Esta variable extrae el input de tipo range usado dentro del archivo html
    var output = document.getElementById("output");// Con esta variable tengo acceso al número que desplegaré cada que el slider se mueva
    var valor = slider.value // Por último con esta variable tengo acceso al valor seleccionado dentro del input range, su valor por default es cero
    if(!canvas){
        console.log("Failed to load the canvas element.")
        return;
    }
    
    let ctx = canvas.getContext("2d");
    // Las siguientes tres variables fueron utilizadas para crear un triángulo equilatero, los valores para cada variable
    //fueron escogidos con el propósito de crear el triángulo centrado en el canvas
    // "side" es la variable que indica la longitud de los 3 lados del triángulo
    let side = 500
    // "x" es la posición de inicio para dibujar el tríangulo en el eje de las abscisas
    let x = 150
    // "y" es la posición de inicio para dibujar el tríangulo en el eje de las ordenadas
    let y = 400 + Math.sin(Math.PI/3) * side / 2

    //Utilicé funciones anónimas porque de otra forma tenía que mandar el contexto a cada función
    //La utilidad de esta función es actualizar el canvas y el valor desplegado de subdivisiones 
    //cada que el slider se mueva
    slider.oninput = function() {
        output.innerHTML = this.value;
        valor= this.value
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawSierpinsky(x, y, side, valor, 0)
    }

    //Esta función sirve para dibujar cada triángulo en el canvas, recibe unas coordenadas de inicio en "x" y "y" 
    //así como la longitud que tendrá cada lado del triángulo
    const drawTriangle = (x, y, side) =>{
        ctx.fillStyle = 'rgba(196, 46, 112, 1.0)';
        ctx.beginPath(); 
        //El recorrido inicia en vértice inferior izquierdo
        ctx.moveTo(x, y); 
        //Avanza a la cúspide o punto central superior del triángulo
        ctx.lineTo(x + side/2, y - Math.sin(Math.PI / 3) * side);
        //Para terminar en la esquina inferior derecha, dibujando así un triángulo equilatero perfecto
        ctx.lineTo(x + side, y);
        ctx.fill();
    }
    //La función drawSierpinsky desempeña el rol esencial de este problema pues tiene la solución recursiva.
    //Recibe múltiples parámetros, "x" y "y" son el punto de inicio donde comenzaremos a dibujar nuestro triángulo
    //Side es la longitud que tendra nuestro triángulo en cada lado
    //Max representa la cantidad de subdivisiones definidas por el input slider
    //Step es una variable que funciona como un contador o iterador por ello su valor por default es cero
    const drawSierpinsky = (x, y, side, max, step) =>{
        //Primero tenemos nuestro caso base, aquí el propósito de "step" es que si "step" y "max" tienen el mismo valor, 
        //se dibujará un triángulo, es importante entender que solo cuando llegamos al caso base se dibuja realmente 
        if(step == max){
            drawTriangle(x, y, side)
        } else{

            // De lo contrario, "invocaremos" tres triángulos cuyas longitudes ("side") serán la mitad con respecto al 
            //tríangulo padre y los colocaremos en cada esquina (izquierda, derecha y arriba respectivamente) 
            //para así crear la forma del triángulo de sierpinsky.

            //Le sumamos 1 unidad al valor de "step" para que después de cada recursión nos acerquemos al caso base
            //y eventualmente concluyamos dibujando
            drawSierpinsky(x, y, side/2, max, step + 1)
            drawSierpinsky(x + side/2, y, side/2, max, step + 1)
            drawSierpinsky(x + side/4, y - Math.sin(Math.PI/3) * side/2, side/2, max, step + 1)
        }
    }
   
    //Por último debemos llamar a esta función para que se dibuje el primer gran tríangulo equilatero, ya que si recordamos
    //El canvas se actualiza cada que el slider se mueve, si no se mueve al iniciar la página, nada se dibujaría  
    drawSierpinsky(x, y, side, valor, 0)
}

