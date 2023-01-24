
let cliente = {
    mesa: '',
    hora: '',
    pedido: []
};

const categorias = {
    1: 'Comida',
    2: 'Bebidas',
    3: 'Postres'
}

const btnGuardarCliente = document.querySelector('#guardar-cliente');
btnGuardarCliente.addEventListener('click', guardarCliente);

function guardarCliente(){
    const mesa = document.querySelector('#mesa').value;
    const hora = document.querySelector('#hora').value;

    //ver si hay campos vacios
    const camposVacios = [mesa, hora].some(campo => campo === '')
        if(camposVacios){
            //verificar si existe una alerta
            const existeAlerta = document.querySelector('.invalid-feedback')
            if(!existeAlerta){
            const alerta = document.createElement('div');
            alerta.classList.add('invalid-feedback', 'd-block', 'text-center');
            alerta.textContent = 'Todos los campos son obligatorios. All fields are mandatory. ';
            document.querySelector('.modal-body form').appendChild(alerta);
            
            setTimeout(()=>{
                alerta.remove();
            }, 3000);
            }
            return;
        }
        //asignar datos del formulario a cliente
        //para que tome primero una copia del array cliente y despues le reescriba
        //las propiedades de mesa y hora
        cliente = {...cliente, mesa, hora}

        //ocultar ventana modal
        const modalFormulario = document.querySelector('#formulario');
        const modalBootstrap = bootstrap.Modal.getInstance(modalFormulario);
        modalBootstrap.hide();
       
        //mostrar las secciones
        mostrarSecciones();

        //obtener platos de la api de jsonserver
        obtenerPlatos();

        
}
function mostrarSecciones(){
    const seccionesOcultas = document.querySelectorAll('.d-none');
    seccionesOcultas.forEach(seccion => seccion.classList.remove('d-none'));

}

function obtenerPlatos(){
    //hay que activar el server con json-server --watch db.json --port 3000 en el terminal
    const url = "http://localhost:3000/platillos";
    fetch(url)
    .then(respuesta => respuesta.json())
    .then(resultado => mostrarPlatos(resultado))
    .catch(error => console.log(error))
}

function mostrarPlatos(platos){
    const contenido = document.querySelector('#platillos .contenido')

    platos.forEach(plato => {
        const row = document.createElement('div');
        //le doy clase de bootstrap row para poder acceder al grid
        row.classList.add('row', 'py-3', 'border-top');

        const nombre = document.createElement('div');
        nombre.classList.add('col-md-4');
        nombre.textContent = plato.nombre;

        const precio = document.createElement('div');
        precio.classList.add('col-md-3', 'fw-bold');
        precio.textContent = `${plato.precio} CLP`;

        const categoria = document.createElement('div');
        categoria.classList.add('col-md-3');
        //para leer las etiquetas de categorias 
        categoria.textContent = categorias[plato.categoria];
        
        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.min = 0;
        inputCantidad.value = 0;
        inputCantidad.id = `producto-${plato.id}`;
        inputCantidad.classList.add('form-control');

        //para detectar la cantidad y plato que se está agregando
        //pongo agregarplato dentro de function para poder llamar plato.id 
        //pero que la funcion solo funcione onchange, y no al abrir
        inputCantidad.onchange = function(){
            const cantidad = parseInt(inputCantidad.value);
            //spread operator en ...plato para que no duplique el plato por cantidad
            agregarPlato({...plato, cantidad});
        }

        const agregar = document.createElement('div');
        agregar.classList.add('col-md-2');
        agregar.appendChild(inputCantidad)
        
        row.appendChild(nombre);
        row.appendChild(precio);
        row.appendChild(categoria);
        row.appendChild(agregar);

        contenido.appendChild(row);
    } )
}

function agregarPlato(producto){
    //entraer el pedido actual
    let {pedido} = cliente;
    //revisar que la cantidad sea mayor a 0
    if(producto.cantidad > 0){
        //revisar si el articulo ya existe en el array para no repetirlo
        if(pedido.some(articulo => articulo.id === producto.id)){
            //actualizar la cantidad. map crea otra variable temporal
            const pedidoActualizado = pedido.map(articulo =>{
                if(articulo.id === producto.id){
                    articulo.cantidad = producto.cantidad;
                }
                //para que vaya asignando articulo al nuevo arreglo con return
                //lo coloco afuera del if porque si o si, va a retornar articulo
                //tanto si se cumple la condición como si no
                return articulo;
            });
            //se asigna el nuevo array a cliente.pedido
            cliente.pedido = [...pedidoActualizado];
        }else{
            //el articulo no existe, se agrega al array de pedido
        
        cliente.pedido =[...pedido, producto];
        }
    }else{
        //eliminar elementos si la cantidad cambia a 0
        //nos va a retornar los resultados diferentes al que estamos eliminando
        const resultado = pedido.filter(articulo => articulo.id !== producto.id);
        cliente.pedido = [...resultado];
    }
    //limpiar el html previo
    limpiarHTML();
    
    if(cliente.pedido.length){
        //mostrar el resumen del pedido
        actualizarResumen();
    }else{
        mensajePedidoVacio();
    }

    

        
}

function actualizarResumen(){
    const contenido = document.querySelector('#resumen .contenido');

    const resumen = document.createElement('div');
    resumen.classList.add('col-md-6', 'card', 'py-2', 'px-3', 'shadow');

    const mesa = document.createElement('p');
    mesa.textContent = 'Mesa: ';
    mesa.classList.add('fw-bold');

    const mesaSpan = document.createElement('span');
    mesaSpan.textContent = cliente.mesa;
    mesaSpan.classList.add('fw-normal');
    

    const hora = document.createElement('p');
    hora.textContent = 'Hora:';
    hora.classList.add('fw-bold');

    const horaSpan = document.createElement('span');
    horaSpan.textContent = cliente.hora;
    horaSpan.classList.add('fw-normal');


    mesa.appendChild(mesaSpan);
    hora.appendChild(horaSpan);

    //titulo de la sección
    const heading = document.createElement('h3');
    heading.textContent = 'Consumiciones';
    heading.classList.add('my-4', 'text-center');

    //iterar sobre el arreglo de pedidos
    const grupo = document.createElement('ul');
    grupo.classList.add('list-group');

    const {pedido} = cliente;
    pedido.forEach(articulo => {
        const {nombre, cantidad, precio, id} = articulo;
        const lista = document.createElement('li');
        lista.classList.add('list-group-item');

        const nombreElemento = document.createElement('h4');
        nombreElemento.classList.add('text-center', 'my-4');
        nombreElemento.textContent = nombre;

        //cantidad del artículo
        const cantidadElemento = document.createElement('p');
        cantidadElemento.classList.add('fw-bold');
        cantidadElemento.textContent = 'Cantidad: ';

        const cantidadValor = document.createElement('span');
        cantidadValor.classList.add('fw-normal');
        cantidadValor.textContent = cantidad;

        //precio del articulo
        const precioElemento = document.createElement('p');
        precioElemento.classList.add('fw-bold');
        precioElemento.textContent = 'Precio: ';

        const precioValor = document.createElement('span');
        precioValor.classList.add('fw-normal');
        precioValor.textContent = `${precio} CLP`;

        //subtotal del articulo
        const subtotalElemento = document.createElement('p');
        subtotalElemento.classList.add('fw-bold');
        subtotalElemento.textContent = 'Subtotal: '

        const subtotalValor = document.createElement('span');
        subtotalValor.classList.add('fw-normal');
        subtotalValor.textContent = calcularSubtotal(cantidad, precio);

        //boton para eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.classList.add('btn', 'btn-danger');
        btnEliminar.textContent = 'Eliminar del pedido';

        //function para eliminar del pedido
        //la function queda como callback (dentro de otra function) para que se ejecute
        //en onclick, y no automáticamente
        btnEliminar.onclick = function(){
            eliminarProducto(id)
        }

        //agregar valores a sus contenedores
        cantidadElemento.appendChild(cantidadValor);
        precioElemento.appendChild(precioValor);
        subtotalElemento.appendChild(subtotalValor);

        //agregar elementos al li
        lista.appendChild(nombreElemento);
        lista.appendChild(cantidadElemento);
        lista.appendChild(precioElemento);
        lista.appendChild(subtotalElemento);
        lista.appendChild(btnEliminar);


        //agregar lista al grupo principal
        grupo.appendChild(lista);
    })

    resumen.appendChild(heading);
    resumen.appendChild(mesa);
    resumen.appendChild(hora);
    resumen.appendChild(grupo);

    contenido.appendChild(resumen);

    //mostrar formulario de propinas
    formularioPropinas();
}

function limpiarHTML(){
    const contenido = document.querySelector('#resumen .contenido');
    while(contenido.firstChild){
        contenido.removeChild(contenido.firstChild);
    }
}

function calcularSubtotal(precio, cantidad){
    return `${precio * cantidad} CLP`;
}

function eliminarProducto(id){
    const {pedido} = cliente;
    const resultado = pedido.filter(articulo => articulo.id !== id);
    cliente.pedido = [...resultado];
    
    limpiarHTML();

    if(cliente.pedido.length){
        actualizarResumen();
    }else{
        mensajePedidoVacio();
    }
    
    //el producto se eliminó y la cantidad del formulario regresa a 0
    const productoEliminado = `#producto-${id}`; 
    const inputEliminado = document.querySelector(productoEliminado);
    inputEliminado.value = 0;
}

function mensajePedidoVacio () {
    const contenido = document.querySelector('#resumen .contenido');

    const texto = document.createElement('P');
    texto.classList.add('text-center');
    texto.textContent = 'Añade Productos al Pedido';

    contenido.appendChild(texto);
}

function formularioPropinas(){
    const contenido = document.querySelector('#resumen .contenido');
    const formulario = document.createElement('div');
    formulario.classList.add('col-md-6', 'formulario');

    const divFormulario = document.createElement('div');
    divFormulario.classList.add('card', 'py-2', 'px-3', 'shadow')

    const heading = document.createElement('h3');
    heading.classList.add('my-4', 'text-center');
    heading.textContent = 'Propina';

    //radio button 5%
    const radio5 = document.createElement('input');
    radio5.type = 'radio';
    radio5.name = 'propina';
    radio5.value = "5";
    radio5.classList.add('form-check-input');
    radio5.onclick = calcularPropina;

    const radio5Label = document.createElement('label');
    radio5Label.textContent = '5%';
    radio5Label.classList.add('form-check-label');

    const radio5Div = document.createElement('div');
    radio5Div.classList.add('form-check');

    radio5Div.appendChild(radio5);
    radio5Div.appendChild(radio5Label);

    //radio button 10%
    const radio10 = document.createElement('input');
    radio10.type = 'radio';
    radio10.name = 'propina';
    radio10.value = "10";
    radio10.classList.add('form-check-input');
    radio10.onclick = calcularPropina;

    const radio10Label = document.createElement('label');
    radio10Label.textContent = '10%';
    radio10Label.classList.add('form-check-label');

    const radio10Div = document.createElement('div');
    radio10Div.classList.add('form-check');

    radio10Div.appendChild(radio10);
    radio10Div.appendChild(radio10Label);

    //radio button 15%
    const radio15 = document.createElement('input');
    radio15.type = 'radio';
    radio15.name = 'propina';
    radio15.value = "15";
    radio15.classList.add('form-check-input');
    radio15.onclick = calcularPropina;

    const radio15Label = document.createElement('label');
    radio15Label.textContent = '15%';
    radio15Label.classList.add('form-check-label');

    const radio15Div = document.createElement('div');
    radio15Div.classList.add('form-check');

    radio15Div.appendChild(radio15);
    radio15Div.appendChild(radio15Label);

    //agregar al div principal
    divFormulario.appendChild(heading);
    divFormulario.appendChild(radio5Div);
    divFormulario.appendChild(radio10Div);
    divFormulario.appendChild(radio15Div);

    //agregar al formulario
    formulario.appendChild(divFormulario);
    
    contenido.appendChild(formulario);
}